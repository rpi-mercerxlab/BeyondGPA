import { Image } from "@/types/student_project";
import { useState } from "react";

export default function MultiImageUpload({
  images,
  storageRemaining,
  onUpload,
  onAltChange,
  onDelete,
  onLink,
}: {
  images: Image[];
  storageRemaining: number;
  onUpload: (
    file: File
  ) => Promise<{ ok: boolean; message?: string; id?: string }>;
  onAltChange: (
    id: string,
    alt: string
  ) => Promise<{ ok: boolean; message?: string }>;
  onDelete: (id: string) => Promise<{ ok: boolean; message?: string }>;
  onLink: (url: string) => Promise<{ ok: boolean; message?: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="w-full bg-bg-base-100 p-2">
      {error && (
        <div className="text-red-500 flex items-center space-x-2">
          <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center mx-2">
            !
          </span>
          {error}
        </div>
      )}
      {images.map((image) => (
        <div
          key={image.id}
          className="flex items-center space-y-2 border-b border-primary mb-2"
        >
          <div className="relative w-1/3">
            <img src={image.url} alt={image.alt} className="" />
            <button
              className="absolute top-1 right-1 bg-primary text-white flex items-center justify-center w-4 h-4 rounded-full"
              onClick={async () => {
                const result = await onDelete(image.id);
                if (!result.ok) {
                  setError(result.message || "Delete failed");
                }
              }}
              title="Delete Image"
              aria-label="Delete Image"
            >
              &times;
            </button>
          </div>
          <input
            className="border border-gray-300 rounded-md p-2 w-full ml-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            type="text"
            value={image.alt}
            placeholder="Image Caption"
            onChange={async (e) => {
              const result = await onAltChange(image.id, e.target.value);
              if (!result.ok) {
                setError(result.message || "Alt text change failed");
              }
            }}
          />
        </div>
      ))}
      <div className="border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center space-y-2">
        <label className="flex flex-col items-center justify-center cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const result = await onUpload(file);
                if (!result.ok) {
                  setError(result.message || "Upload failed");
                }
              }
            }}
          />
          <p className="text-gray-500">Click to upload an image</p>
        </label>
        <input
          type="text"
          className="border border-gray-300 rounded-md p-1 px-2 w-fit ml-2 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Or paste an image URL"
          onBlur={async (e) => {
            const url = e.target.value;
            if (url) {
              const result = await onLink(url);
              if (!result.ok) {
                setError(result.message || "Linking image failed");
              }
            }
          }}
        />
      </div>
      <p className="p-2">
        Storage remaining:{" "}
        <span className="font-bold text-primary">
          {storageNumberToString(storageRemaining)}
        </span>
      </p>
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
