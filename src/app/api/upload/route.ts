import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, resolve } from 'path';
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
    const uploadDir = `${process.cwd()}/public/uploads/${date}`;
    await mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename
    const ext = file.name.split('.').pop() || 'bin';
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filepath = join(uploadDir, filename);
    
    // Process if image
    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer) as Buffer;
    if (file.type.startsWith('image/')) {
      buffer = await processImage(buffer);
    }
    
    // Save file
    await writeFile(filepath, buffer);

    // Return API URL (not direct public path)
    const url = `/api/uploads/${date}/${filename}`;
    return NextResponse.json({ url, filename });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'خطا در آپلود فایل' }, { status: 500 });
  }
}
