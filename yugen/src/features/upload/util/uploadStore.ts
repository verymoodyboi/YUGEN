import { create } from "zustand";

type UploadState = {
  progress: Record<string, number>;
  setProgress: (filmUuid: string, value: number) => void;
  clearProgress: (filmUuid: string) => void;
};

export const useUploadStore = create<UploadState>((set) => ({
  progress: {},
  setProgress: (filmUuid, value) =>
    set((s) => ({
      progress: { ...s.progress, [filmUuid]: value },
    })),
  clearProgress: (filmUuid) =>
    set((s) => {
      const copy = { ...s.progress };
      delete copy[filmUuid];
      return { progress: copy };
    }),
}));
