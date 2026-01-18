import { createContext, useContext, useState } from "react";

interface UploadContextValue {
  uploadProgress: number;
  setUploadProgress: (p: number) => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  return (
    <UploadContext.Provider value={{ uploadProgress, setUploadProgress }}>
      {children}
    </UploadContext.Provider>
  );
};

export const useUploadProgress = () => {
  const ctx = useContext(UploadContext);
  if (!ctx) {
    throw new Error("useUploadProgress must be used inside UploadProvider");
  }
  return ctx;
};
