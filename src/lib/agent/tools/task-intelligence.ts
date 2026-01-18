/**
 * Task Intelligence Tools for AI Agent
 *
 * Tools 7-10: Upcoming deadlines, forgotten tasks, task breakdown suggestions, priority distribution
 */

import type { ToolContext, ToolResult } from './types';
import { toSqlDate, startOfDay, endOfDay, isOverdue } from '../utils/date-helpers';
import { validateNumber, validateBoolean, validateTimeRange } from '../utils/validation';
import { formatDeadlineInsights, formatForgottenTasksInsights, formatPriorityDistributionInsights } from '../utils/insights-generator';

/**
 * Tool 7: Get Upcoming Deadlines
 *
 * Prioritized deadlines with risk assessment
 */
export async function getUpcomingDeadlines(
  context: ToolContext,
  params: {
    days_ahead?: number;
    include_overdue?: boolean;
    min_priority_score?: number;
  }
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const daysAhead = validateNumber(params.days_ahead || 7, 'days_ahead', 1, 365);
    const includeOverdue = validateBoolean(params.include_overdue ?? true, 'include_overdue');
    const minPriority = validateNumber(params.min_priority_score || 0, 'min_priority_score', 0, 100);

    const today = startOfDay();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + daysAhead);

    // Base query builder function
    const buildQuery = () => {
      let query = context.supabase
        .from('items')
        .select(`
          id,
          title,
          due_date,
          due_time,
          priority,
          final_priority_score,
          category_id,
          categories!inner(name)
        `)
        .eq('user_id', context.userId)
        .neq('status', 'completed')  // Match UI logic: show all non-completed tasks
        .not('due_date', 'is', null);

      // Only filter by priority if > 0 (to include null values when min is 0)
      if (minPriority > 0) {
        query = query.gte('final_priority_score', minPriority);
      }

      return query;
    };

    // Overdue tasks
    let overdue: any[] = [];
    if (includeOverdue) {
      const { data: overdueData } = await buildQuery()
        .lt('due_date', toSqlDate(today));

      overdue = overdueData || [];
    }

    // Today's tasks
    const todayDateSql = toSqlDate(today);
    console.log('[getUpcomingDeadlines] Querying for today:', todayDateSql);

    const { data: todayData, error: todayError } = await buildQuery()
      .eq('due_date', todayDateSql);

    if (todayError) {
      console.error('[getUpcomingDeadlines] Error fetching today tasks:', todayError);
    }

    const todayTasks = todayData || [];
    console.log('[getUpcomingDeadlines] Found today tasks:', todayTasks.length, todayTasks);

    // Urgent (tomorrow to 3 days)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDaysOut = new Date(today);
    threeDaysOut.setDate(threeDaysOut.getDate() + 3);

    const { data: urgentData } = await buildQuery()
      .gte('due_date', toSqlDate(tomorrow))
      .lte('due_date', toSqlDate(threeDaysOut));

    const urgent = urgentData || [];

    // Upcoming (4 days to days_ahead)
    const fourDaysOut = new Date(today);
    fourDaysOut.setDate(fourDaysOut.getDate() + 4);

    const { data: upcomingData } = await buildQuery()
      .gte('due_date', toSqlDate(fourDaysOut))
      .lte('due_date', toSqlDate(endDate));

    const upcoming = upcomingData || [];

    const insights = formatDeadlineInsights({
      overdue,
      today: todayTasks,
      urgent,
      upcoming,
    });

    return {
      success: true,
      data: insights,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error getting upcoming deadlines: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}

/**
 * Tool 8: Get Forgotten Tasks
 *
 * Tasks untouched for extended periods
 */
