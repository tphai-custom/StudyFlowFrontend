import { z } from "zod";
import { DurationUnit } from "@/src/lib/types";

const MIN_TASK_MINUTES = 10;
const MAX_TASK_MINUTES = 600;
const DURATION_UNITS = ["minutes", "hours"] as const satisfies readonly DurationUnit[];

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

const milestoneSchema = z.object({
  title: z.string().min(1, "Nhập tiêu đề mốc"),
  minutesEstimate: z
    .coerce
    .number({ invalid_type_error: "Phải nhập phút" })
    .min(5, "Tối thiểu 5 phút")
    .max(480, "Quá dài, hãy chia nhỏ"),
});

export const taskSchema = z.object({
  subject: z.string().min(1, "Nhập môn học"),
  title: z.string().min(1, "Nhập tên nhiệm vụ"),
  deadline: deadlineString,
  difficulty: z
    .coerce
    .number({ invalid_type_error: "Độ khó phải từ 1-5" })
    .min(1, "Tối thiểu 1")
    .max(5, "Tối đa 5"),
  durationEstimateMin: z
    .coerce
    .number({ invalid_type_error: "Nhập số phút/giờ" })
    .min(1, "Ước lượng tối thiểu phải >0"),
  durationEstimateMax: z
    .coerce
    .number({ invalid_type_error: "Nhập số phút/giờ" })
    .min(1, "Ước lượng tối đa phải >0"),
  durationUnit: z.enum(DURATION_UNITS),
  importance: z
    .preprocess((value) => {
      if (value === "" || value === undefined || value === null) {
        return undefined;
      }
      return Number(value);
    }, z.number().min(1, "Tối thiểu 1").max(3, "Tối đa 3"))
    .optional(),
  contentFocus: z.string().optional(),
  successCriteria: z
    .array(z.string().min(1, "Nhập tiêu chí"))
    .min(1, "Thêm ít nhất 1 tiêu chí"),
  milestones: z.array(milestoneSchema).optional(),
}).refine((data) => data.durationEstimateMin <= data.durationEstimateMax, {
  message: "Ước lượng min phải nhỏ hơn max",
  path: ["durationEstimateMin"],
});

export type TaskFormValues = z.infer<typeof taskSchema>;
