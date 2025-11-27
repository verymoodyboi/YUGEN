import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { api } from "../../lib/api";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

export type UploadStatus = "idle" | "uploading" | "completed" | "failed" | "canceled";

export type UploadItem = {
  id: string;
  fileName: string;
  size: number;
  progress: number; // 0-100 network upload
  loadedBytes: number; // raw loaded bytes for speed calc
  status: UploadStatus;
  startedAt: number;
  finishedAt?: number | null;
  error?: string | null;
  cancel?: () => void;
  filmId?: string;
};

export type UploadRecord = {
  id: string;
  fileName: string;
  size: number;
  status: UploadStatus;
  startedAt: number;
  finishedAt?: number | null;
  error?: string | null;
  filmId?: string;
};


type UploadManagerContextValue = {
  uploads: UploadItem[];
  addUpload: (file: File, meta?: Record<string, any>) => string;
  cancelUpload: (id: string) => void;
  removeUpload: (id: string) => void;
  openPanel: boolean;
  setOpenPanel: (v: boolean) => void;
  history: UploadRecord[];
  clearHistory: () => void;
};

const UploadManagerContext = createContext<UploadManagerContextValue | null>(null);

export const useUploadManager = () => {
  const ctx = useContext(UploadManagerContext);
  if (!ctx) throw new Error("useUploadManager must be used within UploadProvider");
  return ctx;
};

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [openPanel, setOpenPanel] = useState<boolean>(false);
  const { getAccessToken, userInfo } = useAuth();
  const [history, setHistory] = useState<UploadRecord[]>(() => {
    try {
      const raw = localStorage.getItem("yugen.uploadHistory");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("yugen.uploadHistory", JSON.stringify(history));
    } catch {}
  }, [history]);

  const addUpload = useCallback((file: File, meta: Record<string, any> = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const startedAt = Date.now();

    const newItem: UploadItem = {
      id,
      fileName: file.name,
      size: file.size,
      progress: 0,
      loadedBytes: 0,
      status: "idle",
      startedAt,
      finishedAt: null,
      error: null,
    };

    setUploads((s) => [newItem, ...s]);
    // open panel so user can see progress
    setOpenPanel(true);

    // start upload async
    (async () => {
      const source = axios.CancelToken.source();

      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: "uploading", cancel: () => source.cancel("user_cancel") } : u))
      );

      try {
        const token = await getAccessToken();

        const formData = new FormData();
        formData.append("Film", file, file.name); // Backend expects "Film" not "file"
        formData.append("uplouderUsername", userInfo?.username || ""); // Backend expects uplouderUsername
        // append meta fields
        Object.keys(meta || {}).forEach((k) => {
          const v = (meta as any)[k];
          if (v !== undefined && v !== null) {
            // if it's a File instance append as file
            if (typeof File !== "undefined" && v instanceof File) {
              formData.append(k, v, v.name);
            } else if (typeof v === "object") {
              formData.append(k, JSON.stringify(v));
            } else {
              formData.append(k, String(v));
            }
          }
        });

        const resp = await api.post(
          "/films/upload",
          formData,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "multipart/form-data",
            },
            cancelToken: source.token,
            onUploadProgress: (ev: ProgressEvent) => {
              const progress = ev.total ? Math.round((ev.loaded / ev.total) * 100) : 0;
              const loadedBytes = ev.loaded;
              setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress, loadedBytes } : u)));
            },
          }
        );
        const filmId = resp?.data?.filmId as string | undefined;
        // Network upload complete — mark as completed client-side only
        const finishedAt = Date.now();
        setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: 100, loadedBytes: u.size, status: "completed", finishedAt, filmId } : u)));
        setHistory((h) => [{ id, fileName: file.name, size: file.size, status: "completed", startedAt, finishedAt, filmId }, ...h]);
        toast.success(`${file.name} uploaded`, { autoClose: 3000, closeOnClick: true });
      } catch (err: any) {
        if (axios.isCancel(err)) {
          setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: "canceled", finishedAt: Date.now(), error: "canceled" } : u)));
          setHistory((h) => [{ id, fileName: file.name, size: file.size, status: "canceled", startedAt, finishedAt: Date.now(), error: "canceled" }, ...h]);
          toast.warn(`${file.name} upload canceled`, { autoClose: 4000 });
        } else {
          setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: "failed", finishedAt: Date.now(), error: String(err?.message || err) } : u)));
          setHistory((h) => [{ id, fileName: file.name, size: file.size, status: "failed", startedAt, finishedAt: Date.now(), error: String(err?.message || err) }, ...h]);
          toast.error(`${file.name} upload failed`, { autoClose: 6000 });
        }
      }
    })();

    return id;
  }, [getAccessToken, userInfo]);



  const cancelUpload = useCallback((id: string) => {
    // Mark canceled but keep entry (user can still view status)
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, status: "canceled", finishedAt: Date.now(), error: "canceled" } : u)));
    const item = uploads.find((u) => u.id === id);
    if (item && item.cancel) item.cancel();
  }, [uploads]);

  const removeUpload = useCallback((id: string) => {
    // If still uploading, cancel then remove
    const item = uploads.find((u) => u.id === id);
    if (item && item.status === "uploading" && item.cancel) item.cancel();
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, [uploads]);

  const clearHistory = useCallback(() => setHistory([]), []);

  const value = useMemo(() => ({ uploads, addUpload, cancelUpload, removeUpload, openPanel, setOpenPanel, history, clearHistory }), [uploads, addUpload, cancelUpload, removeUpload, openPanel, history, clearHistory]);

  return <UploadManagerContext.Provider value={value}>{children}</UploadManagerContext.Provider>;
};

export default UploadManagerContext;
