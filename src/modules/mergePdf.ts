import { PDFDocument } from 'pdf-lib';
import { readFileAsArrayBuffer } from '../utils/fileHelpers';

/**
 * Merges multiple PDF files into a single PDF document in the order provided.
 * Runs 100% in-browser memory.
 */
export async function mergePdfFiles(
  files: File[],
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  if (files.length < 2) {
    throw new Error('Minimal harus memilih 2 file PDF untuk digabungkan');
  }

  onProgress?.(10, 'Membuat dokumen PDF baru...');
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progressPercent = 10 + Math.round(((i + 1) / files.length) * 80);
    onProgress?.(progressPercent, `Memproses ${file.name} (${i + 1} dari ${files.length})...`);

    const arrayBuffer = await readFileAsArrayBuffer(file);
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  onProgress?.(95, 'Menyusun biner PDF akhir...');
  const pdfBytes = await mergedPdf.save();
  onProgress?.(100, 'Penggabungan PDF selesai!');

  return new Blob([pdfBytes], { type: 'application/pdf' });
}
