import { useState, useEffect } from "react";
import BeyondLineEdit from "./BeyondComponents/BeyondLineEdit";

interface ImageUploadProps {
  existingImage?: string; // URL of an existing image
  existingAlt?: string; // Existing caption/alt text
  storageRemaining: number; // Remaining storage in bytes
  onUpload: (
    file: File
  ) => Promise<{ ok: boolean; message?: string; url?: string }>; // Called when a new local image is selected
  onAltChange: (altText: string) => Promise<{ ok: boolean; message?: string }>; // Called when caption changes
  onDelete: () => Promise<{ ok: boolean; message?: string }>; // Called when image is deleted
  onUrlChange: (url: string) => Promise<{ ok: boolean; message?: string }>; // Called when an external image URL is specified
}

export default function SingleImageUpload({
  existingImage,
  existingAlt = "",
  storageRemaining,
  onUpload,
  onAltChange,
  onDelete,
  onUrlChange,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(existingImage || null);
  const [altText, setAltText] = useState<string>(existingAlt);
  const [error, setError] = useState<string | null>(null);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await onUpload(file);
      if (!result.ok) {
        setError(result.message || "Upload failed");
      } else {
        setError(null);
        setPreview(result.url!);
      }
    }
  };

  const handleAltChange = async (value: string) => {
    const resp = await onAltChange(value);
    if (!resp.ok) {
      setError(resp.message || "Alt text change failed");
    } else {
      setError(null);
    }
  };

  const handleUrlChange = async (value: string) => {
    setPreview(value);
    const resp = await onUrlChange(value);
    if (!resp.ok) {
      setError(resp.message || "URL change failed");
    } else {
      setError(null);
    }
  };

  const handleDelete = async () => {
    setAltText("");
    setPreview(null);
    const resp = await onDelete();
    if (!resp.ok) {
      setError(resp.message || "Delete failed");
    } else {
      setError(null);
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full bg-bg-base-100 p-2">
      {error && (
        <div className="text-red-500 flex items-center space-x-2">
          <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center mx-2">
            !
          </span>
          {error}
        </div>
      )}
      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-row items-center justify-center space-y-2">
        {preview ? (
          <div className="flex flex-col items-center space-y-2 w-full">
            <div className="relative">
              <img
                src={preview}
                alt={altText || "Uploaded preview"}
                className=" h-fit rounded-lg"
              />
              <button
                type="button"
                onClick={handleDelete}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 w-4 h-4 flex items-center justify-center hover:bg-red-700"
                title="Delete Image"
                aria-label="Delete Image"
              >
                &times;
              </button>
            </div>
            <BeyondLineEdit
              key="caption"
              className="w-full!"
              value={altText}
              onChange={handleAltChange}
              placeholder="Enter image caption"
            />
          </div>
        ) : (
          <div>
            <label className="flex flex-col items-center justify-center cursor-pointer pb-2">
              <div className="text-gray-500">Click to upload an image</div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <BeyondLineEdit
              key="url"
              value=""
              onChange={handleUrlChange}
              placeholder="Or paste an image URL"
            />
          </div>
        )}
      </div>
      <div className="pl-2">
        Storage Remaining:{" "}
        <span className="font-bold text-primary">
          {storageNumberToString(storageRemaining)}
        </span>
      </div>
    </div>
  );
}

function storageNumberToString(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (bytes >= 1000 && i < units.length - 1) {
    bytes /= 1000;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}
