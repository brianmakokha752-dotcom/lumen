import { subDays } from "date-fns";
import { isFutureDay, toDateKey, todayDate, weekdayIndex } from "@/lib/dates";

export const HABIT_COLORS = [
  { id: "pine", label: "Pine" },
  { id: "ocean", label: "Ocean" },
  { id: "clay", label: "Clay" },
  { id: "slate", label: "Slate" },
  { id: "moss", label: "Moss" },
  { id: "rust", label: "Rust" },
  { id: "dusk", label: "Dusk" },
  { id: "plum", label: "Plum" },
] as const;

export type HabitColor = (typeof HABIT_COLORS)[number]["id"];

export const HABIT_COLOR_CLASS: Record<
  HabitColor,
  { bg: string; text: string; ring: string; soft: string; border: string }
> = {
  pine: {
    bg: "bg-habit-pine",
    text: "text-habit-pine",
    ring: "ring-habit-pine",
    soft: "bg-habit-pine/15",
    border: "border-habit-pine",
  },
  ocean: {
    bg: "bg-habit-ocean",
    text: "text-habit-ocean",
    ring: "ring-habit-ocean",
    soft: "bg-habit-ocean/15",
    border: "border-habit-ocean",
  },
  clay: {
    bg: "bg-habit-clay",
    text: "text-habit-clay",
    ring: "ring-habit-clay",
    soft: "bg-habit-clay/15",
    border: "border-habit-clay",
  },
  slate: {
    bg: "bg-habit-slate",
    text: "text-habit-slate",
    ring: "ring-habit-slate",
    soft: "bg-habit-slate/15",
    border: "border-habit-slate",
  },
  moss: {
    bg: "bg-habit-moss",
    text: "text-habit-moss",
    ring: "ring-habit-moss",
    soft: "bg-habit-moss/15",
    border: "border-habit-moss",
  },
  rust: {
    bg: "bg-habit-rust",
    text: "text-habit-rust",
    ring: "ring-habit-rust",
    soft: "bg-habit-rust/15",
    border: "border-habit-rust",
  },
  dusk: {
    bg: "bg-habit-dusk",
    text: "text-habit-dusk",
    ring: "ring-habit-dusk",
    soft: "bg-habit-dusk/15",
    border: "border-habit-dusk",
  },
  plum: {
    bg: "bg-habit-plum",
    text: "text-habit-plum",
    ring: "ring-habit-plum",
    soft: "bg-habit-plum/15",
    border: "border-habit-plum",
  },
};

export const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;
export const WEEKDAY_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export type Habit = {
  id: string;
  name: string;
  color: HabitColor;
  createdAt: string;
  weekdays: number[];
};

export type Completions = Record<string, Record<string, true>>;

export function isEveryDay(weekdays: number[]): boolean {
  return weekdays.length === 0 || weekdays.length === 7;
}

export function isScheduledOn(habit: Habit, date: Date): boolean {
  if (isEveryDay(habit.weekdays)) return true;
  return habit.weekdays.includes(weekdayIndex(date));
}

export function isComplete(completions: Completions, habitId: string, dateKey: string): boolean {
  return Boolean(completions[habitId]?.[dateKey]);
}

export function scheduledHabitsFor(habits: Habit[], date: Date): Habit[] {
  return habits.filter((habit) => isScheduledOn(habit, date));
}

