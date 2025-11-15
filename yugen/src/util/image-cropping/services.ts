// src/utils/crop/services.ts
import { Crop } from "react-image-crop";

/**
 * Converts an image and react-image-crop Crop into a circular PNG File.
 */
export function getCroppedFileFromImage(
  img: HTMLImageElement,
  crop: Crop
): Promise<File> {
  return new Promise((resolve, reject) => {
    if (!crop || !img) return reject("Missing crop or image");

    const canvas = document.createElement("canvas");
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    const pxRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor((crop.width ?? 0) * scaleX * pxRatio);
    canvas.height = Math.floor((crop.height ?? 0) * scaleY * pxRatio);

    const ctx = canvas.getContext("2d");
    if (!ctx) return reject("No 2d context");

    ctx.scale(pxRatio, pxRatio);
    ctx.imageSmoothingQuality = "high";

    const sx = (crop.x ?? 0) * scaleX;
    const sy = (crop.y ?? 0) * scaleY;
    const sWidth = (crop.width ?? 0) * scaleX;
    const sHeight = (crop.height ?? 0) * scaleY;

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

    // Apply circular mask
    const circleCanvas = document.createElement("canvas");
    circleCanvas.width = canvas.width;
    circleCanvas.height = canvas.height;
    const cctx = circleCanvas.getContext("2d");
    if (!cctx) return reject("No circular context");

    cctx.save();
    cctx.beginPath();
    const r = Math.min(circleCanvas.width, circleCanvas.height) / 2;
    cctx.arc(
      circleCanvas.width / 2,
      circleCanvas.height / 2,
      r,
      0,
      2 * Math.PI
    );
    cctx.closePath();
    cctx.clip();
    cctx.drawImage(canvas, 0, 0);
    cctx.restore();

    circleCanvas.toBlob(
      (blob) => {
        if (!blob) return reject("Failed to generate blob");
        const file = new File([blob], `pfp-${Date.now()}.png`, {
          type: "image/png",
        });
        resolve(file);
      },
      "image/png",
      0.95
    );
  });
}
