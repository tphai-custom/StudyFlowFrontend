import { Habit } from "@/src/lib/types";
import { apiGet, apiPost, apiPut, apiDelete } from "@/src/lib/api/client";

export async function listHabits(): Promise<Habit[]> {
  return apiGet<Habit[]>("/habits");
}

export async function saveHabit(
  payload: Pick<Habit, "name" | "cadence" | "minutes"> & { weekday?: number; id?: string; preset?: Habit["preset"] },
): Promise<Habit> {
  const body = {
    name: payload.name,
    cadence: payload.cadence,
    weekday: payload.cadence === "weekly" ? payload.weekday ?? 1 : undefined,
    minutes: payload.minutes,
    preset: payload.preset,
  };
  if (payload.id) {
    return apiPut<Habit>(`/habits/${payload.id}`, body);
  }
  return apiPost<Habit>("/habits", body);
}

export async function deleteHabit(id: string): Promise<void> {
  await apiDelete(`/habits/${id}`);
}

export async function seedHabits(sample: Habit[]): Promise<void> {
  await Promise.all(
    sample.map((h) =>
      apiPost<Habit>("/habits", {
        name: h.name,
        cadence: h.cadence,
        weekday: h.weekday,
        minutes: h.minutes,
        preset: h.preset,
      }),
    ),
  );
}