export function hash01(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export function currentStreak(
  habit: Habit,
  completions: Completions,
  today = todayDate(),
): number {
  let cursor = today;
  const todayKey = toDateKey(cursor);
  if (isScheduledOn(habit, cursor) && !isComplete(completions, habit.id, todayKey)) {
    cursor = subDays(cursor, 1);
  }

  let streak = 0;
  for (let i = 0; i < 800; i++) {
    if (!isScheduledOn(habit, cursor)) {
      cursor = subDays(cursor, 1);
      continue;
    }
    const key = toDateKey(cursor);
    if (isComplete(completions, habit.id, key)) {
      streak += 1;
      cursor = subDays(cursor, 1);
      continue;
    }
    break;
  }
  return streak;
}

export function bestStreak(
  habit: Habit,
  completions: Completions,
  today = todayDate(),
): number {
  let cursor = today;
  let best = 0;
  let run = 0;
  for (let i = 0; i < 800; i++) {
    if (!isScheduledOn(habit, cursor)) {
      cursor = subDays(cursor, 1);
      continue;
    }
    const key = toDateKey(cursor);
    if (isComplete(completions, habit.id, key)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
    cursor = subDays(cursor, 1);
  }
  return best;
}

export function windowStats(
  habit: Habit,
  completions: Completions,
  days: number,
  today = todayDate(),
): { done: number; scheduled: number; rate: number } {
  let done = 0;
  let scheduled = 0;
  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    if (!isScheduledOn(habit, date)) continue;
    scheduled += 1;
    if (isComplete(completions, habit.id, toDateKey(date))) done += 1;
  }
  return {
    done,
    scheduled,
    rate: scheduled === 0 ? 0 : done / scheduled,
  };
}

export function dayCompletion(
  habits: Habit[],
  completions: Completions,
  date: Date,
): { done: number; scheduled: number; rate: number; complete: boolean } {
  const scheduled = scheduledHabitsFor(habits, date);
  const done = scheduled.filter((habit) =>
    isComplete(completions, habit.id, toDateKey(date)),
  ).length;
  const total = scheduled.length;
  return {
    done,
    scheduled: total,
    rate: total === 0 ? 0 : done / total,
    complete: total > 0 && done === total,
  };
}

export function perfectDayStreak(
  habits: Habit[],
  completions: Completions,
  today = todayDate(),
): number {
  if (habits.length === 0) return 0;
  let cursor = today;
  const todayResult = dayCompletion(habits, completions, cursor);
  if (todayResult.scheduled > 0 && !todayResult.complete) {
    cursor = subDays(cursor, 1);
  }
  let streak = 0;
  for (let i = 0; i < 800; i++) {
    if (isFutureDay(cursor, today)) break;
    const result = dayCompletion(habits, completions, cursor);
    if (result.scheduled === 0) {
      cursor = subDays(cursor, 1);
      continue;
    }
    if (result.complete) {
      streak += 1;
      cursor = subDays(cursor, 1);
      continue;
    }
    break;
  }
  return streak;
}

export function monthCompletionRate(
  habits: Habit[],
  completions: Completions,
  month: Date,
  today = todayDate(),
): { done: number; scheduled: number; rate: number } {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  let done = 0;
  let scheduled = 0;
  for (let day = start.getDate(); day <= end.getDate(); day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    if (isFutureDay(date, today)) break;
    const result = dayCompletion(habits, completions, date);
    done += result.done;
    scheduled += result.scheduled;
  }
  return {
    done,
    scheduled,
    rate: scheduled === 0 ? 0 : done / scheduled,
  };
}

export function createSeedData(now = todayDate()): {
  habits: Habit[];
  completions: Completions;
} {
  const createdAt = toDateKey(subDays(now, 56));
  const habits: Habit[] = [
    {
      id: "h-stretch",
      name: "Morning stretch",
      color: "pine",
      createdAt,
      weekdays: [...ALL_WEEKDAYS],
    },
    {
      id: "h-read",
      name: "Read 20 minutes",
      color: "ocean",
      createdAt,
      weekdays: [...ALL_WEEKDAYS],
    },
    {
      id: "h-walk",
      name: "Take a walk",
      color: "clay",
      createdAt,
      weekdays: [...ALL_WEEKDAYS],
    },
    {
      id: "h-water",
      name: "Drink water",
      color: "dusk",
      createdAt,
      weekdays: [...ALL_WEEKDAYS],
    },
    {
      id: "h-journal",
      name: "Journal",
      color: "plum",
      createdAt,
      weekdays: [1, 2, 3, 4, 5],
    },
  ];

  const rates: Record<string, number> = {
    "h-stretch": 0.86,
    "h-read": 0.68,
    "h-walk": 0.8,
    "h-water": 0.58,
    "h-journal": 0.74,
  };
  const forced: Record<string, number> = {
    "h-stretch": 11,
    "h-read": 3,
    "h-walk": 6,
    "h-water": 1,
    "h-journal": 4,
  };
  const todayChecked = new Set(["h-walk", "h-water"]);

  const completions: Completions = {};
  for (const habit of habits) {
    completions[habit.id] = {};
    for (let i = 56; i >= 0; i--) {
      const date = subDays(now, i);
      if (!isScheduledOn(habit, date)) continue;
      const key = toDateKey(date);
      if (i === 0) {
        if (todayChecked.has(habit.id)) completions[habit.id][key] = true;
        continue;
      }
      if (i <= (forced[habit.id] ?? 0)) {
        completions[habit.id][key] = true;
        continue;
      }
      if (hash01(`${habit.id}:${key}`) < (rates[habit.id] ?? 0.7)) {
        completions[habit.id][key] = true;
      }
    }
  }

  return { habits, completions };
}
