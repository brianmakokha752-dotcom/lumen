import { useEffect, useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { DayHabits } from "@/components/day-habits";
import { HabitFormDialog } from "@/components/habit-form-dialog";
import { MonthCalendar } from "@/components/month-calendar";
import { StatsStrip } from "@/components/stats-strip";
import { WeekGrid } from "@/components/week-grid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { dayCompletion, scheduledHabitsFor, type Habit } from "@/lib/habits";
import { formatLongDate, isToday, startOfMonth, toDateKey, todayDate } from "@/lib/dates";
import { hydrateHabitStore, useHabitStore, type HabitDraft } from "@/store/habits";
import { cn } from "@/lib/utils";

export function LumenApp() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydrateHabitStore().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return <AppSkeleton />;
  return <LumenReady />;
}

function LumenReady() {
  const habits = useHabitStore((state) => state.habits);
  const completions = useHabitStore((state) => state.completions);
  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const toggleCompletion = useHabitStore((state) => state.toggleCompletion);
  const completeScheduled = useHabitStore((state) => state.completeScheduled);

  const today = useMemo(() => todayDate(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Habit | null>(null);
  const [view, setView] = useState("month");

  const selectedKey = toDateKey(selectedDate);
  const summary = dayCompletion(habits, completions, selectedDate);
  const scheduled = scheduledHabitsFor(habits, selectedDate);
  const lookingAtToday = isToday(selectedDate, today);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(habit: Habit) {
    setEditing(habit);
    setFormOpen(true);
  }

  function handleSubmit(draft: HabitDraft) {
    if (editing) updateHabit(editing.id, draft);
    else addHabit(draft);
    setEditing(null);
  }

  function selectDate(date: Date) {
    if (date > today) return;
    setSelectedDate(date);
    setMonth(startOfMonth(date));
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-dvh bg-background text-foreground">
        <header className="border-b border-border/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Check className="size-4" strokeWidth={2.75} />
              </span>
              <div>
                <p className="font-serif text-2xl leading-none tracking-tight">Lumen</p>
                <p className="mt-1 text-xs text-muted-foreground">Daily rites, kept in one place.</p>
              </div>
            </div>
            <Button onClick={openCreate} className="shrink-0">
              <Plus />
              New habit
            </Button>
          </div>
        </header>

        <main className="mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:py-8">
          <section className="flex min-w-0 flex-col gap-5 lg:col-span-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {lookingAtToday ? "Today" : "Selected day"}
                </p>
                <h1 className="mt-1 font-serif text-3xl leading-none tracking-tight sm:text-4xl">
                  {formatLongDate(selectedDate)}
                </h1>
              </div>
              {!lookingAtToday && (
                <Button variant="ghost" size="sm" onClick={() => selectDate(today)}>
                  Today
                </Button>
              )}
            </div>

            {habits.length > 0 && (
              <DayProgress done={summary.done} total={summary.scheduled} />
            )}

            {habits.length === 0 ? (
              <EmptyState onAdd={openCreate} />
            ) : (
              <>
                {scheduled.length > 0 && summary.done < summary.scheduled && (
                  <button
                    type="button"
                    onClick={() => completeScheduled(selectedKey)}
                    className="self-start text-sm font-medium text-primary hover:underline"
                  >
                    Mark remaining complete
                  </button>
                )}
                <DayHabits
                  habits={habits}
                  completions={completions}
                  date={selectedDate}
                  today={today}
                  onToggle={toggleCompletion}
                  onEdit={openEdit}
                  onDelete={setPendingDelete}
                />
              </>
            )}
          </section>

          <section className="flex min-w-0 flex-col gap-6 lg:col-span-8">
            {habits.length > 0 && (
              <StatsStrip habits={habits} completions={completions} today={today} month={month} />
            )}

            <div className="rounded-3xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-6">
              <Tabs value={view} onValueChange={setView}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">Streak calendar</p>
                  <TabsList>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="week" className="mt-5">
                  <WeekGrid
                    habits={habits}
                    completions={completions}
                    selectedDate={selectedDate}
                    today={today}
                    onToggle={toggleCompletion}
                    onSelectDate={selectDate}
                  />
                  {habits.length === 0 && <CalendarHint />}
                </TabsContent>
                <TabsContent value="month" className="mt-5">
                  <MonthCalendar
                    month={month}
                    onMonthChange={(next) => {
                      setMonth(startOfMonth(next));
                    }}
                    habits={habits}
                    completions={completions}
                    selectedDate={selectedDate}
                    today={today}
                    onSelectDate={selectDate}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </section>
        </main>
      </div>

      <HabitFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        habit={editing}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this habit?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.name} and its check-ins will be removed from this device.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}
              onClick={() => {
                if (pendingDelete) deleteHabit(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

function DayProgress({ done, total }: { done: number; total: number }) {
  const rate = total === 0 ? 0 : done / total;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - rate * circumference;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
      <svg viewBox="0 0 40 40" className="size-10 -rotate-90" aria-hidden>
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          className="stroke-secondary"
          strokeWidth="4"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          className="stroke-primary"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div>
        <p className="text-sm font-medium tabular-nums">
          {done} of {total} complete
        </p>
        <p className="text-xs text-muted-foreground">
          {total === 0
            ? "Nothing scheduled"
            : done === total
              ? "All rites kept"
              : `${total - done} still open`}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      <p className="font-serif text-2xl tracking-tight">No habits yet</p>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
        Add one to start a streak. A name and a color is enough.
      </p>
      <Button onClick={onAdd} className="mt-6">
        <Plus />
        New habit
      </Button>
    </div>
  );
}

function CalendarHint() {
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">
      Habits you add will fill this calendar.
    </p>
  );
}

function AppSkeleton() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="font-serif text-2xl leading-none tracking-tight">Lumen</p>
            <p className="mt-1 text-xs text-muted-foreground">Daily rites, kept in one place.</p>
          </div>
          <div className="h-11 w-28 rounded-lg bg-secondary" />
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12">
        <div className="grid gap-3 lg:col-span-4">
          <p className="font-serif text-3xl tracking-tight">Loading habits</p>
          <div className="h-20 rounded-2xl bg-secondary" />
          <div className="h-24 rounded-2xl bg-secondary" />
          <div className="h-24 rounded-2xl bg-secondary" />
        </div>
        <div className="h-[28rem] rounded-3xl bg-secondary lg:col-span-8" />
      </main>
    </div>
  );
}
