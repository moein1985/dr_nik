import sharp from "sharp";

export async function processImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (err) {
    console.error("Image processing failed, using original:", err);
    return buffer;
  }
}
