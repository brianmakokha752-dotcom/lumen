import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  dayCompletion,
  HABIT_COLOR_CLASS,
  isComplete,
  isScheduledOn,
  scheduledHabitsFor,
  type Completions,
  type Habit,
} from "@/lib/habits";
import {
  formatShortMonth,
  isFutureDay,
  isSameMonth,
  isToday,
  monthGrid,
  shiftMonth,
  toDateKey,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

const HEADINGS = ["M", "T", "W", "T", "F", "S", "S"];

type MonthCalendarProps = {
  month: Date;
  onMonthChange: (month: Date) => void;
  habits: Habit[];
  completions: Completions;
  selectedDate: Date;
  today: Date;
  onSelectDate: (date: Date) => void;
};

export function MonthCalendar({
  month,
  onMonthChange,
  habits,
  completions,
  selectedDate,
  today,
  onSelectDate,
}: MonthCalendarProps) {
  const cells = monthGrid(month);
  const selectedKey = toDateKey(selectedDate);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-serif text-2xl tracking-tight">{formatShortMonth(month)}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onMonthChange(today);
              onSelectDate(today);
            }}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {HEADINGS.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="pb-1 text-center text-xs font-medium text-muted-foreground"
          >
            {label}
          </div>
        ))}
        {cells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="min-h-16" />;
          }
          const key = toDateKey(day);
          const future = isFutureDay(day, today);
          const selected = key === selectedKey;
          const todayMark = isToday(day, today);
          const scheduled = scheduledHabitsFor(habits, day);
          const summary = dayCompletion(habits, completions, day);
          const inMonth = isSameMonth(day, month);

          return (
            <button
              key={key}
              type="button"
              disabled={future}
              onClick={() => onSelectDate(day)}
              className={cn(
                "flex min-h-16 flex-col gap-1.5 rounded-xl p-1.5 text-left transition-[background-color,box-shadow,transform] duration-150 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-default disabled:opacity-40",
                selected && "bg-card shadow-[var(--shadow-border)]",
                !selected && !future && "hover:bg-secondary",
                todayMark && !selected && "bg-secondary/70",
                !inMonth && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full text-xs tabular-nums",
                  todayMark && "bg-primary font-medium text-primary-foreground",
                  !todayMark && "text-foreground",
                )}
              >
                {day.getDate()}
              </span>
              {scheduled.length > 0 ? (
                <span className="mt-auto flex h-1.5 w-full gap-px">
                  {scheduled.map((habit) => {
                    const done = isComplete(completions, habit.id, key);
                    return (
                      <span
                        key={habit.id}
                        className={cn(
                          "h-full min-w-0 flex-1 rounded-sm",
                          done ? HABIT_COLOR_CLASS[habit.color].bg : "bg-border",
                        )}
                      />
                    );
                  })}
                </span>
              ) : (
                <span className="mt-auto h-1.5" />
              )}
              <span className="sr-only">
                {summary.done} of {summary.scheduled} habits complete
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
