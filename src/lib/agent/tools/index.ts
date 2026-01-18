/**
 * AI Agent Tools Registry
 *
 * Central export for all 12 agent tools
 */

// Habit Analysis Tools (3)
export {
  analyzeCompletionPatterns,
  analyzeProcrastinationTrends,
  analyzeRecurringAdherence,
} from './habit-analysis';

// Anxiety Insights Tools (3)
export {
  analyzeWorrySpi rals,
  getMoodTimeline,
  identifyEmotionalTriggers,
} from './anxiety-insights';

// Task Intelligence Tools (4)
export {
  getUpcomingDeadlines,
  getForgottenTasks,
  suggestTaskBreakdown,
  getPriorityDistribution,
} from './task-intelligence';

// Search & Context Tools (2)
export {
  searchItemsAdvanced,
  getUserContext,
} from './search-context';

// Types
export type { ToolContext, ToolResult } from './types';

/**
 * Tool execution function type
 */
export type ToolExecutor = (
  context: ToolContext,
  params: Record<string, any>
) => Promise<ToolResult>;

/**
 * Tool registry mapping function names to executors
 */
import { analyzeCompletionPatterns, analyzeProcrastinationTrends, analyzeRecurringAdherence } from './habit-analysis';
import { analyzeWorrySpi rals, getMoodTimeline, identifyEmotionalTriggers } from './anxiety-insights';
import { getUpcomingDeadlines, getForgottenTasks, suggestTaskBreakdown, getPriorityDistribution } from './task-intelligence';
import { searchItemsAdvanced, getUserContext } from './search-context';
import type { ToolContext, ToolResult } from './types';

export const TOOL_EXECUTORS: Record<string, ToolExecutor> = {
  // Habit Analysis
  'analyze_completion_patterns': analyzeCompletionPatterns,
  'analyze_procrastination_trends': analyzeProcrastinationTrends,
  'analyze_recurring_adherence': analyzeRecurringAdherence,

  // Anxiety Insights
  'analyze_worry_spirals': analyzeWorrySpi rals,
  'get_mood_timeline': getMoodTimeline,
  'identify_emotional_triggers': identifyEmotionalTriggers,

  // Task Intelligence
  'get_upcoming_deadlines': getUpcomingDeadlines,
  'get_forgotten_tasks': getForgottenTasks,
  'suggest_task_breakdown': suggestTaskBreakdown,
  'get_priority_distribution': getPriorityDistribution,

  // Search & Context
  'search_items_advanced': searchItemsAdvanced,
  'get_user_context': getUserContext,
};

/**
 * Get tool executor by name
 */
export function getToolExecutor(name: string): ToolExecutor | null {
  return TOOL_EXECUTORS[name] || null;
}

/**
 * Check if a tool name is valid
 */
export function isValidTool(name: string): boolean {
  return name in TOOL_EXECUTORS;
}

/**
 * Get all tool names
 */
export function getAllToolNames(): string[] {
  return Object.keys(TOOL_EXECUTORS);
}
