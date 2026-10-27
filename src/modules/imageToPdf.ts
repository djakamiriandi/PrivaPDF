import { PDFDocument, PageSizes } from 'pdf-lib';
import JSZip from 'jszip';
import { ImageToPdfOptions } from '../types';
import { readFileAsDataURL, sanitizeFilename } from '../utils/fileHelpers';

/**
 * Loads an image File into an HTMLImageElement to read dimensions and draw on canvas
 */
function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = dataUrl;
  });
}

/**
 * Converts image to clean PNG ArrayBuffer using HTML5 Canvas (useful for WebP/GIF/BMP conversion)
 */
async function imageToPngBytes(img: HTMLImageElement): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Tidak dapat membuat konteks canvas 2D');
  ctx.drawImage(img, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Gagal mengekspor canvas'));
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    }, 'image/png');
  });
}

/**
 * Converts single or multiple images to PDF.
 */
export async function convertImagesToPdf(
  images: File[],
  options: ImageToPdfOptions,
  onProgress?: (progress: number, message: string) => void
): Promise<Blob> {
  if (images.length === 0) {
    throw new Error('Pilih minimal satu gambar');
  }

  // Margin calculation (in points, 72 pt = 1 inch)
  const margin = options.margin === 'none' ? 0 : options.margin === 'small' ? 18 : 36;

  if (options.mergeSinglePdf) {
    onProgress?.(10, 'Membuat dokumen PDF...');
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const progressPercent = 10 + Math.round(((i + 1) / images.length) * 80);
      onProgress?.(progressPercent, `Memproses gambar ${i + 1} dari ${images.length}...`);

      const dataUrl = await readFileAsDataURL(file);
      const imgElem = await loadImageElement(dataUrl);

      // Convert to PNG bytes
      const pngBytes = await imageToPngBytes(imgElem);
      const embeddedImage = await pdfDoc.embedPng(pngBytes);

      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      // Determine page size & orientation
      let pageWidth = PageSizes.A4[0]; // 595.28 pt
      let pageHeight = PageSizes.A4[1]; // 841.89 pt

      if (options.orientation === 'auto') {
        if (imgWidth > imgHeight) {
          pageWidth = PageSizes.A4[1];
          pageHeight = PageSizes.A4[0];
        }
      } else if (options.orientation === 'landscape') {
        pageWidth = PageSizes.A4[1];
        pageHeight = PageSizes.A4[0];
      }

      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      // Fit image inside available area preserving aspect ratio
      const widthRatio = availableWidth / imgWidth;
      const heightRatio = availableHeight / imgHeight;
      const scale = Math.min(widthRatio, heightRatio);

      const renderWidth = imgWidth * scale;
      const renderHeight = imgHeight * scale;

      // Center the image
      const x = margin + (availableWidth - renderWidth) / 2;
      const y = margin + (availableHeight - renderHeight) / 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x,
        y,
        width: renderWidth,
        height: renderHeight,
      });
    }

    onProgress?.(95, 'Menyusun file PDF...');
    const pdfBytes = await pdfDoc.save();
    onProgress?.(100, 'Konversi gambar ke PDF selesai!');
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } else {
    // Separate PDF per image inside ZIP
    const zip = new JSZip();

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const percent = 10 + Math.round(((i + 1) / images.length) * 80);
      onProgress?.(percent, `Mengonversi ${file.name} (${i + 1}/${images.length})...`);

      const singleDoc = await PDFDocument.create();
      const dataUrl = await readFileAsDataURL(file);
      const imgElem = await loadImageElement(dataUrl);
      const pngBytes = await imageToPngBytes(imgElem);
      const embeddedImage = await singleDoc.embedPng(pngBytes);

      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      let pageWidth = PageSizes.A4[0];
      let pageHeight = PageSizes.A4[1];
      if (options.orientation === 'auto' && imgWidth > imgHeight) {
        pageWidth = PageSizes.A4[1];
        pageHeight = PageSizes.A4[0];
      } else if (options.orientation === 'landscape') {
        pageWidth = PageSizes.A4[1];
        pageHeight = PageSizes.A4[0];
      }

      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
      const renderWidth = imgWidth * scale;
      const renderHeight = imgHeight * scale;

      const page = singleDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x: margin + (availableWidth - renderWidth) / 2,
        y: margin + (availableHeight - renderHeight) / 2,
        width: renderWidth,
        height: renderHeight,
      });

      const pdfBytes = await singleDoc.save();
      const outputName = sanitizeFilename(file.name, '.pdf');
      zip.file(outputName, pdfBytes);
    }

    onProgress?.(95, 'Mengemas ZIP...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.(100, 'Selesai!');
    return zipBlob;
  }
}
