# نقشه راه حرفه‌ای‌سازی مدیریت محتوا (Content Manager)
## سیستم آپلود فایل محلی + مدیریت کامنت‌ها

---

## هدف
ارائه قابلیت‌های حرفه‌ای برای نقش `CONTENT_MANAGER`:
- آپلود مستقیم عکس/ویدیو به سرور (بدون نیاز به URL دستی)
- مدیریت کامل کامنت‌ها (ویرایش/حذف)
- UI بهتر برای فید تازه‌ها (شبیه اینستاگرام)

---

## معماری کلی

```
src/
├── server/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts (API endpoint آپلود فایل)
│   │   └── routers/
│   │       └── fresh.ts (update - افزودن مدیریت کامنت)
│   └── modules/
│       └── upload/ (new)
│           ├── file-validator.ts (اعتبارسنجی نوع/حجم فایل)
│           ├── image-processor.ts (compress/resize با sharp)
│           └── upload.use-case.ts (لایه بیزنس)
├── components/
│   ├── content-manager-panel.tsx (update)
│   │   ├── FileUploadSection (drag & drop)
│   │   ├── PostsGrid (preview با aspect ratio)
│   │   └── CommentsManager (جدول کامنت‌ها)
│   └── fresh-feed-client.tsx (update)
│       └── Instagram-style card
├── lib/
│   └── upload-utils.ts (helper functions)
└── public/
    └── uploads/
        └── [YYYY-MM-DD]/
            ├── [uuid].jpg
            └── [uuid].mp4
```

---

## کتابخانه‌های مورد نیاز

```json
{
  "dependencies": {
    "sharp": "^0.33.0",           // Image compression/resize
    "react-dropzone": "^14.2.0",  // Drag & drop upload UI
    "lucide-react": "^0.300.0",   // Icons (heart, comment, etc.)
    "date-fns": "^3.0.0",         // Date formatting (fa/en/ar)
    "react-image-gallery": "^1.3.0" // Image slider (optional)
  }
}
```

---

## فاز ۱: سیستم آپلود فایل محلی (۱ روز)

### ۱.۱ نصب کتابخانه‌ها
```bash
npm install sharp react-dropzone lucide-react date-fns
```

### ۱.۲ ساختار دایرکتوری آپلود
- ایجاد پوشه `public/uploads/`
- تنظیم `.gitignore` برای نادیده گرفتن فایل‌های آپلود شده

### ۱.۳ اعتبارسنجی فایل (File Validator)
**فایل:** `src/server/modules/upload/file-validator.ts`

```typescript
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Validate type
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  
  if (!isImage && !isVideo) {
    return { valid: false, error: 'فقط عکس و ویدیو مجاز است' };
  }
  
  // Validate size
  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'حجم عکس نباید بیشتر از 5MB باشد' };
  }
  
  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return { valid: false, error: 'حجم ویدیو نباید بیشتر از 50MB باشد' };
  }
  
  return { valid: true };
}
```

### ۱.۴ پردازش تصویر (Image Processor)
**فایل:** `src/server/modules/upload/image-processor.ts`

```typescript
import sharp from 'sharp';

export async function processImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1200, 1200, { // Max 1200x1200
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 85 }) // Compress to 85% quality
    .toBuffer();
}
```

### ۱.۵ API Endpoint آپلود
**فایل:** `src/app/api/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { validateFile } from '@/server/modules/upload/file-validator';
import { processImage } from '@/server/modules/upload/image-processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'فایلی ارسال نشده' }, { status: 400 });
    }
    
    // Validate
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    // Create date folder
    const date = new Date().toISOString().split('T')[0];
    const uploadDir = join(process.cwd(), 'public', 'uploads', date);
    await mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filepath = join(uploadDir, filename);
    
    // Process if image
    let buffer = Buffer.from(await file.arrayBuffer());
    if (file.type.startsWith('image/')) {
      buffer = await processImage(buffer);
    }
    
    // Save file
    await writeFile(filepath, buffer);
    
    // Return URL
    const url = `/uploads/${date}/${filename}`;
    return NextResponse.json({ url, filename });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'خطا در آپلود فایل' }, { status: 500 });
  }
}
```

### ۱.۶ UI آپلود با Drag & Drop
**فایل:** `src/components/FileUploadSection.tsx` (new)

```typescript
"use client";
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface FileUploadSectionProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
}

export function FileUploadSection({ onUpload, currentUrl }: FileUploadSectionProps) {
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
      if (data.url) {
        setPreview(data.url);
        onUpload(data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

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
```

### ۱.۷ به‌روزرسانی Content Manager Panel
**فایل:** `src/components/content-manager-panel.tsx` (update)

