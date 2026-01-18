/**
 * Input Validation Utilities for AI Agent Tools
 *
 * Ensures tool parameters are safe and valid before querying database
 */

/**
 * Validate time range parameter
 */
export function validateTimeRange(
  timeRange: string
): 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' {
  const validRanges = ['today', 'week', 'month', 'quarter', 'year', 'all'];

  if (!validRanges.includes(timeRange)) {
    throw new Error(
      `Invalid time_range: "${timeRange}". Must be one of: ${validRanges.join(', ')}`
    );
  }

  return timeRange as 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';
}

/**
 * Validate category ID
 */
export function validateCategoryId(categoryId: unknown): number {
  const id = Number(categoryId);

  if (isNaN(id) || id < 1 || id > 7) {
    throw new Error(
      `Invalid category_id: "${categoryId}". Must be a number between 1 and 7.`
    );
  }

  return id;
}

/**
 * Validate priority level
 */
export function validatePriority(priority: string): 'low' | 'medium' | 'high' {
  const validPriorities = ['low', 'medium', 'high'];

  if (!validPriorities.includes(priority)) {
    throw new Error(
      `Invalid priority: "${priority}". Must be one of: ${validPriorities.join(', ')}`
    );
  }

  return priority as 'low' | 'medium' | 'high';
}

/**
 * Validate status
 */
export function validateStatus(status: string): 'pending' | 'completed' | 'archived' | 'deleted' {
  const validStatuses = ['pending', 'completed', 'archived', 'deleted'];

  if (!validStatuses.includes(status)) {
    throw new Error(
      `Invalid status: "${status}". Must be one of: ${validStatuses.join(', ')}`
    );
  }

  return status as 'pending' | 'completed' | 'archived' | 'deleted';
}

/**
 * Validate and sanitize search query
 */
export function validateSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    throw new Error('Search query must be a non-empty string');
  }

  // Trim whitespace
  const sanitized = query.trim();

  if (sanitized.length === 0) {
    throw new Error('Search query cannot be empty');
  }

  if (sanitized.length > 500) {
    throw new Error('Search query too long (max 500 characters)');
  }

  return sanitized;
}

/**
 * Validate numeric parameter with min/max bounds
 */
export function validateNumber(
  value: unknown,
  name: string,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): number {
  const num = Number(value);

  if (isNaN(num)) {
    throw new Error(`${name} must be a valid number`);
  }

  if (num < min || num > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }

  return num;
}

/**
 * Validate boolean parameter
 */
export function validateBoolean(value: unknown, name: string): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true' || value === '1') {
    return true;
  }

  if (value === 'false' || value === '0') {
    return false;
  }

  throw new Error(`${name} must be a boolean value`);
}

/**
 * Validate array parameter
 */
export function validateArray<T>(
  value: unknown,
  name: string,
  itemValidator?: (item: unknown) => T
): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`${name} must be an array`);
  }

  if (itemValidator) {
    return value.map((item, index) => {
      try {
        return itemValidator(item);
      } catch (error) {
        throw new Error(`Invalid item at index ${index} in ${name}: ${(error as Error).message}`);
      }
    });
  }

  return value as T[];
}

/**
 * Validate granularity for time-based queries
 */
export function validateGranularity(granularity: string): 'hourly' | 'daily' | 'weekly' {
  const validGranularities = ['hourly', 'daily', 'weekly'];

  if (!validGranularities.includes(granularity)) {
    throw new Error(
      `Invalid granularity: "${granularity}". Must be one of: ${validGranularities.join(', ')}`
    );
  }

  return granularity as 'hourly' | 'daily' | 'weekly';
}
