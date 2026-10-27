import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Settings,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  Image as ImageIcon,
  FileArchive,
  Combine,
  Split,
  FileCode,
  FileText,
} from 'lucide-react';
import {
  ToolDefinition,
  FileItem,
  ConversionProgress,
  ConversionResult,
  ExcelToPdfOptions,
  ImageToPdfOptions,
  PdfToImageOptions,
  SplitPdfOptions,
} from '../types';
import { Dropzone } from './Dropzone';
import { downloadBlob } from '../utils/downloadHelper';
import { sanitizeFilename, formatBytes } from '../utils/fileHelpers';
import { readExcelMetadata, convertExcelToPdf } from '../modules/excelToPdf';
import { convertImagesToPdf } from '../modules/imageToPdf';
import { convertPdfToImages } from '../modules/pdfToImage';
import { mergePdfFiles } from '../modules/mergePdf';
import { splitPdfByRange, splitPdfEveryPage } from '../modules/splitPdf';
import { convertWordToExcel } from '../modules/wordToExcel';
import { convertExcelToWord } from '../modules/excelToWord';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  onBack: () => void;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({ tool, onBack }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [progress, setProgress] = useState<ConversionProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });
  const [result, setResult] = useState<ConversionResult | null>(null);

  // Excel options
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [excelOptions, setExcelOptions] = useState<ExcelToPdfOptions>({
    sheetName: 'all',
    orientation: 'landscape',
    pageSize: 'a4',
    theme: 'blue',
  });

  // Image to PDF options
  const [imageOptions, setImageOptions] = useState<ImageToPdfOptions>({
    orientation: 'auto',
    margin: 'small',
    mergeSinglePdf: true,
  });

  // PDF to Image options
  const [pdfImageOptions, setPdfImageOptions] = useState<PdfToImageOptions>({
    format: 'png',
    dpi: 150,
  });

  // Split PDF options
  const [splitOptions, setSplitOptions] = useState<SplitPdfOptions>({
    mode: 'range',
    pageRanges: '1-3',
  });

  // Read metadata when Excel file is added
  useEffect(() => {
    if (tool.id === 'excel-to-pdf' && files.length > 0) {
      readExcelMetadata(files[0].file)
        .then((meta) => {
          setExcelSheets(meta.sheetNames);
          if (meta.sheetNames.length > 0) {
            setExcelOptions((prev) => ({ ...prev, sheetName: 'all' }));
          }
        })
        .catch(() => setExcelSheets([]));
    }
  }, [files, tool.id]);

  const handleFilesAdded = (newFiles: File[]) => {
    const newItems: FileItem[] = newFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    if (tool.allowMultiple) {
      setFiles((prev) => [...prev, ...newItems]);
    } else {
      // Release old preview URL if any
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      setFiles(newItems);
    }
  };

  const handleFileRemoved = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleReorderFiles = (fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleReset = () => {
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setProgress({ status: 'idle', progress: 0, message: '' });
    setResult(null);
  };

  const handleExecute = async () => {
    if (files.length === 0) return;

    setProgress({ status: 'processing', progress: 5, message: 'Memulai proses...' });
    setResult(null);

    const updateProg = (percent: number, msg: string) => {
      setProgress({ status: 'processing', progress: percent, message: msg });
    };

    try {
      let outputBlob: Blob;
      let outputFilename: string;

      switch (tool.id) {
        case 'excel-to-pdf': {
          outputBlob = await convertExcelToPdf(files[0].file, excelOptions, updateProg);
          outputFilename = sanitizeFilename(files[0].name, '.pdf');
          break;
        }
        case 'image-to-pdf': {
          const rawFiles = files.map((f) => f.file);
          outputBlob = await convertImagesToPdf(rawFiles, imageOptions, updateProg);
          outputFilename = imageOptions.mergeSinglePdf
            ? sanitizeFilename(files[0].name, '.pdf')
            : 'koleksi_gambar_pdf.zip';
          break;
        }
        case 'pdf-to-image': {
          const res = await convertPdfToImages(files[0].file, pdfImageOptions, updateProg);
          outputBlob = res.zipBlob;
          outputFilename = `${sanitizeFilename(files[0].name.replace(/\.pdf$/i, ''))}_gambar.zip`;
          break;
        }
        case 'merge-pdf': {
          const rawFiles = files.map((f) => f.file);
          outputBlob = await mergePdfFiles(rawFiles, updateProg);
          outputFilename = 'dokumen_gabungan.pdf';
          break;
        }
        case 'split-pdf': {
          if (splitOptions.mode === 'range') {
            outputBlob = await splitPdfByRange(files[0].file, splitOptions.pageRanges, updateProg);
            outputFilename = `${sanitizeFilename(files[0].name.replace(/\.pdf$/i, ''))}_ekstraksi.pdf`;
          } else {
            outputBlob = await splitPdfEveryPage(files[0].file, updateProg);
            outputFilename = `${sanitizeFilename(files[0].name.replace(/\.pdf$/i, ''))}_semua_halaman.zip`;
          }
          break;
        }
        case 'word-to-excel': {
          outputBlob = await convertWordToExcel(files[0].file, updateProg);
          outputFilename = sanitizeFilename(files[0].name, '.xlsx');
          break;
        }
        case 'excel-to-word': {
          outputBlob = await convertExcelToWord(files[0].file, updateProg);
          outputFilename = sanitizeFilename(files[0].name, '.docx');
          break;
        }
        default:
          throw new Error('Alat tidak dikenali');
      }

      setResult({
        blob: outputBlob,
        filename: outputFilename,
        sizeBytes: outputBlob.size,
      });

      setProgress({ status: 'completed', progress: 100, message: 'Konversi Selesai!' });
      // Trigger instant download
      downloadBlob(outputBlob, outputFilename);
    } catch (err: any) {
      console.error(err);
      setProgress({
        status: 'error',
        progress: 0,
        message: err.message || 'Terjadi kesalahan saat memproses file',
      });
    }
  };

  const getToolIcon = () => {
    switch (tool.id) {
      case 'excel-to-pdf':
        return <FileSpreadsheet className="w-6 h-6 text-emerald-500" />;
      case 'image-to-pdf':
        return <ImageIcon className="w-6 h-6 text-purple-500" />;
      case 'pdf-to-image':
        return <FileArchive className="w-6 h-6 text-blue-500" />;
      case 'merge-pdf':
        return <Combine className="w-6 h-6 text-amber-500" />;
      case 'split-pdf':
        return <Split className="w-6 h-6 text-rose-500" />;
      case 'word-to-excel':
        return <FileCode className="w-6 h-6 text-teal-500" />;
      case 'excel-to-word':
        return <FileText className="w-6 h-6 text-indigo-500" />;
      default:
        return <FileText className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Alat</span>
        </button>

        {files.length > 0 && progress.status !== 'processing' && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset File</span>
          </button>
        )}
      </div>

      {/* Tool Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 shrink-0">
          {getToolIcon()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {tool.name}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Main Workspace: Dropzone & Settings */}
      {progress.status !== 'completed' ? (
        <div className="space-y-6">
          {/* File Upload Zone */}
          <Dropzone
            files={files}
            acceptedFormats={tool.acceptedFormats}
            allowMultiple={tool.allowMultiple}
            onFilesAdded={handleFilesAdded}
            onFileRemoved={handleFileRemoved}
            onReorderFiles={tool.allowMultiple ? handleReorderFiles : undefined}
          />

          {/* Options Drawer if file chosen */}
          {files.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <Settings className="w-4 h-4 text-indigo-500" />
                <span>Pengaturan Konversi</span>
              </div>

              {/* Tool Specific Options */}
              {tool.id === 'excel-to-pdf' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sheet Selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Pilih Lembar Kerja (Sheet)
                    </label>
                    <select
                      value={excelOptions.sheetName}
                      onChange={(e) =>
                        setExcelOptions({ ...excelOptions, sheetName: e.target.value })
                      }
                      className="w-full text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">Semua Lembar Kerja (All Sheets)</option>
                      {excelSheets.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Orientation */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Orientasi Halaman
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExcelOptions({ ...excelOptions, orientation: 'landscape' })
                        }
                        className={`text-xs py-2 px-3 rounded-xl border font-medium transition-colors ${
                          excelOptions.orientation === 'landscape'
                            ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Landscape (Lebar)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setExcelOptions({ ...excelOptions, orientation: 'portrait' })
                        }
                        className={`text-xs py-2 px-3 rounded-xl border font-medium transition-colors ${
                          excelOptions.orientation === 'portrait'
                            ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Portrait (Tegak)
                      </button>
                    </div>
                  </div>

                  {/* Theme Palette */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Tema Warna Tabel
                    </label>
                    <select
                      value={excelOptions.theme}
                      onChange={(e) =>
                        setExcelOptions({ ...excelOptions, theme: e.target.value as any })
                      }
                      className="w-full text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="blue">Modern Indigo</option>
                      <option value="emerald">Emerald Fresh</option>
                      <option value="dark">Professional Dark</option>
                      <option value="gray">Minimal Gray</option>
                    </select>
                  </div>

                  {/* Paper Size */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Ukuran Kertas
                    </label>
                    <select
                      value={excelOptions.pageSize}
                      onChange={(e) =>
                        setExcelOptions({ ...excelOptions, pageSize: e.target.value as any })
                      }
                      className="w-full text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="a4">A4 (210 × 297 mm)</option>
                      <option value="letter">US Letter</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Image to PDF Options */}
              {tool.id === 'image-to-pdf' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Orientasi Halaman
                    </label>
                    <select
                      value={imageOptions.orientation}
                      onChange={(e) =>
                        setImageOptions({ ...imageOptions, orientation: e.target.value as any })
                      }
                      className="w-full text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="auto">Otomatis (Ikuti Gambar)</option>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Batas Margin
                    </label>
                    <select
                      value={imageOptions.margin}
                      onChange={(e) =>
                        setImageOptions({ ...imageOptions, margin: e.target.value as any })
                      }
                      className="w-full text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="none">Tanpa Margin (Full edge)</option>
                      <option value="small">Tipis (Rekomendasi)</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Mode Output
                    </label>
                    <select
                      value={imageOptions.mergeSinglePdf ? 'single' : 'zip'}
                      onChange={(e) =>
                        setImageOptions({
                          ...imageOptions,
                          mergeSinglePdf: e.target.value === 'single',
                        })
                      }
                      className="w-full text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="single">Gabung Jadi 1 PDF</option>
                      <option value="zip">Pisah per PDF (ZIP)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* PDF to Image Options */}
              {tool.id === 'pdf-to-image' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Format Gambar
                    </label>
                    <select
                      value={pdfImageOptions.format}
                      onChange={(e) =>
                        setPdfImageOptions({
                          ...pdfImageOptions,
                          format: e.target.value as any,
                        })
                      }
                      className="w-full text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="png">PNG (Tajam, Kualitas Tinggi)</option>
                      <option value="jpeg">JPG (File Lebih Ringan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                      Resolusi Kualitas
                    </label>
                    <select
                      value={pdfImageOptions.dpi}
                      onChange={(e) =>
                        setPdfImageOptions({
                          ...pdfImageOptions,
                          dpi: Number(e.target.value) as any,
                        })
                      }
                      className="w-full text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value={150}>Standard (150 DPI — Cepat)</option>
                      <option value={300}>Ultra HD Print (300 DPI)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Split PDF Options */}
              {tool.id === 'split-pdf' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSplitOptions({ ...splitOptions, mode: 'range' })}
                      className={`text-xs py-2.5 px-3 rounded-xl border font-semibold transition-colors ${
                        splitOptions.mode === 'range'
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-600 dark:text-rose-400'
                          : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Rentang Halaman Tertentu
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitOptions({ ...splitOptions, mode: 'all' })}
                      className={`text-xs py-2.5 px-3 rounded-xl border font-semibold transition-colors ${
                        splitOptions.mode === 'all'
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-600 dark:text-rose-400'
                          : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Pisahkan Tiap Halaman (ZIP)
                    </button>
                  </div>

                  {splitOptions.mode === 'range' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Masukkan Rentang Halaman (Contoh: <code>1-3, 5, 8-10</code>)
                      </label>
                      <input
                        type="text"
                        value={splitOptions.pageRanges}
                        onChange={(e) =>
                          setSplitOptions({ ...splitOptions, pageRanges: e.target.value })
                        }
                        placeholder="Contoh: 1-3, 5"
                        className="w-full text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={handleExecute}
                  disabled={progress.status === 'processing' || (tool.id === 'merge-pdf' && files.length < 2)}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {progress.status === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{progress.message || 'Memproses...'}</span>
                    </>
                  ) : (
                    <span>Mulai Konversi Sekarang</span>
                  )}
                </button>
                {tool.id === 'merge-pdf' && files.length < 2 && (
                  <p className="mt-2 text-center text-[11px] text-amber-500 font-medium">
                    Pilih minimal 2 file PDF untuk digabungkan
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Progress bar during processing */}
          {progress.status === 'processing' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">{progress.message}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{progress.progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {progress.status === 'error' && (
            <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{progress.message}</span>
            </div>
          )}
        </div>
      ) : (
        /* Result Screen */
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Konversi Berhasil 100%!
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              File telah berhasil diproses secara lokal dan siap digunakan.
            </p>
          </div>

          {result && (
            <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between">
              <div className="overflow-hidden pr-3">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {result.filename}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Ukuran: {formatBytes(result.sizeBytes)}
                </p>
              </div>

              <button
                onClick={() => downloadBlob(result.blob, result.filename)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Lagi</span>
              </button>
            </div>
          )}

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Konversi File Lain</span>
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Kembali ke Menu Utama
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
