/**
 * OpenAI Function Tool Schemas
 *
 * Defines all 12 tools available to the AI agent for analyzing user mental health data.
 * These schemas are used by OpenAI's function calling to determine when and how to use each tool.
 */

import type { FunctionTool } from 'openai/resources/beta/assistants';

/**
 * Habit Analysis Tools (3)
 */

export const analyzeCompletionPatterns: FunctionTool = {
  type: 'function',
  function: {
    name: 'analyze_completion_patterns',
    description:
      'Analyzes task completion patterns including completion rates, average completion times, and correlations with mood and categories. Use this when users ask about their productivity, how they\'re doing, or completion trends.',
    parameters: {
      type: 'object',
      properties: {
        time_range: {
          type: 'string',
          enum: ['today', 'week', 'month', 'quarter', 'year', 'all'],
          description: 'Time period to analyze. Default: week',
        },
        category_id: {
          type: 'number',
          description:
            'Optional: Filter by specific category (1=Tasks, 2=Ideas, 3=Errands, 4=Health, 5=Relationships, 6=Worries, 7=Recurring)',
        },
        include_mood_correlation: {
          type: 'boolean',
          description: 'Include correlation between mood and completion rates. Default: true',
        },
      },
      required: [],
    },
  },
};

export const analyzeProcrastinationTrends: FunctionTool = {
  type: 'function',
  function: {
    name: 'analyze_procrastination_trends',
    description:
      'Identifies tasks that are being procrastinated (created but not completed for extended periods) and reveals patterns in what types of tasks get avoided. Use when users ask why they procrastinate or what they tend to avoid.',
    parameters: {
      type: 'object',
      properties: {
        min_procrastination_hours: {
          type: 'number',
          description: 'Minimum hours a task must be pending to be considered procrastinated. Default: 48',
        },
        include_patterns: {
          type: 'boolean',
          description:
            'Include analysis of common patterns (categories, tags, emotional weight). Default: true',
        },
      },
      required: [],
    },
  },
};

export const analyzeRecurringAdherence: FunctionTool = {
  type: 'function',
  function: {
    name: 'analyze_recurring_adherence',
    description:
      'Tracks how well the user is sticking to recurring tasks/habits by comparing expected vs. actual completions. Use when users ask about habits, routines, or consistency.',
    parameters: {
      type: 'object',
      properties: {
        time_range: {
          type: 'string',
          enum: ['week', 'month', 'quarter', 'year', 'all'],
          description: 'Time period to analyze. Default: month',
        },
      },
      required: [],
    },
  },
};

/**
 * Anxiety Insights Tools (3)
 */

export const analyzeWorrySpirals: FunctionTool = {
  type: 'function',
  function: {
    name: 'analyze_worry_spirals',
    description:
      'Analyzes captured worry spirals to identify patterns, triggers, and common themes in catastrophic thinking. Use when users ask about anxiety patterns, spirals, or what triggers their worries.',
    parameters: {
      type: 'object',
      properties: {
        time_range: {
          type: 'string',
          enum: ['today', 'week', 'month', 'quarter', 'year', 'all'],
          description: 'Time period to analyze. Default: month',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of recent spirals to return. Default: 10',
        },
      },
      required: [],
    },
  },
};

export const getMoodTimeline: FunctionTool = {
  type: 'function',
  function: {
    name: 'get_mood_timeline',
    description:
      'Retrieves mood/stress levels over time with correlation to task completion and worry spirals. Use when users ask about their mood trends, stress patterns, or how they\'ve been feeling.',
    parameters: {
      type: 'object',
      properties: {
        time_range: {
          type: 'string',
          enum: ['week', 'month', 'quarter', 'year'],
          description: 'Time period to analyze. Default: month',
        },
        granularity: {
          type: 'string',
          enum: ['hourly', 'daily', 'weekly'],
          description: 'Time granularity for data points. Default: daily',
        },
      },
      required: [],
    },
  },
};

export const identifyEmotionalTriggers: FunctionTool = {
  type: 'function',
  function: {
    name: 'identify_emotional_triggers',
    description:
      'Identifies which categories and tags are associated with highest emotional weight and anxiety. Use when users ask what stresses them out or what types of tasks trigger anxiety.',
    parameters: {
      type: 'object',
      properties: {
        min_emotional_weight: {
          type: 'number',
          description: 'Minimum emotional weight score (0-100) to consider. Default: 50',
        },
        time_range: {
          type: 'string',
          enum: ['week', 'month', 'quarter', 'year', 'all'],
          description: 'Time period to analyze. Default: month',
        },
      },
      required: [],
    },
  },
};

