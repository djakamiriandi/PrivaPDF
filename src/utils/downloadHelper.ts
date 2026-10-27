import JSZip from 'jszip';

/**
 * Triggers a browser download for a Blob and schedules an immediate revokeObjectURL
 * to guarantee that client memory is freed and no memory leak occurs.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Cleanup after click
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Compresses an array of file blobs into a single zip and downloads it
 */
export async function downloadZip(
  files: { name: string; blob: Blob }[],
  zipFilename: string
): Promise<void> {
  const zip = new JSZip();

  for (const item of files) {
    zip.file(item.name, item.blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, zipFilename);
}
