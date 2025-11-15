// src/utils/crop/ImageCropper.tsx
import React, { useRef, useState } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropperProps {
  src: string;
  onCropConfirm: (img: HTMLImageElement, crop: Crop) => void;
  onCancel?: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  onCropConfirm,
  onCancel,
}) => {
  const [crop, setCrop] = useState<Crop>({ unit: "%", width: 50, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  return (
    <div className="flex flex-col items-center gap-4">
      <ReactCrop
        crop={crop}
        onChange={(newCrop) => setCrop(newCrop)}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={1}
        circularCrop
      >
        <img
          ref={imgRef}
          src={src}
          alt="Crop preview"
          onLoad={(e) => (imgRef.current = e.currentTarget)}
          className="max-h-80 rounded-xl"
        />
      </ReactCrop>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => {
            if (imgRef.current && completedCrop) {
              onCropConfirm(imgRef.current, completedCrop);
            }
          }}
          className="bg-emerald-700 text-white px-4 py-2 rounded-xl hover:scale-105 transition"
        >
          Confirm
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-500 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
