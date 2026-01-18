/**
 * Search & Context Tools for AI Agent
 *
 * Tools 11-12: Advanced search and user context
 */

import type { ToolContext, ToolResult } from './types';
import { validateSearchQuery, validateNumber, validatePriority, validateStatus, validateArray } from '../utils/validation';

/**
 * Tool 11: Search Items Advanced
 *
 * Complex multi-filter search across all user tasks
 */
export async function searchItemsAdvanced(
  context: ToolContext,
  params: {
    query?: string;
    categories?: number[];
    tags?: string[];
    priority?: string;
    status?: string;
    limit?: number;
  }
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const limit = validateNumber(params.limit || 20, 'limit', 1, 100);

    let query = context.supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        category_id,
        priority,
        final_priority_score,
        status,
        due_date,
        due_time,
        custom_tags,
        created_at,
        updated_at,
        is_worry_spiral,
        categories!inner(name)
      `)
      .eq('user_id', context.userId)
      .order('final_priority_score', { ascending: false })
      .limit(limit);

    // Text search
    if (params.query) {
      const searchQuery = validateSearchQuery(params.query);
      // Use ilike for case-insensitive search on title and description
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Category filter
    if (params.categories && params.categories.length > 0) {
      const categoryIds = validateArray(params.categories, 'categories');
      query = query.in('category_id', categoryIds);
    }

    // Priority filter
    if (params.priority) {
      const priority = validatePriority(params.priority);
      query = query.eq('priority', priority);
    }

    // Status filter
    if (params.status) {
      const status = validateStatus(params.status);
      query = query.eq('status', status);
    } else {
      // Default to pending if no status specified
      query = query.eq('status', 'pending');
    }

    const { data: items, error } = await query;

    if (error) {
      return {
        success: false,
        error: `Failed to search items: ${error.message}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // Filter by tags (post-query since custom_tags is an array)
    let filteredItems = items || [];
    if (params.tags && params.tags.length > 0) {
      filteredItems = filteredItems.filter(item => {
        if (!item.custom_tags || !Array.isArray(item.custom_tags)) return false;
        return params.tags!.some(tag => item.custom_tags.includes(tag));
      });
    }

    // Format results
    const results = filteredItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: (item.categories as any)?.name || 'Unknown',
      priority: item.priority,
      priority_score: item.final_priority_score,
      status: item.status,
      due_date: item.due_date,
      due_time: item.due_time,
      tags: item.custom_tags || [],
      is_worry_spiral: item.is_worry_spiral,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));

    const summary = results.length > 0
      ? `Found ${results.length} items matching your search.`
      : 'No items found matching your search criteria.';

    return {
      success: true,
      data: {
        summary,
        count: results.length,
        items: results,
      },
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error searching items: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}

/**
 * Tool 12: Get User Context
 *
 * Retrieve comprehensive user profile for personalized responses
 * ALWAYS call this first in new conversations
 */
export async function getUserContext(
  context: ToolContext,
  params: Record<string, never> // No parameters
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    // Get user profile
    const { data: user, error: userError } = await context.supabase
      .from('users')
      .select('*')
      .eq('id', context.userId)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: `Failed to fetch user profile: ${userError?.message || 'User not found'}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // Get user preferences
    const { data: preferences } = await context.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', context.userId)
      .single();

    // Get statistics
    // Total items
    const { count: totalItems } = await context.supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', context.userId);

    // Completed items
    const { count: completedItems } = await context.supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', context.userId)
      .eq('status', 'completed');

    // Pending items
    const { count: pendingItems } = await context.supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', context.userId)
      .eq('status', 'pending');

    // Worry spirals
    const { count: worrySpi rals } = await context.supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', context.userId)
      .eq('is_worry_spiral', true);

    // Active days (days with any activity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentItems } = await context.supabase
      .from('items')
      .select('created_at')
      .eq('user_id', context.userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const activeDays = new Set(
      (recentItems || []).map(item =>
        new Date(item.created_at).toISOString().split('T')[0]
      )
    ).size;

    // Top categories (by item count)
    const { data: categoryStats } = await context.supabase
      .from('items')
      .select(`
        category_id,
        categories!inner(name)
      `)
      .eq('user_id', context.userId);

    const categoryMap = new Map<string, number>();
    categoryStats?.forEach(item => {
      const categoryName = (item.categories as any)?.name || 'Unknown';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
    });

    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    // Most used tags
    const { data: allItems } = await context.supabase
      .from('items')
      .select('custom_tags')
      .eq('user_id', context.userId);

    const tagMap = new Map<string, number>();
    allItems?.forEach(item => {
      if (item.custom_tags && Array.isArray(item.custom_tags)) {
        item.custom_tags.forEach((tag: string) => {
          tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        });
      }
    });

    const topTags = Array.from(tagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Compile context
    const userContext = {
      user_profile: {
        email: user.email,
        created_at: user.created_at,
        anxiety_type: user.anxiety_type,
        preferred_language: user.preferred_language,
        timezone: user.timezone,
        last_active: user.last_active_at,
      },
      preferences: preferences ? {
        theme: preferences.theme,
        enable_spiral_detection: preferences.enable_spiral_detection,
        enable_mood_tracking: preferences.enable_mood_tracking,
        ai_suggestion_level: preferences.ai_suggestion_level,
        notification_style: preferences.notification_style,
      } : null,
      statistics: {
        total_dumps: user.total_dumps || 0,
        total_items: totalItems || 0,
        completed_items: completedItems || 0,
        pending_items: pendingItems || 0,
        worry_spirals_captured: worrySpi rals || 0,
        active_days_last_30: activeDays,
        completion_rate: totalItems && totalItems > 0
          ? Math.round(((completedItems || 0) / totalItems) * 100)
          : 0,
      },
      top_categories: topCategories,
      top_tags: topTags,
    };

    return {
      success: true,
      data: userContext,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error getting user context: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}
