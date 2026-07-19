import { api } from "../../lib/api";

export interface SubmitReportPayload {
  reported_by:any
  reported: string;
  reason: string;
  report?: string;
}

export const REPORT_REASONS: string[] = [
  "Spam or misleading content",
  "Harassment or bullying",
  "Hate speech or symbols",
  "Nudity or sexual content",
  "Violent or graphic content",
  "Impersonation",
  "Intellectual property violation",
  "Other",
];

export async function submitReport(payload: SubmitReportPayload): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post("report/account", payload);
  return data;
}
