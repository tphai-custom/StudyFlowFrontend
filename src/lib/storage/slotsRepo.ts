import { FreeSlot } from "@/src/lib/types";
import { apiGet, apiPost, apiPut, apiDelete } from "@/src/lib/api/client";

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export async function listSlots(): Promise<FreeSlot[]> {
  return apiGet<FreeSlot[]>("/slots/");
}

export async function saveSlot(
  payload: Pick<FreeSlot, "weekday" | "startTime" | "endTime"> & { id?: string },
): Promise<FreeSlot> {
  const duration = toMinutes(payload.endTime) - toMinutes(payload.startTime);
  if (duration <= 0) throw new Error("Giờ kết thúc phải sau giờ bắt đầu");
  const body = {
    weekday: payload.weekday,
    startTime: payload.startTime,
    endTime: payload.endTime,
    capacityMinutes: duration,
    source: "user" as const,
  };
  if (payload.id) {
    return apiPut<FreeSlot>(`/slots/${payload.id}`, body);
  }
  return apiPost<FreeSlot>("/slots/", body);
}

export async function deleteSlot(id: string): Promise<void> {
  await apiDelete(`/slots/${id}`);
}

export async function seedSlots(sample: FreeSlot[]): Promise<void> {
  await Promise.all(
    sample.map((s) =>
      apiPost<FreeSlot>("/slots/", {
        weekday: s.weekday,
        startTime: s.startTime,
        endTime: s.endTime,
        capacityMinutes: s.capacityMinutes,
        source: s.source,
      }),
    ),
  );
}
