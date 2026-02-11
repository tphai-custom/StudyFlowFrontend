import { FreeSlot } from "@/src/lib/types";
import { readStore, writeStore } from "@/src/lib/storage/db";

const STORE = "freeSlots" as const;

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export async function listSlots(): Promise<FreeSlot[]> {
  return readStore<FreeSlot>(STORE);
}

export async function saveSlot(
  payload: Pick<FreeSlot, "weekday" | "startTime" | "endTime"> & { id?: string },
): Promise<FreeSlot> {
  const slots = await listSlots();
  const duration = toMinutes(payload.endTime) - toMinutes(payload.startTime);
  if (duration <= 0) {
    throw new Error("Giờ kết thúc phải sau giờ bắt đầu");
  }
  const slot: FreeSlot = {
    id: payload.id ?? crypto.randomUUID(),
    weekday: payload.weekday,
    startTime: payload.startTime,
    endTime: payload.endTime,
    capacityMinutes: duration,
    source: "user",
    createdAt: new Date().toISOString(),
  };

  const index = slots.findIndex((s) => s.id === slot.id);
  if (index >= 0) {
    slots[index] = slot;
  } else {
    slots.push(slot);
  }
  await writeStore(STORE, slots);
  return slot;
}

export async function deleteSlot(id: string): Promise<void> {
  const slots = await listSlots();
  await writeStore(
    STORE,
    slots.filter((slot) => slot.id !== id),
  );
}

export async function seedSlots(sample: FreeSlot[]): Promise<void> {
  await writeStore(STORE, sample);
}
