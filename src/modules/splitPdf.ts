import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { readFileAsArrayBuffer, sanitizeFilename } from '../utils/fileHelpers';

/**
 * Parses user input page range string like "1-3, 5, 8-10" into sorted 0-indexed page indices.
 */
export function parsePageRanges(rangeString: string, maxPages: number): number[] {
  const pageIndices = new Set<number>();
  const parts = rangeString.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(maxPages, Math.max(start, end));
        for (let p = from; p <= to; p++) {
          pageIndices.add(p - 1);
        }
      }
    } else {
      const p = parseInt(part, 10);
      if (!isNaN(p) && p >= 1 && p <= maxPages) {
        pageIndices.add(p - 1);
      }
    }
  }

  return Array.from(pageIndices).sort((a, b) => a - b);
}

/**
 * Extracts specific pages from a PDF based on page range string.
 */
export async function splitPdfByRange(
  file: File,
  rangeString: string,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Membaca file PDF...');
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const indices = parsePageRanges(rangeString, totalPages);
  if (indices.length === 0) {
    throw new Error(`Rentang halaman tidak valid. Dokumen memiliki ${totalPages} halaman.`);
  }

  onProgress?.(40, `Mengekstrak ${indices.length} halaman terpilih...`);
  const targetPdf = await PDFDocument.create();
  const copiedPages = await targetPdf.copyPages(sourcePdf, indices);

  for (const page of copiedPages) {
    targetPdf.addPage(page);
  }

  onProgress?.(85, 'Menyusun file PDF hasil ekstraksi...');
  const pdfBytes = await targetPdf.save();
  onProgress?.(100, 'Pemisahan PDF selesai!');

  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Splits every single page of a PDF into individual PDF documents and bundles them in a ZIP archive.
 */
export async function splitPdfEveryPage(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Membaca dokumen PDF...');
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const zip = new JSZip();
  const baseName = sanitizeFilename(file.name.replace(/\.pdf$/i, ''));

  for (let i = 0; i < totalPages; i++) {
    const percent = 10 + Math.round(((i + 1) / totalPages) * 75);
    onProgress?.(percent, `Mengekstrak halaman ${i + 1} dari ${totalPages}...`);

    const singleDoc = await PDFDocument.create();
    const [page] = await singleDoc.copyPages(sourcePdf, [i]);
    singleDoc.addPage(page);

    const pdfBytes = await singleDoc.save();
    const paddedIndex = String(i + 1).padStart(String(totalPages).length, '0');
    zip.file(`${baseName}_hal_${paddedIndex}.pdf`, pdfBytes);
  }

  onProgress?.(90, 'Mengompres hasil ke dalam arsip ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  onProgress?.(100, 'Pemisahan seluruh halaman selesai!');

  return zipBlob;
}
