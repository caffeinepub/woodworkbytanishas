/**
 * Compresses an image file using the Canvas API.
 * Target: max 200KB per image, max 1200px width/height.
 */
export async function compressImage(file: File): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const MAX_SIZE_BYTES = 200 * 1024; // 200KB
    const MAX_DIMENSION = 1200;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down if needed
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality until under MAX_SIZE_BYTES
      let quality = 0.85;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }

            if (blob.size <= MAX_SIZE_BYTES || quality <= 0.3) {
              blob.arrayBuffer().then((buffer) => {
                resolve(new Uint8Array(buffer as ArrayBuffer) as Uint8Array<ArrayBuffer>);
              });
            } else {
              quality -= 0.1;
              tryCompress();
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}
