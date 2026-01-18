/**
 * Date Helper Utilities for AI Agent
 *
 * Provides consistent date calculation and formatting
 * for time-based queries and analytics
 */

/**
 * Get date range for common time periods
 */
export function getDateRange(timeRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'): {
  start: Date;
  end: Date;
} {
  const end = new Date();
  const start = new Date();

  switch (timeRange) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case 'all':
      start.setFullYear(2000); // Far back enough to get all data
      break;
  }

  return { start, end };
}

/**
 * Format date for SQL queries (PostgreSQL format)
 */
export function toSqlDate(date: Date): string {
  return date.toISOString();
}

/**
 * Get relative time description (e.g., "3 days ago", "2 weeks ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get start of day (midnight)
 */
export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (23:59:59.999)
 */
export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Check if a date is in the past
 */
export function isOverdue(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}

/**
 * Get a friendly date label for grouping
 * (e.g., "Today", "This Week", "This Month", "Earlier")
 */
export function getDateLabel(date: Date): string {
  const now = new Date();
  const today = startOfDay(now);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  if (date >= today) return 'Today';
  if (date >= weekAgo) return 'This Week';
  if (date >= monthAgo) return 'This Month';
  return 'Earlier';
}

/**
 * Format date for user-friendly display
 */
export function formatDate(date: Date, includeTime: boolean = false): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  };

  if (includeTime) {
    options.hour = 'numeric';
    options.minute = '2-digit';
  }

  return date.toLocaleDateString('en-US', options);
}
