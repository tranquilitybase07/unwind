/**
 * Habit Analysis Tools for AI Agent
 *
 * Tools 1-3: Analyze completion patterns, procrastination trends, and recurring adherence
 */

import type { ToolContext, ToolResult, TimeRange } from './types';
import { getDateRange, toSqlDate } from '../utils/date-helpers';
import { validateTimeRange, validateCategoryId, validateBoolean, validateNumber } from '../utils/validation';
import { formatCompletionInsights, formatProcrastinationInsights, formatRecurringAdherenceInsights } from '../utils/insights-generator';

/**
 * Tool 1: Analyze Completion Patterns
 *
 * Shows completion stats, procrastination rates, mood correlation
 */
export async function analyzeCompletionPatterns(
  context: ToolContext,
  params: {
    time_range?: string;
    category_id?: number;
    include_mood_correlation?: boolean;
  }
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    // Validate parameters
    const timeRange = validateTimeRange(params.time_range || 'week');
    const categoryId = params.category_id ? validateCategoryId(params.category_id) : null;
    const includeMood = validateBoolean(params.include_mood_correlation ?? true, 'include_mood_correlation');

    const { start, end } = getDateRange(timeRange);

    // Query completion log for the time range
    let query = context.supabase
      .from('completions_log')
      .select(`
        id,
        user_id,
        item_id,
        completed_at,
        user_mood_before,
        user_mood_after,
        completion_time_minutes,
        was_procrastinated,
        procrastination_duration_hours,
        items!inner(
          category_id,
          categories!inner(name)
        )
      `)
      .eq('user_id', context.userId)
      .gte('completed_at', toSqlDate(start))
      .lte('completed_at', toSqlDate(end));

    if (categoryId) {
      query = query.eq('items.category_id', categoryId);
    }

    const { data: completions, error: completionsError } = await query;

    if (completionsError) {
      return {
        success: false,
        error: `Failed to fetch completions: ${completionsError.message}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // Query total items in this time range
    let itemsQuery = context.supabase
      .from('items')
      .select('id, category_id, categories!inner(name)', { count: 'exact' })
      .eq('user_id', context.userId)
      .gte('created_at', toSqlDate(start))
      .lte('created_at', toSqlDate(end))
      .in('status', ['pending', 'completed']);

    if (categoryId) {
      itemsQuery = itemsQuery.eq('category_id', categoryId);
    }

    const { count: totalItems, error: itemsError } = await itemsQuery;

    if (itemsError) {
      return {
        success: false,
        error: `Failed to fetch items: ${itemsError.message}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // Calculate statistics
    const completedCount = completions?.length || 0;
    const total = totalItems || 0;
    const completionRate = total > 0 ? completedCount / total : 0;

    // Average completion time
    const timesWithData = completions?.filter(c => c.completion_time_minutes) || [];
    const avgCompletionTime = timesWithData.length > 0
      ? timesWithData.reduce((sum, c) => sum + (c.completion_time_minutes || 0), 0) / timesWithData.length / 60 // Convert to hours
      : undefined;

    // Group by category
    const byCategory: { category: string; completed: number; total: number }[] = [];
    if (completions) {
      const categoryMap = new Map<string, { completed: number; total: number }>();

      completions.forEach(c => {
        const categoryName = (c.items as any)?.categories?.name || 'Unknown';
        const current = categoryMap.get(categoryName) || { completed: 0, total: 0 };
        current.completed += 1;
        categoryMap.set(categoryName, current);
      });

      categoryMap.forEach((stats, category) => {
        byCategory.push({ category, ...stats });
      });
    }

    // Mood correlation (if requested)
    let byMood: { mood: string; completed: number; total: number }[] | undefined;
    if (includeMood && completions) {
      const moodMap = new Map<string, number>();

      completions.forEach(c => {
        const mood = c.user_mood_before || 'unknown';
        moodMap.set(mood, (moodMap.get(mood) || 0) + 1);
      });

      byMood = Array.from(moodMap.entries()).map(([mood, count]) => ({
        mood,
        completed: count,
        total: count, // For mood, we only have completed tasks
      }));
    }

    // Format insights
    const insights = formatCompletionInsights({
      total,
      completed: completedCount,
      completion_rate: completionRate,
      avg_completion_time_hours: avgCompletionTime,
      by_category: byCategory.length > 0 ? byCategory : undefined,
      by_mood: byMood,
    });

    return {
      success: true,
      data: insights,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error analyzing completion patterns: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}

/**
 * Tool 2: Analyze Procrastination Trends
 *
 * Identifies which tasks get procrastinated and why
 */
export async function analyzeProcrastinationTrends(
  context: ToolContext,
  params: {
    min_procrastination_hours?: number;
    include_patterns?: boolean;
  }
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const minHours = validateNumber(params.min_procrastination_hours || 48, 'min_procrastination_hours', 1, 10000);
    const includePatterns = validateBoolean(params.include_patterns ?? true, 'include_patterns');

    // Query items that have been pending for longer than min hours
    const minDate = new Date();
    minDate.setHours(minDate.getHours() - minHours);

    const { data: items, error } = await context.supabase
      .from('items')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        category_id,
        emotional_weight_score,
        custom_tags,
        categories!inner(name)
      `)
      .eq('user_id', context.userId)
      .eq('status', 'pending')
      .lte('created_at', toSqlDate(minDate));

    if (error) {
      return {
        success: false,
        error: `Failed to fetch procrastinated tasks: ${error.message}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // Calculate days procrastinated for each
    const procrastinatedTasks = items.map(item => {
      const created = new Date(item.created_at);
      const now = new Date();
      const daysProcrastinated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

      return {
        title: item.title,
        category: (item.categories as any)?.name || 'Unknown',
        days_procrastinated: daysProcrastinated,
        emotional_weight: item.emotional_weight_score,
      };
    });

    // Analyze patterns if requested
    let commonPatterns: { category: string; count: number; avg_delay_days: number }[] | undefined;

    if (includePatterns) {
      const patternMap = new Map<string, { count: number; totalDays: number }>();

      procrastinatedTasks.forEach(task => {
        const current = patternMap.get(task.category) || { count: 0, totalDays: 0 };
        current.count += 1;
        current.totalDays += task.days_procrastinated;
        patternMap.set(task.category, current);
      });

      commonPatterns = Array.from(patternMap.entries())
        .map(([category, stats]) => ({
          category,
          count: stats.count,
          avg_delay_days: Math.round(stats.totalDays / stats.count),
        }))
        .sort((a, b) => b.count - a.count);
    }

    // Format insights
    const insights = formatProcrastinationInsights({
      procrastinated_tasks: procrastinatedTasks,
      common_patterns: commonPatterns,
    });

    return {
      success: true,
      data: insights,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error analyzing procrastination trends: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}

/**
 * Tool 3: Analyze Recurring Adherence
 *
 * Tracks habit consistency
 */
export async function analyzeRecurringAdherence(
  context: ToolContext,
  params: {
    time_range?: string;
  }
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const timeRange = validateTimeRange(params.time_range || 'month');
    const { start, end } = getDateRange(timeRange);

    // Query recurring items
    const { data: recurringItems, error: recurringError } = await context.supabase
      .from('recurring_items')
      .select(`
        id,
        frequency,
        times_per_week,
        custom_interval_days,
        item_id,
        items!inner(
          title,
          user_id
        )
      `)
      .eq('items.user_id', context.userId)
      .eq('is_active', true);

    if (recurringError) {
      return {
        success: false,
        error: `Failed to fetch recurring items: ${recurringError.message}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    if (!recurringItems || recurringItems.length === 0) {
      return {
        success: true,
        data: formatRecurringAdherenceInsights({
          total_recurring: 0,
          adherence_rate: 0,
          tasks: [],
        }),
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // For each recurring item, calculate expected vs actual completions
    const tasks = await Promise.all(
      recurringItems.map(async recurring => {
        // Calculate expected completions based on frequency
        const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        let expectedCompletions = 0;

        switch (recurring.frequency) {
          case 'daily':
            expectedCompletions = daysDiff;
            break;
          case 'weekly':
            expectedCompletions = Math.floor(daysDiff / 7);
            break;
          case 'biweekly':
            expectedCompletions = Math.floor(daysDiff / 14);
            break;
          case 'monthly':
            expectedCompletions = Math.floor(daysDiff / 30);
            break;
          case 'custom':
            if (recurring.times_per_week) {
              expectedCompletions = Math.floor((daysDiff / 7) * recurring.times_per_week);
            } else if (recurring.custom_interval_days) {
              expectedCompletions = Math.floor(daysDiff / recurring.custom_interval_days);
            }
            break;
        }

        // Query actual completions
        const { count: actualCompletions } = await context.supabase
          .from('completions_log')
          .select('*', { count: 'exact', head: true })
          .eq('item_id', recurring.item_id)
          .gte('completed_at', toSqlDate(start))
          .lte('completed_at', toSqlDate(end));

        const adherenceRate = expectedCompletions > 0
          ? (actualCompletions || 0) / expectedCompletions
          : 0;

        return {
          title: (recurring.items as any)?.title || 'Unknown',
          expected_completions: expectedCompletions,
          actual_completions: actualCompletions || 0,
          adherence_rate: adherenceRate,
        };
      })
    );

    // Calculate overall adherence rate
    const totalExpected = tasks.reduce((sum, t) => sum + t.expected_completions, 0);
    const totalActual = tasks.reduce((sum, t) => sum + t.actual_completions, 0);
    const overallAdherence = totalExpected > 0 ? totalActual / totalExpected : 0;

    const insights = formatRecurringAdherenceInsights({
      total_recurring: recurringItems.length,
      adherence_rate: overallAdherence,
      tasks,
    });

    return {
      success: true,
      data: insights,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error analyzing recurring adherence: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}
