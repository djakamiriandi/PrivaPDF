import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  File as FileIcon,
  X,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes } from '../utils/fileHelpers';

interface DropzoneProps {
  files: FileItem[];
  acceptedFormats: string[];
  allowMultiple: boolean;
  onFilesAdded: (newFiles: File[]) => void;
  onFileRemoved: (id: string) => void;
  onReorderFiles?: (fromIndex: number, toIndex: number) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  files,
  acceptedFormats,
  allowMultiple,
  onFilesAdded,
  onFileRemoved,
  onReorderFiles,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndAddFiles = (incoming: FileList | File[]) => {
    setErrorMsg(null);
    const validFiles: File[] = [];
    const list = Array.from(incoming);

    for (const f of list) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      const isValid = acceptedFormats.some((accepted) => {
        if (accepted.startsWith('.')) return ext === accepted.toLowerCase();
        return f.type.includes(accepted);
      });

      if (isValid) {
        validFiles.push(f);
      } else {
        setErrorMsg(`Format "${f.name}" tidak didukung (${acceptedFormats.join(', ')})`);
      }
    }

    if (validFiles.length > 0) {
      if (!allowMultiple && validFiles.length > 1) {
        onFilesAdded([validFiles[0]]);
      } else {
        onFilesAdded(validFiles);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      // Reset input value so same file can be picked again if removed
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          multiple={allowMultiple}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 mb-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Tarik & Lepaskan file ke sini, atau <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-400/50 underline-offset-2">pilih dari laptop</span>
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Format yang didukung: <span className="font-medium text-slate-700 dark:text-slate-300">{acceptedFormats.join(', ')}</span>
            {allowMultiple ? ' (Bisa pilih banyak file)' : ' (Satu file)'}
          </p>
        </div>
      </div>

      {/* Error alert if format invalid */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">
            <span>Daftar File Dipilih ({files.length})</span>
            {onReorderFiles && files.length > 1 && (
              <span className="text-indigo-600 dark:text-indigo-400">Gunakan panah untuk atur urutan</span>
            )}
          </div>

          <div className="space-y-2">
            {files.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {/* Thumbnail or Icon */}
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                      <FileIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {formatBytes(item.size)}
                    </p>
                  </div>
                </div>

                {/* Actions: Reorder & Remove */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {onReorderFiles && files.length > 1 && (
                    <>
                      <button
                        onClick={() => onReorderFiles(index, index - 1)}
                        disabled={index === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                        title="Geser ke atas"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onReorderFiles(index, index + 1)}
                        disabled={index === files.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                        title="Geser ke bawah"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => onFileRemoved(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
                    title="Hapus file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
