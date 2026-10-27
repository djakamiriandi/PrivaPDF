import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { readFileAsArrayBuffer } from '../utils/fileHelpers';

/**
 * Converts a Word document (.docx) to an Excel spreadsheet (.xlsx).
 * Extracts all tables into dedicated worksheets; if no tables are found,
 * extracts paragraphs line-by-line into a single worksheet.
 */
export async function convertWordToExcel(
  file: File,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(15, 'Membaca struktur dokumen Word (.docx)...');
  const arrayBuffer = await readFileAsArrayBuffer(file);

  onProgress?.(40, 'Mengekstrak tabel dan teks dari Word...');
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const htmlContent = result.value;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const tables = doc.querySelectorAll('table');

  const workbook = XLSX.utils.book_new();

  if (tables.length > 0) {
    onProgress?.(65, `Menemukan ${tables.length} tabel di dalam dokumen. Menyusun sheet...`);

    tables.forEach((table, idx) => {
      // Clean up cell text
      const worksheet = XLSX.utils.table_to_sheet(table);
      const sheetName = `Tabel_${idx + 1}`.slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });
  } else {
    onProgress?.(65, 'Tidak ada tabel eksplisit, memetakan paragraf ke baris Excel...');
    // Extract paragraphs and headings
    const elements = doc.querySelectorAll('p, h1, h2, h3, h4, li');
    const rows: string[][] = [
      ['Tipe', 'Isi Teks'],
    ];

    elements.forEach((el) => {
      const text = (el.textContent || '').trim();
      if (text) {
        rows.push([el.tagName.toLowerCase(), text]);
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dokumen Word');
  }

  onProgress?.(90, 'Menghasilkan file Excel (.xlsx)...');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  onProgress?.(100, 'Konversi Word ke Excel selesai!');

  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
