import { Habit } from "@/src/lib/types";
import { readStore, writeStore } from "@/src/lib/storage/db";

const STORE = "habits" as const;

export async function listHabits(): Promise<Habit[]> {
  return readStore<Habit>(STORE);
}

export async function saveHabit(
  payload: Pick<Habit, "name" | "cadence" | "minutes"> & { weekday?: number; id?: string; preset?: Habit["preset"] },
): Promise<Habit> {
  const habits = await listHabits();
  const habit: Habit = {
    id: payload.id ?? crypto.randomUUID(),
    name: payload.name,
    cadence: payload.cadence,
    weekday: payload.cadence === "weekly" ? payload.weekday ?? 1 : undefined,
    minutes: payload.minutes,
    preset: payload.preset,
    createdAt: new Date().toISOString(),
  };
  const index = habits.findIndex((item) => item.id === habit.id);
  if (index >= 0) {
    habits[index] = habit;
  } else {
    habits.push(habit);
  }
  await writeStore(STORE, habits);
  return habit;
}

export async function deleteHabit(id: string): Promise<void> {
  const habits = await listHabits();
  await writeStore(
    STORE,
    habits.filter((habit) => habit.id !== id),
  );
}

export async function seedHabits(sample: Habit[]): Promise<void> {
  await writeStore(STORE, sample);
}
