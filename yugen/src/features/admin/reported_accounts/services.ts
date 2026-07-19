import { api } from "../../../lib/api";

export interface ReportedAccount {
  id: string;
  reported: string;
  reported_by: string;
  reason: string;
  report: string;
  reported_at: string;
  reported_user?: {
    username?: string;
    f_name?: string;
    l_name?: string;
    pfp_path?: string;
    email?: string;
  };
  reporter?: {
    username?: string;
  };
}

export async function fetchReportedAccounts(): Promise<ReportedAccount[]> {
  const { data } = await api.get("admin/reported");
  return data;
}

export async function dismissReport(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post(`admin/reported/dismiss/${id}`);
  return data;
}

export async function banUser(auth_id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete(`admin/reported/ban/${auth_id}`);
  return data;
}