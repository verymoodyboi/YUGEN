import React from "react";
import { useUploadManager } from "./useUploadManager";
import { FiTrash2 } from "react-icons/fi";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatEta = (ms: number) => {
  if (ms <= 0) return "0s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
};

const ProfileUploads: React.FC = () => {
  const { uploads, cancelUpload, removeUpload, history, clearHistory } = useUploadManager();

  return (
    <div className="w-full bg-emerald-50 p-4 rounded-lg border-2 border-emerald-950">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-freckle">Active Uploads</h3>
        <div className="text-sm text-emerald-950/70">{uploads.length} active</div>
      </div>

      <div className="space-y-3">
        {uploads.length === 0 && (
          <div className="text-sm text-emerald-950/70">No active uploads</div>
        )}

        {uploads.map((u) => (
          <div key={u.id} className="bg-emerald-50 border-2 border-emerald-950 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold text-emerald-950 truncate">{u.fileName}</div>
                <div className="text-xs text-emerald-950/70">{formatBytes(u.size)}</div>
              </div>
              <div className="text-right text-xs">
                <div>{`${u.progress}%`}</div>
                <div className="text-emerald-950/70">{u.status}</div>
              </div>
            </div>

            <div className="w-full bg-emerald-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="h-2 bg-emerald-950" style={{ width: `${u.progress}%` }} />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-emerald-950/70">{u.startedAt ? new Date(u.startedAt).toLocaleTimeString() : "-"}</div>
              <div className="flex items-center gap-2">
                {u.status === "uploading" && (
                  <>
                    <div className="text-xs text-emerald-950/70 mr-2">
                      {u.loadedBytes > 0 && u.progress > 0 ? (() => {
                        const elapsedMs = Date.now() - u.startedAt;
                        const speedBps = u.loadedBytes / (elapsedMs / 1000);
                        const remaining = u.size - u.loadedBytes;
                        const etaMs = speedBps > 0 ? (remaining / speedBps) * 1000 : 0;
                        return `ETA: ${etaMs < 1000 ? '<1s' : formatEta(etaMs)}`;
                      })() : "ETA: calculating"}
                    </div>
                    <button
                      onClick={() => cancelUpload(u.id)}
                      className="px-3 py-1 rounded-full border border-red-500 text-red-600 text-xs"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => removeUpload(u.id)}
                  className="p-2 rounded-full hover:bg-emerald-100"
                  title={u.status === 'uploading' ? 'Cancel & remove' : 'Remove'}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-freckle text-md">Upload History</h4>
          <button onClick={clearHistory} className="text-xs px-2 py-1 border rounded">Clear</button>
        </div>
        {history.length === 0 ? (
          <div className="text-xs text-emerald-950/70">No upload history yet</div>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="border-2 border-emerald-950 rounded-lg p-2 bg-emerald-50">
                <div className="flex justify-between text-sm">
                  <div className="truncate">{h.fileName}</div>
                  <div className="text-emerald-950/70">{h.status}{h.filmId ? ` · ${h.filmId.slice(0,8)}` : ''}</div>
                </div>
                <div className="text-xs text-emerald-950/70">
                  {new Date(h.startedAt).toLocaleString()} → {h.finishedAt ? new Date(h.finishedAt).toLocaleTimeString() : '-'}
                  {h.error ? ` · ${h.error}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileUploads;
