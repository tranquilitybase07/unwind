/**
 * Anxiety Insights Tools for AI Agent
 *
 * Tools 4-6: Analyze worry spirals, mood timeline, and emotional triggers
 */

import type { ToolContext, ToolResult, TimeRange, Granularity } from './types';
import { getDateRange, toSqlDate } from '../utils/date-helpers';
import { validateTimeRange, validateNumber, validateGranularity } from '../utils/validation';
import { formatWorrySpiralInsights, formatMoodInsights } from '../utils/insights-generator';

/**
 * Tool 4: Analyze Worry Spirals
 *
 * Patterns and triggers for worry spirals
 */
export async function analyzeWorrySpi rals(
  context: ToolContext,
  params: {
    time_range?: string;
    limit?: number;
  }
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const timeRange = validateTimeRange(params.time_range || 'month');
    const limit = validateNumber(params.limit || 10, 'limit', 1, 50);

    const { start, end } = getDateRange(timeRange);

    // Query items marked as worry spirals
    const { data: spirals, error } = await context.supabase
      .from('items')
      .select(`
        id,
        title,
        created_at,
        spiral_breakdown,
        worry_acknowledgment_text,
        category_id,
        categories!inner(name)
      `)
      .eq('user_id', context.userId)
      .eq('is_worry_spiral', true)
      .gte('created_at', toSqlDate(start))
      .lte('created_at', toSqlDate(end))
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return {
        success: false,
        error: `Failed to fetch worry spirals: ${error.message}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // Parse spiral breakdowns and extract patterns
    const recentSpirals = (spirals || []).map(spiral => {
      let spiralChain: string[] = [];
      let trigger: string | undefined;

      if (spiral.spiral_breakdown) {
        try {
          const breakdown = typeof spiral.spiral_breakdown === 'string'
            ? JSON.parse(spiral.spiral_breakdown)
            : spiral.spiral_breakdown;

          spiralChain = breakdown.chain || breakdown.steps || [spiral.title];
          trigger = breakdown.trigger || breakdown.initial_thought;
        } catch {
          spiralChain = [spiral.title];
        }
      } else {
        spiralChain = [spiral.title];
      }

      return {
        created_at: new Date(spiral.created_at),
        spiral_chain: spiralChain,
        trigger,
      };
    });

    // Extract common triggers
    const triggers = recentSpirals
      .map(s => s.trigger)
      .filter((t): t is string => !!t);

    const commonTriggers = Array.from(new Set(triggers)).slice(0, 5);

    const insights = formatWorrySpiralInsights({
      total_spirals: spirals?.length || 0,
      recent_spirals: recentSpirals,
      common_triggers: commonTriggers.length > 0 ? commonTriggers : undefined,
    });

    return {
      success: true,
      data: insights,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error analyzing worry spirals: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}

/**
 * Tool 5: Get Mood Timeline
 *
 * Stress/anxiety levels over time with task correlation
 */
export async function getMoodTimeline(
  context: ToolContext,
  params: {
    time_range?: string;
    granularity?: string;
  }
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const timeRange = validateTimeRange(params.time_range || 'month');
    const granularity = validateGranularity(params.granularity || 'daily');

    const { start, end } = getDateRange(timeRange);

    // Query mood tracking data
    const { data: moodData, error: moodError } = await context.supabase
      .from('mood_tracking')
      .select('*')
      .eq('user_id', context.userId)
      .gte('capture_time', toSqlDate(start))
      .lte('capture_time', toSqlDate(end))
      .order('capture_time', { ascending: true });

    if (moodError) {
      return {
        success: false,
        error: `Failed to fetch mood data: ${moodError.message}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    if (!moodData || moodData.length === 0) {
      return {
        success: true,
        data: {
          summary: "No mood tracking data found for this time period. Consider tracking your mood to see patterns.",
          timeline: [],
          average_mood: 0,
        },
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // Group mood data by granularity
    const groupedData = new Map<string, {
      dates: Date[];
      moodScores: number[];
      stressLevels: number[];
      anxietyLevels: number[];
    }>();

    moodData.forEach(entry => {
      const date = new Date(entry.capture_time);
      let key: string;

      switch (granularity) {
        case 'hourly':
          key = `${date.toISOString().split('T')[0]} ${date.getHours()}:00`;
          break;
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
      }

      const group = groupedData.get(key) || {
        dates: [],
        moodScores: [],
        stressLevels: [],
        anxietyLevels: [],
      };

      group.dates.push(date);
      if (entry.stress_level) group.stressLevels.push(entry.stress_level);
      if (entry.anxiety_level) group.anxietyLevels.push(entry.anxiety_level);

      groupedData.set(key, group);
    });

    // Calculate averages and get completions for each period
    const timeline = await Promise.all(
      Array.from(groupedData.entries()).map(async ([key, group]) => {
        const avgStress = group.stressLevels.length > 0
          ? group.stressLevels.reduce((a, b) => a + b, 0) / group.stressLevels.length
          : 0;

        const avgAnxiety = group.anxietyLevels.length > 0
          ? group.anxietyLevels.reduce((a, b) => a + b, 0) / group.anxietyLevels.length
          : 0;

        // Combined mood score (inverse - lower stress/anxiety = higher mood)
        const moodScore = 10 - ((avgStress + avgAnxiety) / 2);

        // Get completions for this period
        const periodStart = group.dates[0];
        const periodEnd = group.dates[group.dates.length - 1];

        const { count: completedTasks } = await context.supabase
          .from('completions_log')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', context.userId)
          .gte('completed_at', toSqlDate(periodStart))
          .lte('completed_at', toSqlDate(periodEnd));

        // Get worry spirals for this period
        const { count: worrySpirals } = await context.supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', context.userId)
          .eq('is_worry_spiral', true)
          .gte('created_at', toSqlDate(periodStart))
          .lte('created_at', toSqlDate(periodEnd));

        return {
          date: periodStart,
          mood_score: Math.round(moodScore * 10) / 10,
          completed_tasks: completedTasks || 0,
          worry_spirals: worrySpirals || 0,
        };
      })
    );

    // Calculate overall statistics
    const avgMood = timeline.reduce((sum, t) => sum + t.mood_score, 0) / timeline.length;

    // Find best and tough days
    const sortedByMood = [...timeline].sort((a, b) => b.mood_score - a.mood_score);
    const bestDays = sortedByMood.slice(0, 3).map(t => t.date);
    const toughDays = sortedByMood.slice(-3).reverse().map(t => t.date);

    const insights = formatMoodInsights({
      timeline,
      average_mood: avgMood,
      best_days: bestDays,
      tough_days: toughDays,
    });

    return {
      success: true,
      data: insights,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error getting mood timeline: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}

/**
 * Tool 6: Identify Emotional Triggers
 *
 * Which task types trigger highest anxiety
 */
export async function identifyEmotionalTriggers(
  context: ToolContext,
  params: {
    min_emotional_weight?: number;
    time_range?: string;
  }
): Promise<ToolResult> {
  const startTime = Date.now();

  try {
    const minWeight = validateNumber(params.min_emotional_weight || 50, 'min_emotional_weight', 0, 100);
    const timeRange = validateTimeRange(params.time_range || 'month');

    const { start, end } = getDateRange(timeRange);

    // Query items with high emotional weight
    const { data: items, error } = await context.supabase
      .from('items')
      .select(`
        id,
        title,
        category_id,
        emotional_weight_score,
        custom_tags,
        is_worry_spiral,
        categories!inner(name)
      `)
      .eq('user_id', context.userId)
      .gte('emotional_weight_score', minWeight)
      .gte('created_at', toSqlDate(start))
      .lte('created_at', toSqlDate(end));

    if (error) {
      return {
        success: false,
        error: `Failed to fetch emotional triggers: ${error.message}`,
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    if (!items || items.length === 0) {
      return {
        success: true,
        data: {
          summary: `No tasks with emotional weight above ${minWeight} found in this time period.`,
          triggers_by_category: [],
          triggers_by_tag: [],
        },
        metadata: { execution_time_ms: Date.now() - startTime },
      };
    }

    // Group by category
    const categoryMap = new Map<string, {
      count: number;
      avgEmotionalWeight: number;
      spiralCount: number;
    }>();

    items.forEach(item => {
      const categoryName = (item.categories as any)?.name || 'Unknown';
      const current = categoryMap.get(categoryName) || {
        count: 0,
        avgEmotionalWeight: 0,
        spiralCount: 0,
      };

      current.count += 1;
      current.avgEmotionalWeight += item.emotional_weight_score;
      if (item.is_worry_spiral) current.spiralCount += 1;

      categoryMap.set(categoryName, current);
    });

    const triggersByCategory = Array.from(categoryMap.entries())
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        avg_emotional_weight: Math.round(stats.avgEmotionalWeight / stats.count),
        spiral_count: stats.spiralCount,
        spiral_rate: stats.count > 0 ? Math.round((stats.spiralCount / stats.count) * 100) : 0,
      }))
      .sort((a, b) => b.avg_emotional_weight - a.avg_emotional_weight);

    // Group by tags
    const tagMap = new Map<string, {
      count: number;
      avgEmotionalWeight: number;
    }>();

    items.forEach(item => {
      if (item.custom_tags && Array.isArray(item.custom_tags)) {
        item.custom_tags.forEach((tag: string) => {
          const current = tagMap.get(tag) || {
            count: 0,
            avgEmotionalWeight: 0,
          };

          current.count += 1;
          current.avgEmotionalWeight += item.emotional_weight_score;

          tagMap.set(tag, current);
        });
      }
    });

    const triggersByTag = Array.from(tagMap.entries())
      .map(([tag, stats]) => ({
        tag,
        count: stats.count,
        avg_emotional_weight: Math.round(stats.avgEmotionalWeight / stats.count),
      }))
      .sort((a, b) => b.avg_emotional_weight - a.avg_emotional_weight)
      .slice(0, 10); // Top 10 tags

    const summary = `I found ${items.length} tasks with high emotional weight. ` +
      `${triggersByCategory[0]?.category || 'Tasks'} tend to carry the most emotional weight for you.`;

    return {
      success: true,
      data: {
        summary,
        total_high_emotion_tasks: items.length,
        triggers_by_category: triggersByCategory,
        triggers_by_tag: triggersByTag.length > 0 ? triggersByTag : undefined,
      },
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error identifying emotional triggers: ${(error as Error).message}`,
      metadata: { execution_time_ms: Date.now() - startTime },
    };
  }
}
