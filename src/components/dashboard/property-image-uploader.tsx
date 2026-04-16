"use client";

import { useState, useRef } from "react";
import { ImagePlus, X, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

interface PropertyImageUploaderProps {
  propertyId: string;
  initialUrls?: string[];
}

export function PropertyImageUploader({
  propertyId,
  initialUrls = [],
}: PropertyImageUploaderProps) {
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/properties/${propertyId}/images`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json() as { imageUrls?: string[]; error?: string };
        if (!res.ok) {
          toast.error(data.error ?? "Upload failed");
        } else {
          setUrls(data.imageUrls ?? []);
          toast.success("Photo uploaded");
        }
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (url: string) => {
    setDeletingUrl(url);
    try {
      const res = await fetch(`/api/properties/${propertyId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json() as { imageUrls?: string[]; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Delete failed");
      } else {
        setUrls(data.imageUrls ?? []);
        toast.success("Photo removed");
      }
    } finally {
      setDeletingUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    void handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 text-center transition-colors hover:border-gray-300 hover:bg-gray-100"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        ) : (
          <Upload className="h-8 w-8 text-gray-400" />
        )}
        <div>
          <p className="text-sm font-medium text-gray-700">
            {uploading ? "Uploading..." : "Click or drag photos here"}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP — multiple allowed</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
          disabled={uploading}
        />
      </div>

      {/* Preview grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {urls.map((url, i) => (
            <div key={url} className="group relative aspect-video overflow-hidden rounded-lg border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Property photo ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Main
                </span>
              )}
              <button
                type="button"
                className="absolute right-1.5 top-1.5 hidden rounded-full bg-black/60 p-2 text-white hover:bg-black/80 group-hover:flex"
                onClick={() => void handleDelete(url)}
                disabled={deletingUrl === url}
              >
                {deletingUrl === url ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
          <button
            type="button"
            className="flex aspect-video flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-xs">Add more</span>
          </button>
        </div>
      )}
    </div>
  );
}
