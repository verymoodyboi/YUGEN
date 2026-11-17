import { api } from "../../lib/api";
// === Film report ===
export async function submitFilmReport(
  data: { auth_id: string; report: string; reportType: string; film_id: string }
) {
  const res = await api.post("/report/film", data);
  return res.data;
}

// === Technical report ===
export async function submitTechnicalReport(
  data: { auth_id: string; report: string; reportType: string }
) {
  const res = await api.post("/support/technical", data);
  return res.data;
}