- جایگزینی input URL با `FileUploadSection`
- اضافه کردن preview قبل از ذخیره
- به‌روزرسانی formData برای استفاده از URL آپلود شده

**معیار پذیرش:**
- ✅ Drag & drop کار کند
- ✅ عکس‌ها compress شوند (max 1200x1200, quality 85%)
- ✅ ویدیوها بدون تغییر ذخیره شوند
- ✅ فایل‌ها در `public/uploads/[date]/` ذخیره شوند
- ✅ اعتبارسنجی نوع/حجم فایل کار کند

---

## فاز ۲: مدیریت کامنت‌ها (۰.۵ روز)

### ۲.۱ Backend - افزودن mutationها
**فایل:** `src/server/api/routers/fresh.ts` (update)

```typescript
// اضافه کردن به existing router

updateComment: contentManagerProcedure
  .input(z.object({
    commentId: z.string().uuid(),
    content: z.string().min(1).max(500),
  }))
  .mutation(async ({ input }) => {
    return services.fresh.updateComment.execute(input);
  }),

deleteComment: contentManagerProcedure
  .input(z.object({
    commentId: z.string().uuid(),
  }))
  .mutation(async ({ input }) => {
    return services.fresh.deleteComment.execute(input);
  }),

listAllComments: contentManagerProcedure
  .input(z.object({
    postId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    limit: z.number().min(1).max(100).default(50),
  }))
  .query(async ({ input }) => {
    return services.fresh.listAllComments.execute(input);
  }),
```

### ۲.۲ Backend - Use-caseها
**فایل:** `src/server/modules/fresh/application/` (new files)

```typescript
// update-comment.use-case.ts
export class UpdateCommentUseCase {
  async execute(input: { commentId: string; content: string }) {
    return this.comments.update(input.commentId, { content });
  }
}

// delete-comment.use-case.ts
export class DeleteCommentUseCase {
  async execute(input: { commentId: string }) {
    return this.comments.delete(input.commentId);
  }
}

// list-all-comments.use-case.ts
export class ListAllCommentsUseCase {
  async execute(input: { postId?: string; userId?: string; limit: number }) {
    return this.comments.listAll(input);
  }
}
```

### ۲.۳ UI - بخش مدیریت کامنت‌ها
**فایل:** `src/components/CommentsManager.tsx` (new)

```typescript
"use client";
import { useState, useEffect } from 'react';
import { getTRPCClient } from '@/trpc/client';
import { Trash2, Edit2, Search } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  userId: string;
  username: string;
  postId: string;
  postCaption: string;
  createdAt: Date;
}

export function CommentsManager({ locale }: { locale: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState({ postId: '', userId: '' });
  const [editing, setEditing] = useState<string | null>(null);

  const fetchComments = async () => {
    const trpc = getTRPCClient();
    const result = await trpc.fresh.listAllComments.query({
      postId: filter.postId || undefined,
      userId: filter.userId || undefined,
      limit: 50,
    });
    setComments(result);
  };

  useEffect(() => { void fetchComments(); }, [filter]);

  const handleUpdate = async (commentId: string, content: string) => {
    const trpc = getTRPCClient();
    await trpc.fresh.updateComment.mutate({ commentId, content });
    setEditing(null);
    void fetchComments();
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    const trpc = getTRPCClient();
    await trpc.fresh.deleteComment.mutate({ commentId });
    void fetchComments();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          placeholder="فیلتر با ID پست"
          value={filter.postId}
          onChange={(e) => setFilter({ ...filter, postId: e.target.value })}
          className="rounded border px-3 py-2"
        />
        <input
          placeholder="فیلتر با ID کاربر"
          value={filter.userId}
          onChange={(e) => setFilter({ ...filter, userId: e.target.value })}
          className="rounded border px-3 py-2"
        />
        <button onClick={fetchComments} className="rounded bg-blue-600 px-4 py-2 text-white">
          <Search size={16} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left">کاربر</th>
              <th className="px-4 py-2 text-left">پست</th>
              <th className="px-4 py-2 text-left">محتوا</th>
              <th className="px-4 py-2 text-left">تاریخ</th>
              <th className="px-4 py-2 text-left">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id} className="border-b">
                <td className="px-4 py-2">{comment.username}</td>
                <td className="px-4 py-2 truncate max-w-xs">{comment.postCaption}</td>
                <td className="px-4 py-2">
                  {editing === comment.id ? (
                    <input
                      defaultValue={comment.content}
                      onBlur={(e) => handleUpdate(comment.id, e.target.value)}
                      className="w-full rounded border px-2 py-1"
                      autoFocus
                    />
                  ) : (
                    comment.content
                  )}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('fa-IR')}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setEditing(comment.id)}
                    className="mr-2 text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### ۲.۴ اضافه کردن به Content Manager Panel
**فایل:** `src/components/content-manager-panel.tsx` (update)

- اضافه کردن tab جدید "مدیریت کامنت‌ها"
- نمایش `CommentsManager` در این tab

**معیار پذیرش:**
- ✅ Content Manager بتواند همه کامنت‌ها را ببیند
- ✅ قابلیت ویرایش کامنت (inline edit)
- ✅ قابلیت حذف کامنت با confirmation
- ✅ فیلتر بر اساس پست یا کاربر

---

## فاز ۳: بهبود UI فید تازه‌ها (۰.۵ روز)

### ۳.۱ Instagram-style Card
**فایل:** `src/components/fresh-feed-client.tsx` (update)

```typescript
// بهبود‌ها:
- Grid layout با aspect ratio 1:1 برای عکس‌ها
- Heart animation برای لایک
- Icon buttons با lucide-react
- Modal برای نمایش کامنت‌ها
- Lazy loading برای تصاویر
- Responsive design
```

### ۳.۲ کامپوننت‌های جدید
**فایل:** `src/components/FreshPostCard.tsx` (new)

```typescript
"use client";
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';

