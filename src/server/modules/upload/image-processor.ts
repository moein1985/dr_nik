export async function processImage(buffer: Buffer): Promise<Buffer> {
  try {
    const sharp = (await import("sharp")).default;
    return sharp(buffer)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    return buffer;
  }
}
