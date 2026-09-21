import { captureFrameAsJpeg, getRandomTimestamps } from "./captureFrame";
import { uploadToR2WithProgress } from "../services";

export const uploadModerationSnapshots = async (
  filmFile: File,
  moderationUploadUrls: string[],
  onProgress?: (percent: number) => void
) => {
  if (moderationUploadUrls.length !== 4) {
    throw new Error("Expected 4 moderation upload URLs");
  }

  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.src = URL.createObjectURL(filmFile);

  await new Promise<void>((resolve) => {
    video.onloadedmetadata = () => resolve();
  });

  const timestamps = getRandomTimestamps(video.duration, 4);

  for (let i = 0; i < 4; i++) {
    const jpegBlob = await captureFrameAsJpeg(
      filmFile,
      timestamps[i]
    );

    const jpegFile = new File(
      [jpegBlob],
      `key_${i + 1}.jpeg`,
      { type: "image/jpeg" }
    );

    await uploadToR2WithProgress(
      moderationUploadUrls[i],
      jpegFile
    );

    onProgress?.(Math.round(((i + 1) / 4) * 100));
  }

  URL.revokeObjectURL(video.src);
};
