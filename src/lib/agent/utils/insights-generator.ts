/**
 * Insights Generator for AI Agent
 *
 * Formats raw data into compassionate, anxiety-first insights
 * that validate user experiences while providing actionable information
 */

import { formatDate, getRelativeTime } from './date-helpers';

/**
 * Format completion statistics with compassionate framing
 */
export function formatCompletionInsights(stats: {
  total: number;
  completed: number;
  completion_rate: number;
  avg_completion_time_hours?: number;
  by_category?: { category: string; completed: number; total: number }[];
  by_mood?: { mood: string; completed: number; total: number }[];
}) {
  const { total, completed, completion_rate } = stats;

  // Compassionate framing based on completion rate
  let framing = '';
  if (completion_rate >= 0.7) {
    framing = "You're making real progress";
  } else if (completion_rate >= 0.4) {
    framing = "You're doing meaningful work, even if it doesn't always feel like it";
  } else {
    framing = "I see you're working through things, and that's what matters";
  }

  const insights = {
    summary: `${framing}. You've completed ${completed} out of ${total} tasks (${Math.round(completion_rate * 100)}%).`,
    completion_rate: completion_rate,
    total_tasks: total,
    completed_tasks: completed,
    avg_completion_time: stats.avg_completion_time_hours
      ? `${Math.round(stats.avg_completion_time_hours)} hours on average`
      : undefined,
    by_category: stats.by_category,
    by_mood: stats.by_mood,
  };

  return insights;
}

/**
 * Format procrastination trends with validation (not shame)
 */
export function formatProcrastinationInsights(data: {
  procrastinated_tasks: {
    title: string;
    category: string;
    days_procrastinated: number;
    emotional_weight?: number;
  }[];
  common_patterns?: {
    category: string;
    count: number;
    avg_delay_days: number;
  }[];
}) {
  const { procrastinated_tasks, common_patterns } = data;

  if (procrastinated_tasks.length === 0) {
    return {
      summary: "I don't see significant procrastination patterns right now.",
      tasks: [],
    };
  }

  // Identify if high emotional weight correlates with procrastination
  const highEmotionalTasks = procrastinated_tasks.filter(
    t => t.emotional_weight && t.emotional_weight > 50
  );

  const hasEmotionalPattern = highEmotionalTasks.length > procrastinated_tasks.length / 2;

  let summary = `I notice ${procrastinated_tasks.length} tasks that have been waiting. `;

  if (hasEmotionalPattern) {
    summary += "Many of them carry emotional weight, which makes starting harder. That's anxiety, not laziness.";
  } else {
    summary += "Sometimes putting things off is your brain's way of protecting you from overwhelm.";
  }

  return {
    summary,
    tasks: procrastinated_tasks.map(t => ({
      title: t.title,
      category: t.category,
      waiting_for: `${t.days_procrastinated} days`,
      note: t.emotional_weight && t.emotional_weight > 50
        ? 'This one feels heavy - that makes sense'
        : undefined,
    })),
    patterns: common_patterns,
  };
}

/**
 * Format worry spiral insights with compassionate breakdown
 */
export function formatWorrySpiralInsights(data: {
  total_spirals: number;
  recent_spirals: {
    created_at: Date;
    spiral_chain: string[];
    trigger?: string;
  }[];
  common_triggers?: string[];
}) {
  const { total_spirals, recent_spirals, common_triggers } = data;

  if (total_spirals === 0) {
    return {
      summary: "I don't see major worry spirals captured recently. That's a good sign.",
      spirals: [],
    };
  }

  const summary = `I see ${total_spirals} worry spirals captured. Remember: these are anxiety patterns, not reality. Your brain is trying to protect you, but it's overestimating danger.`;

  return {
    summary,
    spirals: recent_spirals.map(s => ({
      when: getRelativeTime(s.created_at),
      chain: s.spiral_chain,
      trigger: s.trigger,
      note: 'Each "what if" step is less likely than the one before. Anxiety doesn\'t work with probabilities.',
    })),
    common_triggers,
  };
}

/**
 * Format upcoming deadlines with time-aware, context-sensitive messaging
 */
