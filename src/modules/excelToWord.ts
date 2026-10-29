import * as XLSX from 'xlsx';
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  PageOrientation,
} from 'docx';
import { readFileAsArrayBuffer } from '../utils/fileHelpers';
import { ExcelToWordOptions } from '../types';

/**
 * Converts an Excel spreadsheet (.xlsx, .xls) to a Microsoft Word document (.docx).
 * Converts sheet(s) into cleanly formatted native Word table(s) with selectable orientation.
 */
export async function convertExcelToWord(
  file: File,
  optionsOrProgress?: ExcelToWordOptions | ((progress: number, message: string) => void),
  maybeProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  let options: ExcelToWordOptions | undefined;
  let onProgress: ((progress: number, message: string) => void) | undefined;

  if (typeof optionsOrProgress === 'function') {
    onProgress = optionsOrProgress;
  } else {
    options = optionsOrProgress;
    onProgress = maybeProgress;
  }

  const orientation = options?.orientation ?? 'landscape';
  const targetSheet = options?.sheetName ?? 'all';

  onProgress?.(15, 'Membaca data Excel...');
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      text: `Laporan Data Excel: ${file.name}`,
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    }),
  ];

  let sheetNames = workbook.SheetNames;
  if (targetSheet !== 'all' && sheetNames.includes(targetSheet)) {
    sheetNames = [targetSheet];
  }

  for (let sIdx = 0; sIdx < sheetNames.length; sIdx++) {
    const sheetName = sheetNames[sIdx];
    const percent = 20 + Math.round(((sIdx + 1) / sheetNames.length) * 65);
    onProgress?.(percent, `Membuat tabel Word untuk sheet "${sheetName}"...`);

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;

    const rawData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });

    if (rawData.length === 0) continue;

    // Add Sheet Heading
    children.push(
      new Paragraph({
        text: `Sheet: ${sheetName}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    const headers = rawData[0] || [];
    const numCols = Math.max(headers.length, 1);
    const colWidthPct = Math.floor(100 / numCols);

    const tableRows: TableRow[] = [];

    // Header Row
    tableRows.push(
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (h) =>
            new TableCell({
              width: { size: colWidthPct, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: '4F46E5' }, // Indigo
              children: [
                new Paragraph({
                  text: String(h || ''),
                  style: 'Strong',
                }),
              ],
            })
        ),
      })
    );

    // Data Rows
    const dataRows = rawData.slice(1);
    dataRows.forEach((row, rIdx) => {
      const isAlt = rIdx % 2 === 1;
      tableRows.push(
        new TableRow({
          children: headers.map(
            (_, colIdx) =>
              new TableCell({
                width: { size: colWidthPct, type: WidthType.PERCENTAGE },
                shading: isAlt ? { type: ShadingType.CLEAR, fill: 'F8FAFC' } : undefined,
                children: [
                  new Paragraph({
                    text: String(row[colIdx] ?? ''),
                  }),
                ],
              })
          ),
        })
      );
    });

    children.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  }

  onProgress?.(90, 'Menyusun dokumen Word (.docx)...');
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation:
                orientation === 'portrait'
                  ? PageOrientation.PORTRAIT
                  : PageOrientation.LANDSCAPE,
            },
          },
        },
        children,
      },
    ],
  });

  const docBlob = await Packer.toBlob(doc);
  onProgress?.(100, 'Konversi Excel ke Word selesai!');

  return docBlob;
}
