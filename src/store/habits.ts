import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Completions,
  type Habit,
  type HabitColor,
  ALL_WEEKDAYS,
  createSeedData,
} from "@/lib/habits";
import { todayKey } from "@/lib/dates";

export type HabitDraft = {
  name: string;
  color: HabitColor;
  weekdays: number[];
};

type HabitState = {
  habits: Habit[];
  completions: Completions;
  initialized: boolean;
  addHabit: (draft: HabitDraft) => void;
  updateHabit: (id: string, draft: HabitDraft) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (habitId: string, dateKey: string) => void;
  completeScheduled: (dateKey: string) => void;
};

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      completions: {},
      initialized: false,
      addHabit: (draft) => {
        const name = draft.name.trim();
        if (!name) return;
        const habit: Habit = {
          id: crypto.randomUUID(),
          name: name.slice(0, 40),
          color: draft.color,
          createdAt: todayKey(),
          weekdays: draft.weekdays.length ? [...draft.weekdays].sort() : [...ALL_WEEKDAYS],
        };
        set({ habits: [...get().habits, habit] });
      },
      updateHabit: (id, draft) => {
        const name = draft.name.trim();
        if (!name) return;
        set({
          habits: get().habits.map((habit) =>
            habit.id === id
              ? {
                  ...habit,
                  name: name.slice(0, 40),
                  color: draft.color,
                  weekdays: draft.weekdays.length
                    ? [...draft.weekdays].sort()
                    : [...ALL_WEEKDAYS],
                }
              : habit,
          ),
        });
      },
      deleteHabit: (id) => {
        const completions = { ...get().completions };
        delete completions[id];
        set({
          habits: get().habits.filter((habit) => habit.id !== id),
          completions,
        });
      },
      toggleCompletion: (habitId, dateKey) => {
        if (dateKey > todayKey()) return;
        const completions = { ...get().completions };
        const forHabit = { ...(completions[habitId] ?? {}) };
        if (forHabit[dateKey]) delete forHabit[dateKey];
        else forHabit[dateKey] = true;
        completions[habitId] = forHabit;
        set({ completions });
      },
      completeScheduled: (dateKey) => {
        if (dateKey > todayKey()) return;
        const date = new Date(
          Number(dateKey.slice(0, 4)),
          Number(dateKey.slice(5, 7)) - 1,
          Number(dateKey.slice(8, 10)),
        );
        const completions = { ...get().completions };
        for (const habit of get().habits) {
          const everyDay = habit.weekdays.length === 0 || habit.weekdays.length === 7;
          if (!everyDay && !habit.weekdays.includes(date.getDay())) continue;
          completions[habit.id] = { ...(completions[habit.id] ?? {}), [dateKey]: true };
        }
        set({ completions });
      },
    }),
    {
      name: "lumen-habits-v1",
      skipHydration: true,
      version: 1,
      partialize: (state) => ({
        habits: state.habits,
        completions: state.completions,
        initialized: state.initialized,
      }),
    },
  ),
);

export async function hydrateHabitStore(): Promise<void> {
  await useHabitStore.persist.rehydrate();
  const state = useHabitStore.getState();
  if (!state.initialized) {
    const seed = createSeedData();
    useHabitStore.setState({
      habits: seed.habits,
      completions: seed.completions,
      initialized: true,
    });
  }
}
