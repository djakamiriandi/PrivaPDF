export type ToolCategory = 'pdf' | 'office';

export type ToolId =
  | 'excel-to-pdf'
  | 'image-to-pdf'
  | 'pdf-to-image'
  | 'merge-pdf'
  | 'split-pdf'
  | 'word-to-excel'
  | 'excel-to-word';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  category: ToolCategory;
  accentColor: string;
  badge?: string;
  acceptedFormats: string[]; // e.g. ['.xlsx', '.xls']
  allowMultiple: boolean;
}

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

export type TableTheme = 'blue' | 'dark' | 'gray' | 'emerald';
export type PageOrientation = 'portrait' | 'landscape' | 'auto';
export type PageSize = 'a4' | 'letter';
export type MarginOption = 'none' | 'small' | 'normal';

export interface ExcelToPdfOptions {
  sheetName: string; // 'all' or specific sheet
  orientation: PageOrientation;
  pageSize: PageSize;
  theme: TableTheme;
}

export interface ExcelToWordOptions {
  sheetName: string; // 'all' or specific sheet
  orientation: 'landscape' | 'portrait';
}

export interface ImageToPdfOptions {
  orientation: PageOrientation;
  margin: MarginOption;
  mergeSinglePdf: boolean;
}

export interface PdfToImageOptions {
  format: 'png' | 'jpeg';
  dpi: 150 | 300;
}

export interface SplitPdfOptions {
  mode: 'range' | 'all';
  pageRanges: string; // e.g. "1-3, 5, 8-10"
}

export interface ConversionProgress {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number; // 0 to 100
  message: string;
}

export interface ConversionResult {
  blob: Blob;
  filename: string;
  sizeBytes: number;
  previewUrl?: string;
}
