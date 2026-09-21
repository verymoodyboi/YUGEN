import { api } from "../../../lib/api";

export async function fetchSupportTickets() {
  const res = await api.get("/support/technical");
  return res.data;
}

export async function replySupportTicket(id: string, message: string) {
  const res = await api.post(`/support/technical/${id}/reply`, { message });
  return res.data;
}
