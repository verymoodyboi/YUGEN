import { api } from "../../lib/api";
export interface HistoryItem {
  id: string;
  films: any;
  watched_at: string;
}

export const historyService = {
  async getMyHistory(token:any): Promise<HistoryItem[]> {
    const { data } = await api.get("/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
    return data;
  },
   addHistory: async (filmId: string, token: any) => {
    const { data } = await api.post(
      "/history/add",
      { filmId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  },
};
