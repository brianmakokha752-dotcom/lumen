import {
  addDays,
  addMonths,
  eachDayOfInterval,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function todayDate(): Date {
  return startOfDay(new Date());
}

export function todayKey(): string {
  return toDateKey(todayDate());
}

export function isFutureDay(date: Date, today = todayDate()): boolean {
  return isAfter(startOfDay(date), today);
}

export function isToday(date: Date, today = todayDate()): boolean {
  return isSameDay(date, today);
}

export function weekdayIndex(date: Date): number {
  return date.getDay();
}

export function mondayOf(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function weekDays(anchor: Date): Date[] {
  const start = mondayOf(anchor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthGrid(month: Date): (Date | null)[] {
  const start = startOfMonth(month);
  const startOffset = (start.getDay() + 6) % 7;
  const days = eachDayOfInterval({
    start,
    end: new Date(start.getFullYear(), start.getMonth() + 1, 0),
  });
  const cells: (Date | null)[] = Array.from({ length: startOffset }, () => null);
  cells.push(...days);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function shiftMonth(month: Date, delta: number): Date {
  return delta >= 0 ? addMonths(month, delta) : subMonths(month, -delta);
}

export function formatLongDate(date: Date): string {
  return format(date, "EEEE, d MMMM");
}

export function formatShortMonth(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function formatWeekday(date: Date): string {
  return format(date, "EEEEE");
}

export function formatDayNumber(date: Date): string {
  return format(date, "d");
}

export function daysBack(from: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => subDays(from, count - 1 - i));
}

export { isSameMonth, subDays, addDays, startOfMonth };
