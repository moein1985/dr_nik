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
