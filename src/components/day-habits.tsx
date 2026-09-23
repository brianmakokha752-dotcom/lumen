import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { CheckToggle } from "@/components/check-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  currentStreak,
  HABIT_COLOR_CLASS,
  isComplete,
  isScheduledOn,
  scheduledHabitsFor,
  windowStats,
  type Completions,
  type Habit,
} from "@/lib/habits";
import { daysBack, isFutureDay, toDateKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

type DayHabitsProps = {
  habits: Habit[];
  completions: Completions;
  date: Date;
  today: Date;
  onToggle: (habitId: string, dateKey: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
};

export function DayHabits({
  habits,
  completions,
  date,
  today,
  onToggle,
  onEdit,
  onDelete,
}: DayHabitsProps) {
  const dateKey = toDateKey(date);
  const locked = isFutureDay(date, today);
  const scheduled = scheduledHabitsFor(habits, date);
  const rest = habits.filter((habit) => !isScheduledOn(habit, date));

  if (habits.length === 0) return null;

  return (
    <ul className="grid gap-2">
      {scheduled.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          completions={completions}
          date={date}
          today={today}
          dateKey={dateKey}
          locked={locked}
          restDay={false}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {rest.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          completions={completions}
          date={date}
          today={today}
          dateKey={dateKey}
          locked={locked}
          restDay
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

function HabitCard({
  habit,
  completions,
  date,
  today,
  dateKey,
  locked,
  restDay,
  onToggle,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  completions: Completions;
  date: Date;
  today: Date;
  dateKey: string;
  locked: boolean;
  restDay: boolean;
  onToggle: (habitId: string, dateKey: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}) {
  const checked = isComplete(completions, habit.id, dateKey);
  const tones = HABIT_COLOR_CLASS[habit.color];
  const streak = currentStreak(habit, completions, today);
  const month = windowStats(habit, completions, 30, today);
  const week = daysBack(date, 7);

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-card p-3 pl-3 shadow-[var(--shadow-border)]",
        restDay && "opacity-70",
      )}
    >
      <span className={cn("h-10 w-1 shrink-0 rounded-full", tones.bg)} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-medium leading-snug">{habit.name}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="-mr-1 size-8 text-muted-foreground"
                aria-label={`More actions for ${habit.name}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(habit)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(habit)}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {streak > 0 ? `${streak}-day streak` : "No streak yet"}
          </span>
          <span className="tabular-nums">{Math.round(month.rate * 100)}% last 30 days</span>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden>
          {week.map((day) => {
            const key = toDateKey(day);
            const done = isComplete(completions, habit.id, key);
            const scheduled = isScheduledOn(habit, day);
            return (
              <span
                key={key}
                className={cn(
                  "h-1.5 w-3 rounded-full",
                  !scheduled && "bg-border/60",
                  scheduled && done && tones.bg,
                  scheduled && !done && "bg-border",
                )}
              />
            );
          })}
        </div>
      </div>
      {restDay ? (
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Rest
        </span>
      ) : (
        <CheckToggle
          checked={checked}
          color={habit.color}
          disabled={locked}
          label={`${checked ? "Uncheck" : "Check"} ${habit.name}`}
          onToggle={() => onToggle(habit.id, dateKey)}
        />
      )}
    </li>
  );
}
