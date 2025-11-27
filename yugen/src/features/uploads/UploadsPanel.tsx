import React from "react";
import { useUploadManager, UploadItem } from "./useUploadManager";
import { FiX, FiTrash2 } from "react-icons/fi";

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

const UploadsPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { uploads, cancelUpload, removeUpload, history, clearHistory } = useUploadManager();

  if (!open) return null;

  return (
    <div
      className="fixed right-0 top-0 h-full w-full md:w-96 bg-emerald-50 z-50 border-l-2 border-emerald-950 p-4 overflow-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-freckle text-lg">Uploads</h3>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-emerald-100">
          <FiX />
        </button>
      </div>

      <div className="space-y-3">
        {uploads.length === 0 && <div className="text-sm">No active uploads</div>}
        {uploads.map((u: UploadItem) => (
          <div key={u.id} className="bg-emerald-50 border-2 border-emerald-950 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold text-emerald-950 truncate">{u.fileName}</div>
                <div className="text-xs text-emerald-950/70">{formatBytes(u.size)}</div>
                {/* backend messages removed in revert */}
              </div>
              <div className="text-right text-xs">
                <div>{`${u.progress}%`}</div>
                <div className="text-emerald-950/70">{u.status}</div>
              </div>
            </div>

            {/* Network upload progress */}
            <div className="w-full bg-emerald-100 h-2 rounded-full mt-3 overflow-hidden">
              <div className="h-2 bg-emerald-950" style={{ width: `${u.progress}%` }} />
            </div>
            
            {/* backend processing bar removed in revert */}

            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-emerald-950/70">{u.startedAt ? new Date(u.startedAt).toLocaleTimeString() : "-"}</div>
              <div className="flex items-center gap-2">
                {u.status === "uploading" && (
                  <>
                    <div className="text-xs text-emerald-950/70 mr-2">
                      {u.loadedBytes > 0 && u.progress > 0 ? (() => {
                        const elapsedMs = Date.now() - u.startedAt;
                        const speedBps = u.loadedBytes / (elapsedMs / 1000); // bytes per second
                        const remaining = u.size - u.loadedBytes;
                        const etaMs = speedBps > 0 ? remaining / speedBps * 1000 : 0;
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

      {/* History Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-freckle text-md">History</h4>
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

export default UploadsPanel;