export async function getForgottenTasks(
  context: ToolContext,
  params: {
    days_untouched?: number;
    exclude_worries?: boolean;
  }
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const daysUntouched = validateNumber(params.days_untouched || 14, 'days_untouched', 1, 365);
    const excludeWorries = validateBoolean(params.exclude_worries ?? true, 'exclude_worries');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysUntouched);

    let query = context.supabase
      .from('items')
      .select(`
        id,
        title,
        updated_at,
        category_id,
        categories!inner(name)
      `)
      .eq('user_id', context.userId)
      .eq('status', 'pending')
      .lte('updated_at', toSqlDate(cutoffDate))
      .order('updated_at', { ascending: true });

    // Exclude worries vault if requested
    if (excludeWorries) {
      // Get worries vault category ID
      const { data: categories } = await context.supabase
        .from('categories')
        .select('id')
        .eq('name', 'Worries Vault')
        .single();

      if (categories) {
        query = query.neq('category_id', categories.id);
      }
    }

    const { data: items, error } = await query;

    if (error) {
      return {
        success: false,
        error: `Failed to fetch forgotten tasks: ${error.message}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // Calculate days untouched for each
    const now = new Date();
    const tasks = (items || []).map(item => {
      const lastUpdated = new Date(item.updated_at);
      const daysUntouched = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

      return {
        title: item.title,
        category: (item.categories as any)?.name || 'Unknown',
        days_untouched: daysUntouched,
        last_updated: lastUpdated,
      };
    });

    const insights = formatForgottenTasksInsights(tasks);

    return {
      success: true,
      data: insights,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error getting forgotten tasks: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}

/**
 * Tool 9: Suggest Task Breakdown
 *
 * High-priority tasks that could benefit from subtasks
 */
export async function suggestTaskBreakdown(
  context: ToolContext,
  params: {
    min_priority_score?: number;
    max_results?: number;
  }
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const minPriority = validateNumber(params.min_priority_score || 60, 'min_priority_score', 0, 100);
    const maxResults = validateNumber(params.max_results || 5, 'max_results', 1, 20);

    // Query high-priority tasks without subtasks
    const { data: items, error } = await context.supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        final_priority_score,
        category_id,
        categories!inner(name)
      `)
      .eq('user_id', context.userId)
      .eq('status', 'pending')
      .gte('final_priority_score', minPriority)
      .is('parent_task_id', null) // Only parent tasks, not subtasks
      .order('final_priority_score', { ascending: false })
      .limit(maxResults);

    if (error) {
      return {
        success: false,
        error: `Failed to fetch tasks for breakdown: ${error.message}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    if (!items || items.length === 0) {
      return {
        success: true,
        data: {
          summary: `No high-priority tasks (above ${minPriority}) found that need breaking down right now.`,
          tasks: [],
        },
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // For each task, check if it already has subtasks
    const tasksNeedingBreakdown = await Promise.all(
      items.map(async task => {
        const { count: subtaskCount } = await context.supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('parent_task_id', task.id);

        return {
          task,
          hasSubtasks: (subtaskCount || 0) > 0,
        };
      })
    );

    // Filter to tasks without subtasks
    const tasks = tasksNeedingBreakdown
      .filter(t => !t.hasSubtasks)
      .map(t => ({
        id: t.task.id,
        title: t.task.title,
        description: t.task.description,
        priority_score: t.task.final_priority_score,
        category: (t.task.categories as any)?.name || 'Unknown',
        suggested_breakdown: generateBreakdownSuggestion(t.task.title, t.task.description),
      }));

    const summary = tasks.length > 0
      ? `I found ${tasks.length} high-priority tasks that might benefit from being broken into smaller steps. Breaking them down can make starting easier.`
      : `All your high-priority tasks either have subtasks already or are specific enough.`;

    return {
      success: true,
      data: {
        summary,
        tasks,
      },
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error suggesting task breakdown: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}

/**
 * Helper function to generate breakdown suggestions
 * (Simple heuristic-based - could be enhanced with AI in future)
 */
function generateBreakdownSuggestion(title: string, description?: string): string[] {
  // Simple heuristic: suggest breaking down based on common patterns
  const suggestions: string[] = [];

  // If title mentions multiple actions, suggest separating them
  if (title.includes(' and ') || title.includes(',')) {
    suggestions.push('Break this into separate tasks for each action');
  }

  // Common breakdown patterns
  if (title.toLowerCase().includes('write') || title.toLowerCase().includes('create')) {
    suggestions.push('1. Outline and plan');
    suggestions.push('2. Draft first version');
    suggestions.push('3. Review and edit');
  } else if (title.toLowerCase().includes('project') || title.toLowerCase().includes('plan')) {
    suggestions.push('1. Define goals and requirements');
    suggestions.push('2. Break into actionable steps');
    suggestions.push('3. Execute each step');
    suggestions.push('4. Review and complete');
  } else {
    // Generic breakdown
    suggestions.push('1. Gather materials/information needed');
    suggestions.push('2. Start with the smallest first step');
    suggestions.push('3. Complete remaining steps');
  }

  return suggestions;
}

/**
 * Tool 10: Get Priority Distribution
 *
 * Task distribution by priority level
 */
export async function getPriorityDistribution(
  context: ToolContext,
  params: {
    include_completed?: boolean;
    time_range?: string;
  }
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const includeCompleted = validateBoolean(params.include_completed ?? false, 'include_completed');
    const timeRange = params.time_range ? validateTimeRange(params.time_range) : null;

    let query = context.supabase
      .from('items')
      .select('priority', { count: 'exact' })
      .eq('user_id', context.userId);

    // Filter by status
    if (includeCompleted) {
      query = query.in('status', ['pending', 'completed']);
    } else {
      query = query.eq('status', 'pending');
    }

    // Filter by time range if specified
    if (timeRange) {
      const { getDateRange } = await import('../utils/date-helpers');
      const { start, end } = getDateRange(timeRange);
      query = query.gte('created_at', toSqlDate(start)).lte('created_at', toSqlDate(end));
    }

    const { data: items, error } = await query;

    if (error) {
      return {
        success: false,
        error: `Failed to fetch priority distribution: ${error.message}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // Count by priority
    const distribution = {
      high: 0,
      medium: 0,
      low: 0,
      total: items?.length || 0,
    };

    items?.forEach(item => {
      const priority = item.priority as 'high' | 'medium' | 'low';
      distribution[priority] += 1;
    });

    const insights = formatPriorityDistributionInsights(distribution);

    return {
      success: true,
      data: insights,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error getting priority distribution: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}