export function formatDeadlineInsights(deadlines: {
  overdue: any[];
  today: any[];
  urgent: any[];
  upcoming: any[];
}) {
  const { overdue, today, urgent, upcoming } = deadlines;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Build natural language summary
  const parts: string[] = [];

  // Current time context
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  parts.push(`Right now it's ${timeStr}.`);

  // Today's tasks with time awareness
  if (today.length > 0) {
    const tasksWithTime = today.filter(t => t.due_time);
    const tasksWithoutTime = today.filter(t => !t.due_time);

    // Categorize by timing
    const upcoming: any[] = [];
    const passed: any[] = [];

    tasksWithTime.forEach(task => {
      const [hours, minutes] = task.due_time.split(':').map(Number);
      const taskTime = hours * 60 + minutes;
      const currentTime = currentHour * 60 + currentMinute;

      if (taskTime > currentTime) {
        upcoming.push({ ...task, timeInMinutes: taskTime - currentTime });
      } else {
        passed.push(task);
      }
    });

    // Sort upcoming by time
    upcoming.sort((a, b) => a.timeInMinutes - b.timeInMinutes);

    if (upcoming.length > 0) {
      parts.push(`\n\n**Coming up today:**`);
      upcoming.forEach(task => {
        const timeLabel = task.timeInMinutes < 60
          ? '[SOON]'
          : task.timeInMinutes < 180
            ? '[IN A FEW HOURS]'
            : '';

        parts.push(`• ${task.due_time} - ${task.title} ${timeLabel}`);
      });
    }

    if (tasksWithoutTime.length > 0) {
      if (upcoming.length > 0) {
        parts.push(`\n**Also today:**`);
      } else {
        parts.push(`\n**Today:**`);
      }
      tasksWithoutTime.forEach(task => {
        parts.push(`• ${task.title}`);
      });
    }

    if (passed.length > 0) {
      parts.push(`\n**Earlier today:**`);
      passed.forEach(task => {
        parts.push(`• ${task.due_time} - ${task.title}`);
      });
    }

    // Add encouragement only when needed
    const hasHighStress = today.some(t => t.final_priority_score > 70);
    if (today.length <= 3 && !hasHighStress) {
      parts.push(`\nThat's ${today.length} ${today.length === 1 ? 'thing' : 'things'} total. Manageable.`);
    } else if (hasHighStress) {
      const stressTask = today.find(t => t.final_priority_score > 70);
      parts.push(`\nI know ${stressTask.title.toLowerCase()} might feel heavy. Take it one step at a time.`);
    }
  }

  // Overdue (show with empathy, not shame)
  if (overdue.length > 0) {
    parts.push(`\n\n**From earlier:**`);
    overdue.slice(0, 3).forEach(task => {
      const dueDate = formatDate(new Date(task.due_date), true);
      parts.push(`• ${task.title} (was ${dueDate})`);
    });
    if (overdue.length > 3) {
      parts.push(`• ...and ${overdue.length - 3} more`);
    }
    parts.push(`\nNo shame - sometimes things slip. What matters is what you do next.`);
  }

  // Urgent (next 3 days)
  if (urgent.length > 0) {
    parts.push(`\n\n**This week:**`);
    urgent.slice(0, 3).forEach(task => {
      const dueDate = formatDate(new Date(task.due_date), true);
      parts.push(`• ${task.title} (${dueDate})`);
    });
  }

  // Clean message
  const summary = parts.join('\n');

  return {
    summary,
    overdue: overdue.map(formatDeadlineItem),
    today: today.map(formatDeadlineItem),
    urgent: urgent.map(formatDeadlineItem),
    upcoming: upcoming.map(formatDeadlineItem),
  };
}

/**
 * Format a single deadline item (internal use)
 */
function formatDeadlineItem(item: any) {
  return {
    title: item.title,
    due: item.due_date ? formatDate(new Date(item.due_date), true) : 'No specific date',
    due_time: item.due_time || null,
    category: item.categories?.name || 'Unknown',
    priority: item.priority,
    emotional_weight: item.final_priority_score > 70 ? 'High' : item.final_priority_score > 40 ? 'Medium' : 'Low',
  };
}

/**
 * Format forgotten tasks with gentle framing
 */
