import { apiGet } from "./client";

export interface EffectiveSettingsResult {
  effective_values: Record<string, string | number | null>;
  student_values: Record<string, string | number | null>;
  locked_fields: string[];
  locked_values: Record<string, string | number | null>;
}

export const getEffectiveSettings = () =>
  apiGet<EffectiveSettingsResult>("/settings/effective");
