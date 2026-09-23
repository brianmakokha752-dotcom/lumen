import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { HABIT_COLOR_CLASS, type HabitColor } from "@/lib/habits";

type CheckToggleProps = {
  checked: boolean;
  color: HabitColor;
  label: string;
  disabled?: boolean;
  onToggle: () => void;
};

export function CheckToggle({ checked, color, label, disabled, onToggle }: CheckToggleProps) {
  const tones = HABIT_COLOR_CLASS[color];
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative grid size-11 shrink-0 place-items-center rounded-full border-2 transition-[background-color,border-color,transform,box-shadow] duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:not-disabled:scale-[0.96] disabled:opacity-40",
        checked
          ? cn(tones.bg, "border-transparent text-on-habit")
          : "border-border bg-card text-transparent hover:border-foreground/30",
      )}
    >
      <Check
        className={cn(
          "size-5 transition-[opacity,transform] duration-150 ease-out",
          checked ? "scale-100 opacity-100" : "scale-75 opacity-0",
        )}
        strokeWidth={2.5}
      />
    </button>
  );
}