export function formatForgottenTasksInsights(tasks: {
  title: string;
  category: string;
  days_untouched: number;
  last_updated: Date;
}[]) {
  if (tasks.length === 0) {
    return {
      summary: "You're keeping up with your captured thoughts. Nothing's been sitting too long.",
      tasks: [],
    };
  }

  const summary = `I see ${tasks.length} tasks that haven't been touched in a while. Sometimes that means they weren't actually important, and that's okay. Or they might need to be broken down into smaller steps.`;

  return {
    summary,
    tasks: tasks.map(t => ({
      title: t.title,
      category: t.category,
      untouched_for: `${t.days_untouched} days`,
      last_seen: getRelativeTime(t.last_updated),
      suggestion: t.days_untouched > 30
        ? 'Consider archiving if this is no longer relevant'
        : 'Might need to be broken into smaller steps',
    })),
  };
}

/**
 * Format mood timeline with correlation insights
 */
export function formatMoodInsights(data: {
  timeline: {
    date: Date;
    mood_score: number;
    completed_tasks: number;
    worry_spirals: number;
  }[];
  average_mood: number;
  best_days: Date[];
  tough_days: Date[];
}) {
  const { timeline, average_mood, best_days, tough_days } = data;

  const moodLabel = average_mood >= 7 ? 'generally good' :
                    average_mood >= 5 ? 'mixed, which is normal' :
                    'challenging, and that\'s important to acknowledge';

  const summary = `Your mood has been ${moodLabel}. I can see patterns between your stress levels and task completion.`;

  return {
    summary,
    average_mood,
    timeline: timeline.map(t => ({
      date: formatDate(t.date),
      mood: t.mood_score,
      tasks_completed: t.completed_tasks,
      spirals: t.worry_spirals,
    })),
    insights: {
      best_days: best_days.map(d => formatDate(d)),
      tough_days: tough_days.map(d => formatDate(d)),
      note: 'Tough days are data, not failures. They show what triggers stress.',
    },
  };
}

/**
 * Format priority distribution insights
 */
export function formatPriorityDistributionInsights(distribution: {
  high: number;
  medium: number;
  low: number;
  total: number;
}) {
  const { high, medium, low, total } = distribution;

  const highPercent = (high / total) * 100;

  let summary = '';

  if (highPercent > 60) {
    summary = `${Math.round(highPercent)}% of your tasks are marked high priority. When everything is urgent, nothing is. Let's identify what truly matters right now.`;
  } else if (highPercent < 20) {
    summary = `You have a balanced workload with ${high} high-priority tasks. That's manageable.`;
  } else {
    summary = `You have ${high} high-priority tasks out of ${total} total. That's a reasonable balance.`;
  }

  return {
    summary,
    distribution: {
      high: { count: high, percentage: Math.round(highPercent) },
      medium: { count: medium, percentage: Math.round((medium / total) * 100) },
      low: { count: low, percentage: Math.round((low / total) * 100) },
    },
    total,
  };
}

/**
 * Format recurring task adherence insights
 */
export function formatRecurringAdherenceInsights(data: {
  total_recurring: number;
  adherence_rate: number;
  tasks: {
    title: string;
    expected_completions: number;
    actual_completions: number;
    adherence_rate: number;
  }[];
}) {
  const { total_recurring, adherence_rate, tasks } = data;

  if (total_recurring === 0) {
    return {
      summary: "You don't have recurring tasks set up yet. That's okay - structure builds over time.",
      tasks: [],
    };
  }

  let summary = '';

  if (adherence_rate >= 0.8) {
    summary = `You're sticking to ${Math.round(adherence_rate * 100)}% of your recurring habits. That's consistency, and it matters.`;
  } else if (adherence_rate >= 0.5) {
    summary = `You're maintaining about ${Math.round(adherence_rate * 100)}% of your recurring tasks. Building habits is hard, especially with anxiety. Progress, not perfection.`;
  } else {
    summary = `Your recurring tasks are challenging right now (${Math.round(adherence_rate * 100)}% adherence). That's feedback, not failure. Maybe they need to be adjusted.`;
  }

  return {
    summary,
    overall_adherence: Math.round(adherence_rate * 100),
    tasks: tasks.map(t => ({
      title: t.title,
      expected: t.expected_completions,
      actual: t.actual_completions,
      adherence: `${Math.round(t.adherence_rate * 100)}%`,
      note: t.adherence_rate < 0.3
        ? 'This one might need to be adjusted or removed'
        : t.adherence_rate > 0.8
        ? 'You\'re doing well with this one'
        : undefined,
    })),
  };
}
