export const captureFrameAsJpeg = (
  file: File,
  time: number,
  width = 640,
  quality = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(time, video.duration);
    };

    video.onseeked = () => {
      const scale = width / video.videoWidth;
      const canvas = document.createElement("canvas");

      canvas.width = width;
      canvas.height = Math.floor(video.videoHeight * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context failed");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject("JPEG creation failed");
          URL.revokeObjectURL(video.src);
          resolve(blob);
        },
        "image/jpeg",
        quality
      );
    };

    video.onerror = () => reject("Video decode failed");
  });
};



export const getRandomTimestamps = (duration: number, count = 4) => {
  const SAFE_START = 2;
  const SAFE_END = 2;

  const usable = Math.max(duration - SAFE_START - SAFE_END, 1);

  return Array.from({ length: count }, () =>
    SAFE_START + Math.random() * usable
  );
};
