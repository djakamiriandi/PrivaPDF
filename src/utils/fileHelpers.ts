export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function sanitizeFilename(name: string, newExt?: string): string {
  // Strip dangerous characters, slashes, backslashes
  let clean = (name || 'dokumen').replace(/[/\\?%*:|"<>]/g, '-').trim();
  if (newExt) {
    const ext = newExt.startsWith('.') ? newExt : `.${newExt}`;
    const lastDot = clean.lastIndexOf('.');
    if (lastDot > 0) {
      clean = clean.substring(0, lastDot);
    }
    clean = `${clean}${ext}`;
  }
  return clean || (newExt ? `dokumen${newExt.startsWith('.') ? newExt : `.${newExt}`}` : 'dokumen');
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Gagal membaca file sebagai ArrayBuffer'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
