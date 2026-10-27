import JSZip from 'jszip';

/**
 * Triggers a robust browser download for a Blob.
 * 
 * Uses a File object to bind the filename directly to the binary representation,
 * and sets the download attribute with mouse dispatch. Cleans up memory safely.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const cleanFilename = filename || 'dokumen.pdf';

  // Construct a File object so the filename metadata is preserved natively
  let targetBlob: Blob = blob;
  try {
    targetBlob = new File([blob], cleanFilename, {
      type: blob.type || 'application/octet-stream',
    });
  } catch {
    targetBlob = blob;
  }

  const url = URL.createObjectURL(targetBlob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = cleanFilename;
  a.setAttribute('download', cleanFilename);
  a.rel = 'noopener';

  document.body.appendChild(a);

  // Dispatch mouse click event
  try {
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(event);
  } catch {
    a.click();
  }

  // Allow adequate time for Chrome's download pipeline before revoking memory
  setTimeout(() => {
    if (a.parentNode) {
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  }, 4000);
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
