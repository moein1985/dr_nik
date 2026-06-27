import sharp from "sharp";

export async function processImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1200, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85 })
    .toBuffer();
}
