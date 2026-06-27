"use client";
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface FileUploadSectionProps {
  onUpload: (url: string) => void;
  onMediaTypeChange?: (mediaType: "IMAGE" | "VIDEO") => void;
  currentUrl?: string;
}

export function FileUploadSection({ onUpload, onMediaTypeChange, currentUrl }: FileUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.error || `خطا در آپلود فایل (${response.status})`;
        alert(errorMsg);
      } else if (data.url) {
        setPreview(data.url);
        onUpload(data.url);
        if (onMediaTypeChange) {
          const isVideo = file.type.startsWith('video/');
          onMediaTypeChange(isVideo ? 'VIDEO' : 'IMAGE');
        }
      } else {
        alert('پاسخ آپلود نامعتبر است');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  }, [onUpload, onMediaTypeChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  return (
    <div className="space-y-4">
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
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <input {...getInputProps()} />
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