interface FreshPostCardProps {
  post: FreshPost;
  onLike: () => void;
  onComment: () => void;
}

export function FreshPostCard({ post, onLike, onComment }: FreshPostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    onLike();
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="p-3 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <span className="font-medium text-sm">Username</span>
      </div>

      {/* Media */}
      <div className="aspect-square bg-gray-100">
        {post.mediaType === 'IMAGE' ? (
          <img 
            src={post.mediaUrl} 
            alt={post.caption || ''} 
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <video src={post.mediaUrl} className="h-full w-full object-cover" controls />
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex gap-4 mb-2">
          <button onClick={handleLike} className={liked ? 'text-red-500' : ''}>
            <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button onClick={onComment}>
            <MessageCircle size={24} />
          </button>
          <button>
            <Share2 size={24} />
          </button>
        </div>

        <p className="font-medium text-sm mb-1">{likeCount} لایک</p>
        {post.caption && (
          <p className="text-sm">
            <span className="font-medium">Username</span> {post.caption}
          </p>
        )}
      </div>
    </div>
  );
}
```

**معیار پذیرش:**
- ✅ Grid layout با aspect ratio 1:1
- ✅ Heart animation برای لایک
- ✅ Icon buttons با lucide-react
- ✅ Lazy loading برای تصاویر
- ✅ Responsive design

---

## معیار پذیرش نهایی

### فاز ۱ (آپلود فایل)
- [ ] Content Manager بتواند فایل آپلود کند (drag & drop)
- [ ] عکس‌ها compress شوند (max 1200x1200, quality 85%)
- [ ] ویدیوها بدون تغییر ذخیره شوند
- [ ] فایل‌ها در `public/uploads/[date]/` ذخیره شوند
- [ ] اعتبارسنجی نوع/حجم فایل کار کند
- [ ] Preview قبل از ذخیره نمایش داده شود

### فاز ۲ (مدیریت کامنت‌ها)
- [ ] Content Manager بتواند همه کامنت‌ها را ببیند
- [ ] قابلیت ویرایش کامنت (inline edit)
- [ ] قابلیت حذف کامنت با confirmation
- [ ] فیلتر بر اساس پست یا کاربر

### فاز ۳ (UI بهتر)
- [ ] Grid layout با aspect ratio 1:1
- [ ] Heart animation برای لایک
- [ ] Icon buttons با lucide-react
- [ ] Lazy loading برای تصاویر
- [ ] Responsive design

---

## نکات مهم

### امنیت
- محدود کردن آپلود به کاربران لاگین‌شده (protectedProcedure)
- اعتبارسنجی دقیق نوع فایل (magic number check)
- محدود کردن حجم فایل
- Sanitization نام فایل (جلوگیری از path traversal)

### Performance
- Compress عکس‌ها با sharp
- Lazy loading تصاویر
- CDN برای static files (در آینده)
- Caching برای لیست پست‌ها

### نگهداری
- پاکسازی خودکار فایل‌های قدیمی (cron job)
- Monitoring فضای دیسک
- Backup از فایل‌های آپلود شده

---

## زمان‌بندی تخمینی

| فاز | زمان | وابستگی |
|-----|------|----------|
| فاز ۱: آپلود فایل | ۱ روز | - |
| فاز ۲: مدیریت کامنت‌ها | ۰.۵ روز | فاز ۱ |
| فاز ۳: UI بهتر | ۰.۵ روز | فاز ۱ |
| **مجموع** | **۲ روز** | - |

---

## قدم بعدی

شروع با **فاز ۱.۱**: نصب کتابخانه‌ها
```bash
npm install sharp react-dropzone lucide-react date-fns
```