/**
 * Task Intelligence Tools (4)
 */

export const getUpcomingDeadlines: FunctionTool = {
  type: 'function',
  function: {
    name: 'get_upcoming_deadlines',
    description:
      'Returns prioritized upcoming deadlines with risk assessment (overdue, today, urgent, upcoming). Use when users ask what they should focus on, what\'s due, or what needs attention.',
    parameters: {
      type: 'object',
      properties: {
        days_ahead: {
          type: 'number',
          description: 'How many days ahead to look for deadlines. Default: 7',
        },
        include_overdue: {
          type: 'boolean',
          description: 'Include overdue tasks. Default: true',
        },
        min_priority_score: {
          type: 'number',
          description: 'Minimum priority score (0-100) to include. Default: 0 (all)',
        },
      },
      required: [],
    },
  },
};

export const getForgottenTasks: FunctionTool = {
  type: 'function',
  function: {
    name: 'get_forgotten_tasks',
    description:
      'Finds tasks that haven\'t been updated or completed for an extended period. Use when users ask about neglected tasks or things they might have forgotten.',
    parameters: {
      type: 'object',
      properties: {
        days_untouched: {
          type: 'number',
          description: 'Minimum days since last update to be considered forgotten. Default: 14',
        },
        exclude_worries: {
          type: 'boolean',
          description: 'Exclude items in Worries Vault category. Default: true',
        },
      },
      required: [],
    },
  },
};

export const suggestTaskBreakdown: FunctionTool = {
  type: 'function',
  function: {
    name: 'suggest_task_breakdown',
    description:
      'Identifies high-priority or complex tasks that could benefit from being broken down into smaller subtasks. Returns the tasks with AI suggestions for breakdown steps.',
    parameters: {
      type: 'object',
      properties: {
        min_priority_score: {
          type: 'number',
          description: 'Minimum priority score to consider for breakdown. Default: 60',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of tasks to analyze. Default: 5',
        },
      },
      required: [],
    },
  },
};

export const getPriorityDistribution: FunctionTool = {
  type: 'function',
  function: {
    name: 'get_priority_distribution',
    description:
      'Shows distribution of tasks across priority levels (high/medium/low) to help users understand their workload balance. Use when users ask about their workload or feel overwhelmed.',
    parameters: {
      type: 'object',
      properties: {
        include_completed: {
          type: 'boolean',
          description: 'Include completed tasks in analysis. Default: false',
        },
        time_range: {
          type: 'string',
          enum: ['today', 'week', 'month', 'all'],
          description: 'Time period to analyze. Default: all pending',
        },
      },
      required: [],
    },
  },
};

/**
 * Search & Context Tools (2)
 */

export const searchItemsAdvanced: FunctionTool = {
  type: 'function',
  function: {
    name: 'search_items_advanced',
    description:
      'Performs complex multi-filter search across all user tasks with full-text search capability. Use when users ask about specific tasks, topics, or want to find items matching certain criteria.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for full-text search across task titles and content',
        },
        categories: {
          type: 'array',
          items: {
            type: 'number',
          },
          description: 'Filter by category IDs (1-7)',
        },
        tags: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Filter by custom tags',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Filter by priority level',
        },
        status: {
          type: 'string',
          enum: ['pending', 'completed', 'archived', 'deleted'],
          description: 'Filter by task status. Default: pending',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return. Default: 20',
        },
      },
      required: [],
    },
  },
};

export const getUserContext: FunctionTool = {
  type: 'function',
  function: {
    name: 'get_user_context',
    description:
      'Retrieves comprehensive user profile including anxiety type, usage statistics, top categories, and preferences. ALWAYS call this first in new conversations to personalize responses.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
};

/**
 * All tools registry
 */
export const ALL_TOOLS: FunctionTool[] = [
  // Habit Analysis
  analyzeCompletionPatterns,
  analyzeProcrastinationTrends,
  analyzeRecurringAdherence,
  // Anxiety Insights
  analyzeWorrySpirals,
  getMoodTimeline,
  identifyEmotionalTriggers,
  // Task Intelligence
  getUpcomingDeadlines,
  getForgottenTasks,
  suggestTaskBreakdown,
  getPriorityDistribution,
  // Search & Context
  searchItemsAdvanced,
  getUserContext,
];

export default ALL_TOOLS;
