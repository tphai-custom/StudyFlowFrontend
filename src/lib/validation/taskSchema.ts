import { z } from "zod";

const MIN_TASK_MINUTES = 10;
const MAX_TASK_MINUTES = 600;

const deadlineString = z
  .string({ required_error: "Vui lòng chọn deadline" })
  .refine((value) => value.trim().length > 0, {
    message: "Deadline không hợp lệ",
  })
  .transform((value) => {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return `${trimmed}T23:59:00+07:00`;
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
      return `${trimmed}:00+07:00`;
    }
    if (!trimmed.includes("+")) {
      return `${trimmed}`;
    }
    return trimmed;
  })
  .refine((value) => {
    const date = new Date(value);
    return !Number.isNaN(date.valueOf()) && date > new Date();
  }, "Deadline phải nằm trong tương lai");

export const taskSchema = z.object({
  subject: z.string().min(1, "Nhập môn học"),
  title: z.string().min(1, "Nhập tên nhiệm vụ"),
  deadline: deadlineString,
  difficulty: z
    .coerce
    .number({ invalid_type_error: "Độ khó phải từ 1-5" })
    .min(1, "Tối thiểu 1")
    .max(5, "Tối đa 5"),
  estimatedMinutes: z
    .coerce
    .number({ invalid_type_error: "Thời lượng phải là số" })
    .min(MIN_TASK_MINUTES, `Tối thiểu ${MIN_TASK_MINUTES} phút`)
    .max(MAX_TASK_MINUTES, "Bạn có nhầm đơn vị không? Giữ trong 600 phút"),
  importance: z
    .preprocess((value) => {
      if (value === "" || value === undefined || value === null) {
        return undefined;
      }
      return Number(value);
    }, z.number().min(1, "Tối thiểu 1").max(3, "Tối đa 3"))
    .optional(),
  contentFocus: z.string().optional(),
  successCriteria: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
