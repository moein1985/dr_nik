import { describe, it, expect } from 'vitest';
import { validateFile } from '../file-validator';

describe('validateFile', () => {
  it('should accept valid image files', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should accept valid video files', () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should reject invalid file types', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('فقط عکس و ویدیو مجاز است');
  });

  it('should reject images larger than 5MB', () => {
    const largeBuffer = new ArrayBuffer(6 * 1024 * 1024); // 6MB
    const file = new File([largeBuffer], 'test.jpg', { type: 'image/jpeg' });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('حجم عکس نباید بیشتر از 5MB باشد');
  });

  it('should reject videos larger than 50MB', () => {
    const largeBuffer = new ArrayBuffer(51 * 1024 * 1024); // 51MB
    const file = new File([largeBuffer], 'test.mp4', { type: 'video/mp4' });
    const result = validateFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('حجم ویدیو نباید بیشتر از 50MB باشد');
  });

  it('should accept images within size limit', () => {
    const buffer = new ArrayBuffer(4 * 1024 * 1024); // 4MB
    const file = new File([buffer], 'test.jpg', { type: 'image/jpeg' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should accept videos within size limit', () => {
    const buffer = new ArrayBuffer(10 * 1024 * 1024); // 10MB
    const file = new File([buffer], 'test.mp4', { type: 'video/mp4' });
    const result = validateFile(file);
    expect(result.valid).toBe(true);
  });

  it('should accept all allowed image types', () => {
    const types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    types.forEach(type => {
      const file = new File(['test'], 'test.jpg', { type });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });
  });

  it('should accept all allowed video types', () => {
    const types = ['video/mp4', 'video/webm', 'video/quicktime'];
    types.forEach(type => {
      const file = new File(['test'], 'test.mp4', { type });
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });
  });
});
