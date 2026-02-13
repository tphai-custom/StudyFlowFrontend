import { addDays } from "date-fns";
import { APP_TIMEZONE, Habit, LibraryItem, Task, FreeSlot, TemplatePlan, Program } from "@/src/lib/types";
import { seedTasks } from "@/src/lib/storage/tasksRepo";
import { seedSlots } from "@/src/lib/storage/slotsRepo";
import { seedHabits } from "@/src/lib/storage/habitsRepo";
import { saveLibraryItems } from "@/src/lib/storage/libraryRepo";

const now = new Date();

const buildTask = (
  subject: string,
  title: string,
  daysAhead: number,
  minutes: number,
  difficulty: Task["difficulty"],
): Task => ({
  id: crypto.randomUUID(),
  subject,
  title,
  deadline: addDays(now, daysAhead).toISOString(),
  timezone: APP_TIMEZONE,
  difficulty,
  durationEstimateMin: minutes,
  durationEstimateMax: minutes,
  durationUnit: "minutes",
  estimatedMinutes: minutes,
  importance: 2,
  contentFocus: "Ôn lại khái niệm chính",
  successCriteria: ["Đạt 8/10 câu luyện"],
  milestones: [
    {
      id: crypto.randomUUID(),
      title: "Ôn lý thuyết",
      minutesEstimate: Math.max(30, Math.round(minutes / 3)),
    },
    {
      id: crypto.randomUUID(),
      title: "Làm bài tập",
      minutesEstimate: Math.max(30, Math.round((minutes * 2) / 3)),
    },
  ],
  notes: undefined,
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
  progressMinutes: 0,
});

export const demoTasks: Task[] = [
  buildTask("Toán", "Ôn PT bậc 2 + Luyện đề", 5, 240, 4),
  buildTask("Văn", "Dàn ý nghị luận", 3, 150, 3),
  buildTask("KHTN", "Thí nghiệm hoá học + Báo cáo", 7, 240, 5),
];

export const demoSlots: FreeSlot[] = [
  { id: crypto.randomUUID(), weekday: 1, startTime: "19:00", endTime: "20:30", capacityMinutes: 90, source: "user", createdAt: now.toISOString() },
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
    forWho: "Lịch gấp trong 1 môn",
    recommendedFor: ["Học sinh cuối cấp", "Ôn trước bài kiểm tra"],
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
    forWho: "Bạn cần nhịp đều",
    recommendedFor: ["Học sinh cần ôn từng chút", "Lịch học song song CLB"],
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
    forWho: "Ôn nền tảng",
    recommendedFor: ["Bạn muốn học từ tốn", "Cần bám mục tiêu dài"],
    tasks: [
      { subject: "KHTN", title: "Note khái niệm", estimatedMinutes: 240, difficulty: 3 },
      { subject: "KHTN", title: "Bài tập khó", estimatedMinutes: 300, difficulty: 5 },
    ],
  },
  {
    id: "tpl-7day-refresh",
    name: "Refresh 7 ngày",
    durationDays: 7,
    recommendedMinutesPerDay: 75,
    forWho: "Cần làm nóng lại",
    recommendedFor: ["Sau kỳ nghỉ dài", "Mất nhịp học"],
    tasks: [
      { subject: "Tiếng Anh", title: "Listening intensive", estimatedMinutes: 210, difficulty: 3 },
      { subject: "Tiếng Anh", title: "Viết essay", estimatedMinutes: 180, difficulty: 4 },
    ],
  },
  {
    id: "tpl-30day-deepdive",
    name: "Deep-dive 30 ngày",
    durationDays: 30,
    recommendedMinutesPerDay: 120,
    forWho: "Học sinh chuyên",
    recommendedFor: ["Ôn thi HSG", "Tự học nâng band"],
    tasks: [
      { subject: "KHTN", title: "Lab note", estimatedMinutes: 360, difficulty: 4 },
      { subject: "Toán", title: "Đề nâng cao", estimatedMinutes: 480, difficulty: 5 },
    ],
  },
  {
    id: "tpl-60day-grind",
    name: "Ôn dài hạn 60 ngày",
    durationDays: 60,
    recommendedMinutesPerDay: 90,
    forWho: "Chuẩn bị thi chuyển cấp",
    recommendedFor: ["Lớp 9", "Luyện đề dày"],
    tasks: [
      { subject: "Toán", title: "Chuyên đề hình học", estimatedMinutes: 600, difficulty: 5 },
      { subject: "Văn", title: "Ngân hàng dẫn chứng", estimatedMinutes: 300, difficulty: 3 },
    ],
  },
];

export const programs: Program[] = [
  {
    id: "prog-math-upgrade",
    name: "Tăng điểm Toán 7→8",
    target: "Hiểu sâu đại số và luyện đề",
    recommendedFor: ["Lớp 9", "Đang yếu phần đại số"],
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
    recommendedFor: ["Lớp 8-9", "Mất gốc văn"],
    milestones: [
      {
        id: "mile-read",
        title: "Đọc 5 tác phẩm",
        successCriteria: "Ghi chú 5 insight",
        suggestedTasks: [{ subject: "Văn", title: "Đọc và note", estimatedMinutes: 200, difficulty: 3 }],
      },
    ],
  },
  {
    id: "prog-science",
    name: "KHTN: Hô hấp & tế bào",
    target: "Nắm chắc cơ chế",
    recommendedFor: ["Lớp 9", "Ôn thi vào 10"],
    milestones: [
      {
        id: "mile-resp",
        title: "Sơ đồ hoá quá trình",
        successCriteria: "Vẽ được sơ đồ đúng",
        suggestedTasks: [{ subject: "KHTN", title: "Respiration map", estimatedMinutes: 180, difficulty: 4 }],
      },
      {
        id: "mile-cell",
        title: "Bài tập ứng dụng",
        successCriteria: "Giải 15 câu vận dụng",
        suggestedTasks: [{ subject: "KHTN", title: "Cell practice", estimatedMinutes: 240, difficulty: 5 }],
      },
    ],
  },
  {
    id: "prog-english",
    name: "Tiếng Anh vocab + writing",
    target: "Tăng band 1.0",
    recommendedFor: ["IELTS 5.5-6.0", "Thi THPT"],
    milestones: [
      {
        id: "mile-vocab",
        title: "200 từ học thuật",
        successCriteria: "Flashcard đúng 90%",
        suggestedTasks: [{ subject: "Tiếng Anh", title: "Spaced repetition", estimatedMinutes: 150, difficulty: 3 }],
      },
      {
        id: "mile-writing",
        title: "4 bài essay",
        successCriteria: ">=6.5 điểm",
        suggestedTasks: [{ subject: "Tiếng Anh", title: "Essay drill", estimatedMinutes: 240, difficulty: 4 }],
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
