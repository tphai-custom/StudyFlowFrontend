import { addDays } from "date-fns";
import { Habit, LibraryItem, Task, FreeSlot, TemplatePlan, Program } from "@/src/lib/types";
import { seedTasks } from "@/src/lib/storage/tasksRepo";
import { seedSlots } from "@/src/lib/storage/slotsRepo";
import { seedHabits } from "@/src/lib/storage/habitsRepo";
import { saveLibraryItems } from "@/src/lib/storage/libraryRepo";

const now = new Date();

const buildTask = (subject: string, title: string, daysAhead: number, minutes: number, difficulty: Task["difficulty"]): Task => ({
  id: crypto.randomUUID(),
  subject,
  title,
  deadline: addDays(now, daysAhead).toISOString(),
  difficulty,
  estimatedMinutes: minutes,
  importance: 2,
  contentFocus: "Ôn lại khái niệm chính",
  successCriteria: "Đạt 8/10 câu luyện",
  notes: undefined,
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
  progressMinutes: 0,
});

export const demoTasks: Task[] = [
  buildTask("Toán", "Ôn PT bậc 2", 5, 180, 4),
  buildTask("Văn", "Dàn ý nghị luận", 3, 120, 3),
  buildTask("KHTN", "Thí nghiệm hoá học", 7, 200, 5),
];

export const demoSlots: FreeSlot[] = [
  { id: crypto.randomUUID(), weekday: 1, startTime: "19:00", endTime: "21:00", capacityMinutes: 120, source: "user", createdAt: now.toISOString() },
  { id: crypto.randomUUID(), weekday: 3, startTime: "19:30", endTime: "21:00", capacityMinutes: 90, source: "user", createdAt: now.toISOString() },
  { id: crypto.randomUUID(), weekday: 5, startTime: "08:00", endTime: "10:00", capacityMinutes: 120, source: "user", createdAt: now.toISOString() },
];

export const demoHabits: Habit[] = [
  { id: crypto.randomUUID(), name: "Đọc sách 10 phút", cadence: "daily", minutes: 10, createdAt: now.toISOString(), preset: "pomodoro" },
  { id: crypto.randomUUID(), name: "Chạy bộ", cadence: "weekly", weekday: 6, minutes: 20, createdAt: now.toISOString(), preset: undefined },
];

export const demoLibrary: LibraryItem[] = [
  { id: crypto.randomUUID(), subject: "Toán", level: "Lớp 9", title: "PT bậc 2 cơ bản", summary: "Video + bài tập có đáp án", url: "https://example.com/toan", tags: ["PT", "bậc 2"] },
  { id: crypto.randomUUID(), subject: "Văn", level: "Lớp 8", title: "Nghị luận xã hội", summary: "Checklist mở bài-kết bài", url: "https://example.com/van", tags: ["dàn ý"] },
];

export const templates: TemplatePlan[] = [
  {
    id: "tpl-3day-review",
    name: "Ôn kiểm tra 3 ngày",
    durationDays: 3,
    recommendedMinutesPerDay: 90,
    tasks: [
      { subject: "Toán", title: "Tổng ôn công thức", estimatedMinutes: 120, difficulty: 3 },
      { subject: "Toán", title: "Làm đề mẫu", estimatedMinutes: 90, difficulty: 4 },
    ],
  },
  {
    id: "tpl-2week",
    name: "Ôn 2 tuần đều",
    durationDays: 14,
    recommendedMinutesPerDay: 60,
    tasks: [
      { subject: "Văn", title: "Đọc tài liệu", estimatedMinutes: 180, difficulty: 2 },
      { subject: "Văn", title: "Viết dàn ý", estimatedMinutes: 120, difficulty: 3 },
    ],
  },
  {
    id: "tpl-long-term",
    name: "Ôn dài hạn 1 tháng",
    durationDays: 30,
    recommendedMinutesPerDay: 45,
    tasks: [
      { subject: "KHTN", title: "Note khái niệm", estimatedMinutes: 240, difficulty: 3 },
      { subject: "KHTN", title: "Bài tập khó", estimatedMinutes: 300, difficulty: 5 },
    ],
  },
];

export const programs: Program[] = [
  {
    id: "prog-math-upgrade",
    name: "Tăng điểm Toán 7→8",
    target: "Hiểu sâu đại số và luyện đề",
    milestones: [
      {
        id: "mile-formula",
        title: "Thuộc công thức trọng tâm",
        successCriteria: "Hoàn thành 30 bài tập cơ bản",
        suggestedTasks: [{ subject: "Toán", title: "Flashcard công thức", estimatedMinutes: 120, difficulty: 2 }],
      },
      {
        id: "mile-exam",
        title: "Làm đề chuẩn",
        successCriteria: "Điểm mock >8",
        suggestedTasks: [{ subject: "Toán", title: "2 đề thi thử", estimatedMinutes: 180, difficulty: 4 }],
      },
    ],
  },
  {
    id: "prog-literature",
    name: "Cải thiện đọc hiểu Văn",
    target: "Tăng tốc độ đọc + phân tích",
    milestones: [
      {
        id: "mile-read",
        title: "Đọc 5 tác phẩm",
        successCriteria: "Ghi chú 5 insight",
        suggestedTasks: [{ subject: "Văn", title: "Đọc và note", estimatedMinutes: 200, difficulty: 3 }],
      },
    ],
  },
];

export async function seedDemoData() {
  await Promise.all([
    seedTasks(demoTasks),
    seedSlots(demoSlots),
    seedHabits(demoHabits),
    saveLibraryItems(demoLibrary),
  ]);
}
