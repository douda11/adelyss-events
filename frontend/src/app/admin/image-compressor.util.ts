/**
 * Compresse automatiquement une image avant l'envoi pour éviter tout blocage réseau / CDN.
 * Réduit les photos de smartphones (10-25MB) à ~300-500KB tout en conservant une qualité HD optimale.
 */
export async function compressImageFile(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
  // Si ce n'est pas une image ou si c'est un GIF/SVG/Vidéo, on ne touche pas
  if (!file.type.startsWith('image/') || file.type.includes('svg') || file.type.includes('gif')) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '.jpg';
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + ext, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
