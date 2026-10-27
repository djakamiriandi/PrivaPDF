import * as pdfjsLib from 'pdfjs-dist';
// @ts-expect-error Vite URL import for worker bundle
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import JSZip from 'jszip';
import { PdfToImageOptions } from '../types';
import { readFileAsArrayBuffer, sanitizeFilename } from '../utils/fileHelpers';

// Configure offline local worker bundled by Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export interface ExtractedPageImage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  filename: string;
}

export interface PdfToImageResult {
  pages: ExtractedPageImage[];
  zipBlob: Blob;
}

/**
 * Converts a PDF file into high-quality PNG or JPEG images for each page.
 * Renders in-browser using Mozilla PDF.js.
 */
export async function convertPdfToImages(
  pdfFile: File,
  options: PdfToImageOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<PdfToImageResult> {
  onProgress?.(5, 'Membaca file PDF...');
  const arrayBuffer = await readFileAsArrayBuffer(pdfFile);

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const baseName = sanitizeFilename(pdfFile.name.replace(/\.pdf$/i, ''));
  const extension = options.format === 'jpeg' ? 'jpg' : 'png';
  const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';

  // 72 DPI is scale 1.0; 150 DPI is ~2.08x; 300 DPI is ~4.16x
  const scale = options.dpi === 300 ? 4.16 : 2.08;

  const pages: ExtractedPageImage[] = [];
  const zip = new JSZip();

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const percent = 10 + Math.round((pageNum / numPages) * 75);
    onProgress?.(percent, `Me-render halaman ${pageNum} dari ${numPages}...`);

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Gagal menginisialisasi canvas untuk rendering PDF');

    // Fill white background for JPEGs
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render page
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    // Convert canvas to blob & dataUrl
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Gagal mengekspor canvas ke Blob'))),
        mimeType,
        0.95
      );
    });

    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    const padded = String(pageNum).padStart(String(numPages).length, '0');
    const filename = `${baseName}_hal_${padded}.${extension}`;

    pages.push({
      pageNumber: pageNum,
      dataUrl,
      blob,
      filename,
    });

    zip.file(filename, blob);
  }

  onProgress?.(90, 'Mengompres semua gambar ke dalam ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  onProgress?.(100, 'Konversi PDF ke gambar selesai!');

  return {
    pages,
    zipBlob,
  };
}
