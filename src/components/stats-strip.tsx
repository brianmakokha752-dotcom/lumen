import {
  bestStreak,
  currentStreak,
  isComplete,
  isScheduledOn,
  monthCompletionRate,
  perfectDayStreak,
  type Completions,
  type Habit,
} from "@/lib/habits";
import { isFutureDay, toDateKey, weekDays } from "@/lib/dates";

type StatsStripProps = {
  habits: Habit[];
  completions: Completions;
  today: Date;
  month: Date;
};

export function StatsStrip({ habits, completions, today, month }: StatsStripProps) {
  const perfect = perfectDayStreak(habits, completions, today);
  const monthRate = monthCompletionRate(habits, completions, month, today);
  const week = weekDays(today);
  let weekDone = 0;
  let weekScheduled = 0;
  for (const day of week) {
    if (isFutureDay(day, today)) continue;
    for (const habit of habits) {
      if (!isScheduledOn(habit, day)) continue;
      weekScheduled += 1;
      if (isComplete(completions, habit.id, toDateKey(day))) weekDone += 1;
    }
  }

  const topStreak = habits.reduce((best, habit) => {
    return Math.max(best, currentStreak(habit, completions, today));
  }, 0);
  const record = habits.reduce((best, habit) => {
    return Math.max(best, bestStreak(habit, completions, today));
  }, 0);

  const items = [
    { label: "Perfect days", value: String(perfect) },
    { label: "Best streak", value: String(Math.max(topStreak, record)) },
    {
      label: "This month",
      value: `${Math.round(monthRate.rate * 100)}%`,
    },
    { label: "This week", value: `${weekDone}/${weekScheduled || 0}` },
  ];

  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 font-serif text-3xl tabular-nums leading-none tracking-tight">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
