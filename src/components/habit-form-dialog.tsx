import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALL_WEEKDAYS, HABIT_COLOR_CLASS, HABIT_COLORS, WEEKDAY_FULL, WEEKDAY_LABELS, type Habit, type HabitColor } from "@/lib/habits";
import { cn } from "@/lib/utils";
import type { HabitDraft } from "@/store/habits";

type HabitFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSubmit: (draft: HabitDraft) => void;
};

export function HabitFormDialog({ open, onOpenChange, habit, onSubmit }: HabitFormDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<HabitColor>("pine");
  const [weekdays, setWeekdays] = useState<number[]>([...ALL_WEEKDAYS]);

  useEffect(() => {
    if (!open) return;
    setName(habit?.name ?? "");
    setColor(habit?.color ?? "pine");
    setWeekdays(habit?.weekdays?.length ? [...habit.weekdays] : [...ALL_WEEKDAYS]);
  }, [open, habit]);

  function toggleDay(day: number) {
    setWeekdays((current) => {
      if (current.includes(day)) {
        const next = current.filter((value) => value !== day);
        return next.length === 0 ? [day] : next;
      }
      return [...current, day].sort();
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, color, weekdays });
    onOpenChange(false);
  }

  const isEdit = Boolean(habit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit habit" : "New habit"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "Update the name, color, or days this shows up." : "Give it a name and a color. You can change the schedule anytime."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Morning stretch"
              maxLength={40}
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((option) => {
                const selected = color === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={selected}
                    onClick={() => setColor(option.id)}
                    className={cn(
                      "size-9 rounded-full border-2 transition-[transform,box-shadow] duration-150 ease-out",
                      HABIT_COLOR_CLASS[option.id].bg,
                      selected
                        ? "border-foreground ring-2 ring-foreground/15 ring-offset-2 ring-offset-card"
                        : "border-transparent hover:scale-105",
                    )}
                  />
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Days</Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_WEEKDAYS.map((day) => {
                const selected = weekdays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={selected}
                    aria-label={WEEKDAY_FULL[day]}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "size-10 rounded-full text-sm font-medium transition-[background-color,color] duration-150 ease-out",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {WEEKDAY_LABELS[day]}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {isEdit ? "Save" : "Add habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
