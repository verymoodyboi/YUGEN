import { api } from "../../../lib/api";

export type ModerationStatus = "queued" | "quality_control";

export interface PendingUpload {
  film_uuid: string;
  moderation_status: ModerationStatus;
  uploaded_at: string;
  films?: {
    title?: string;
    poster_path?: string;
    uploader?: {
      username?: string;
    };
  };
}

export async function fetchPendingUploads(): Promise<PendingUpload[]> {
  const { data } = await api.get("/admin/QA/pending");
  return data;
}

export async function acceptUpload(
  film_uuid: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post(`/admin/QA/accept/${film_uuid}`);
  return data;
}

export async function rejectUpload(
  film_uuid: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post(`/admin/QA/reject/${film_uuid}`);
  return data;
}
