import { Task } from "@/src/lib/types";
import { readStore, writeStore } from "@/src/lib/storage/db";
import { TaskFormValues } from "@/src/lib/validation/taskSchema";

const STORE = "tasks" as const;

export async function listTasks(): Promise<Task[]> {
  return readStore<Task>(STORE);
}

export async function saveTask(payload: TaskFormValues & { id?: string }): Promise<Task> {
  const tasks = await listTasks();
  const now = new Date().toISOString();
  const existingIndex = payload.id
    ? tasks.findIndex((task) => task.id === payload.id)
    : -1;
  const baseTask: Task = {
    id: payload.id ?? crypto.randomUUID(),
    subject: payload.subject,
    title: payload.title,
    deadline: payload.deadline,
    difficulty: payload.difficulty as Task["difficulty"],
    estimatedMinutes: payload.estimatedMinutes,
    importance: payload.importance ? (payload.importance as 1 | 2 | 3) : undefined,
    contentFocus: payload.contentFocus,
    successCriteria: payload.successCriteria,
    notes: undefined,
    createdAt: existingIndex >= 0 ? tasks[existingIndex].createdAt : now,
    updatedAt: now,
    progressMinutes: existingIndex >= 0 ? tasks[existingIndex].progressMinutes : 0,
  };

  if (existingIndex >= 0) {
    tasks[existingIndex] = baseTask;
  } else {
    tasks.push(baseTask);
  }
  await writeStore(STORE, tasks);
  return baseTask;
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await listTasks();
  await writeStore(
    STORE,
    tasks.filter((task) => task.id !== id),
  );
}

export async function seedTasks(sample: Task[]): Promise<void> {
  await writeStore(STORE, sample);
}
