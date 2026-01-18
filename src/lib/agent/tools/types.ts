/**
 * Shared Types for AI Agent Tools
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Base tool execution context
 */
export interface ToolContext {
  supabase: SupabaseClient;
  userId: string;
}

/**
 * Tool execution result
 */
export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    execution_time_ms: number;
    cached?: boolean;
  };
}

/**
 * Time range type for queries
 */
export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

/**
 * Priority level
 */
export type Priority = 'low' | 'medium' | 'high';

/**
 * Task status
 */
export type TaskStatus = 'pending' | 'completed' | 'archived' | 'deleted';

/**
 * Granularity for time-based queries
 */
export type Granularity = 'hourly' | 'daily' | 'weekly';

/**
 * Category mapping (fixed categories from DB)
 */
export const CATEGORIES = {
  TASKS: 1,
  IDEAS: 2,
  ERRANDS: 3,
  HEALTH: 4,
  RELATIONSHIPS: 5,
  WORRIES_VAULT: 6,
  RECURRING: 7,
} as const;

export const CATEGORY_NAMES: Record<number, string> = {
  1: 'Tasks',
  2: 'Ideas',
  3: 'Errands',
  4: 'Health',
  5: 'Relationships',
  6: 'Worries Vault',
  7: 'Recurring',
};
