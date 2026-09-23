import { HABIT_COLOR_CLASS, isComplete, isScheduledOn, type Completions, type Habit } from "@/lib/habits";
import { formatWeekday, isFutureDay, isToday, toDateKey, weekDays } from "@/lib/dates";
import { cn } from "@/lib/utils";

type WeekGridProps = {
  habits: Habit[];
  completions: Completions;
  selectedDate: Date;
  today: Date;
  onToggle: (habitId: string, dateKey: string) => void;
  onSelectDate: (date: Date) => void;
};

export function WeekGrid({
  habits,
  completions,
  selectedDate,
  today,
  onToggle,
  onSelectDate,
}: WeekGridProps) {
  const days = weekDays(selectedDate);

  if (habits.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <div className="week-grid-wrap">
        <div className="week-grid grid gap-1">
          <div />
          {days.map((day) => {
            const selected = toDateKey(day) === toDateKey(selectedDate);
            const todayMark = isToday(day, today);
            return (
              <button
                key={toDateKey(day)}
                type="button"
                disabled={isFutureDay(day, today)}
                onClick={() => onSelectDate(day)}
                className={cn(
                  "flex flex-col items-center rounded-lg py-1 text-xs font-medium text-muted-foreground transition-colors duration-150",
                  selected && "bg-secondary text-foreground",
                  todayMark && !selected && "text-foreground",
                )}
              >
                <span>{formatWeekday(day)}</span>
                <span className="tabular-nums">{day.getDate()}</span>
              </button>
            );
          })}

          {habits.map((habit) => {
            const tones = HABIT_COLOR_CLASS[habit.color];
            return (
              <div key={habit.id} className="contents">
                <div className="flex items-center gap-2 pr-2">
                  <span className={cn("size-2 shrink-0 rounded-full", tones.bg)} />
                  <span className="truncate text-sm font-medium">{habit.name}</span>
                </div>
                {days.map((day) => {
                  const key = toDateKey(day);
                  const scheduled = isScheduledOn(habit, day);
                  const done = isComplete(completions, habit.id, key);
                  const future = isFutureDay(day, today);
                  const selected = key === toDateKey(selectedDate);
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={future || !scheduled}
                      onClick={() => {
                        onSelectDate(day);
                        if (scheduled && !future) onToggle(habit.id, key);
                      }}
                      aria-label={`${habit.name} ${key}${done ? ", complete" : ""}`}
                      className={cn(
                        "relative h-11 rounded-lg transition-[transform,background-color] duration-150 ease-out",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "disabled:cursor-default",
                        selected && "ring-1 ring-foreground/20",
                        scheduled && done && tones.bg,
                        scheduled && !done && !future && "bg-secondary hover:bg-accent",
                        (!scheduled || future) && "bg-transparent",
                        !future && scheduled && "active:scale-[0.96]",
                      )}
                    >
                      {!scheduled && (
                        <span className="absolute inset-3 rounded-sm bg-border/50" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
