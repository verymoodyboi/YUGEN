// src/features/signup/services/signupServices.ts
import { api } from "../../lib/api";
import { Crop } from "react-image-crop";

/** 🔹 Check username availability */
export async function checkUsernameAvailable(
  username: string,
): Promise<boolean> {
  if (!username) return false;
  try {
    await api.get("/tools/usernameCheck", { params: { username } });
    return true;
  } catch (err: any) {
    if (err.response?.status === 409) return false;
    console.error("username check error", err);
    return false;
  }
}

/** 🔹 Check email availability */
export async function checkEmailAvailable(email: string): Promise<boolean> {
  if (!email) return false;
  try {
    await api.get("/tools/emailCheck", { params: { email } });
    return true;
  } catch (err: any) {
    if (err.response?.status === 409) return false;
    console.error("email check error", err);
    return false;
  }
}

/** 🔹 Convert crop + image element into circular PNG File */
export function getCroppedFileFromImage(
  img: HTMLImageElement,
  crop: Crop,
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

    // circular mask
    const circCanvas = document.createElement("canvas");
    circCanvas.width = canvas.width;
    circCanvas.height = canvas.height;
    const cctx = circCanvas.getContext("2d");
    if (!cctx) return reject("No circ context");

    cctx.save();
    cctx.beginPath();
    const r = Math.min(circCanvas.width, circCanvas.height) / 2;
    cctx.arc(circCanvas.width / 2, circCanvas.height / 2, r, 0, 2 * Math.PI);
    cctx.closePath();
    cctx.clip();
    cctx.drawImage(canvas, 0, 0);
    cctx.restore();

    circCanvas.toBlob(
      (blob) => {
        if (!blob) return reject("Failed to blob");
        const file = new File([blob], `pfp-${Date.now()}.png`, {
          type: "image/png",
        });
        resolve(file);
      },
      "image/png",
      0.95,
    );
  });
}

export async function registerUser(formData: FormData) {
  return api.post("/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function uploadToR2(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });
  console.log(uploadUrl);
  if (!res.ok) {
    throw new Error("Failed to upload file to storage");
  }
}
