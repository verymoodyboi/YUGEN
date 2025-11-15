// src/services/historyService.ts
import { api } from "../../lib/api";
export interface HistoryItem {
  id: string;
  films: any; // you may replace with Film type
  watched_at: string;
}

export const historyService = {
  async getMyHistory(token:string): Promise<HistoryItem[]> {
    const { data } = await api.get("/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
    return data;
  },
   addHistory: async (filmId: string, token: string) => {
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
