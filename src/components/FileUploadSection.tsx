"use client";
import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface FileUploadSectionProps {
  onUpload: (url: string) => void;
  onMediaTypeChange?: (mediaType: "IMAGE" | "VIDEO") => void;
  currentUrl?: string;
}

export function FileUploadSection({ onUpload, onMediaTypeChange, currentUrl }: FileUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    console.log('[Upload] Starting upload for:', file.name, 'size:', file.size, 'type:', file.type);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('[Upload] Response status:', response.status);
      const data = await response.json();
      console.log('[Upload] Response data:', data);

      if (!response.ok) {
        const errorMsg = data.error || `خطا در آپلود فایل (${response.status})`;
        setUploadError(errorMsg);
        alert(errorMsg);
        return;
      }
      if (data.url) {
        setPreview(data.url);
        onUpload(data.url);
        if (onMediaTypeChange) {
          const isVideo = file.type.startsWith('video/');
          onMediaTypeChange(isVideo ? 'VIDEO' : 'IMAGE');
        }
      } else {
        setUploadError('پاسخ آپلود نامعتبر است: URL دریافت نشد');
        alert('پاسخ آپلود نامعتبر است: URL دریافت نشد');
        return;
      }
    } catch (error) {
      console.error('[Upload] Error:', error);
      setUploadError('خطا در ارتباط با سرور');
      alert('خطا در ارتباط با سرور: ' + String(error));
      return;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
      {preview ? (
        <div className="relative">
          {preview.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
            <img src={preview} alt="Preview" className="h-64 w-full object-cover rounded-lg" />
          ) : (
            <video src={preview} className="h-64 w-full object-cover rounded-lg" controls />
          )}
          <button
            onClick={() => {
              setPreview(null);
              onUpload('');
            }}
            className="absolute top-2 right-2 rounded-full bg-red-600 p-2 text-white hover:bg-red-700"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
            ${uploading ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {uploading ? 'در حال آپلود...' : 'فایل را اینجا بکشید یا کلیک کنید'}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            عکس (حداکثر 5MB) یا ویدیو (حداکثر 50MB)
          </p>
        </div>
      )}
    </div>
  );
}
