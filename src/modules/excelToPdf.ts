import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExcelToPdfOptions, TableTheme } from '../types';
import { readFileAsArrayBuffer } from '../utils/fileHelpers';

export interface ExcelMetadata {
  sheetNames: string[];
  totalSheets: number;
}

/**
 * Quick reader to inspect sheet names before conversion
 */
export async function readExcelMetadata(file: File): Promise<ExcelMetadata> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(arrayBuffer, { type: 'array', bookSheets: true });
  return {
    sheetNames: workbook.SheetNames,
    totalSheets: workbook.SheetNames.length,
  };
}

/**
 * Returns color palettes for jsPDF-AutoTable themes
 */
function getThemeColors(theme: TableTheme) {
  switch (theme) {
    case 'emerald':
      return {
        headerFill: [16, 185, 129] as [number, number, number],
        headerText: [255, 255, 255] as [number, number, number],
        alternateFill: [236, 253, 245] as [number, number, number],
      };
    case 'dark':
      return {
        headerFill: [30, 41, 59] as [number, number, number],
        headerText: [248, 250, 252] as [number, number, number],
        alternateFill: [241, 245, 249] as [number, number, number],
      };
    case 'gray':
      return {
        headerFill: [100, 116, 139] as [number, number, number],
        headerText: [255, 255, 255] as [number, number, number],
        alternateFill: [248, 250, 252] as [number, number, number],
      };
    case 'blue':
    default:
      return {
        headerFill: [79, 70, 229] as [number, number, number], // Indigo
        headerText: [255, 255, 255] as [number, number, number],
        alternateFill: [238, 242, 255] as [number, number, number],
      };
  }
}

/**
 * Converts an Excel spreadsheet (.xlsx, .xls) to a neatly formatted PDF document.
 */
export async function convertExcelToPdf(
  file: File,
  options: ExcelToPdfOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  onProgress?.(10, 'Membaca data lembar kerja Excel...');
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const targetSheetNames =
    options.sheetName === 'all'
      ? workbook.SheetNames
      : workbook.SheetNames.filter((s) => s === options.sheetName);

  if (targetSheetNames.length === 0) {
    throw new Error('Tidak ada sheet yang dipilih untuk dikonversi');
  }

  // Create jsPDF instance
  const orientation = options.orientation === 'auto' ? 'landscape' : options.orientation;
  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: options.pageSize,
  });

  const colors = getThemeColors(options.theme);
  let isFirstSheet = true;

  for (let sIdx = 0; sIdx < targetSheetNames.length; sIdx++) {
    const sheetName = targetSheetNames[sIdx];
    const percent = 20 + Math.round(((sIdx + 1) / targetSheetNames.length) * 70);
    onProgress?.(percent, `Memproses lembar kerja "${sheetName}"...`);

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    // Convert to 2D array: row 0 is header, rest are rows
    const rawData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });

    if (rawData.length === 0) continue;

    if (!isFirstSheet) {
      doc.addPage(options.pageSize, orientation);
    }
    isFirstSheet = false;

    // Add Sheet Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`Sheet: ${sheetName}`, 40, 40);

    const headers = rawData[0].map((h) => String(h || ''));
    const bodyRows = rawData.slice(1).map((row) =>
      headers.map((_, colIdx) => String(row[colIdx] ?? ''))
    );

    autoTable(doc, {
      head: [headers],
      body: bodyRows,
      startY: 55,
      margin: { top: 40, right: 40, bottom: 40, left: 40 },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 4,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      headStyles: {
        fillColor: colors.headerFill,
        textColor: colors.headerText,
        fontStyle: 'bold',
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: colors.alternateFill,
      },
      didDrawPage: (data) => {
        // Footer: Page Number & PrivaPDF watermark
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        const pageText = `Halaman ${data.pageNumber} — Diproses secara privat oleh PrivaPDF`;
        const pageWidth = doc.internal.pageSize.width;
        doc.text(pageText, pageWidth / 2, doc.internal.pageSize.height - 15, {
          align: 'center',
        });
      },
    });
  }

  onProgress?.(95, 'Menyusun dokumen PDF...');
  const pdfBlob = doc.output('blob');
  onProgress?.(100, 'Konversi Excel ke PDF berhasil!');

  return pdfBlob;
}
