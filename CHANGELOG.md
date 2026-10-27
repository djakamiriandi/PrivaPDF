# Changelog

All notable changes to **PrivaPDF** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-27

### Added
- **Excel to PDF Converter**:
  - Full support for `.xlsx` and `.xls` workbooks using SheetJS and jsPDF-AutoTable.
  - Multi-sheet detection with sheet selector.
  - Page orientation (Portrait/Landscape) and paper sizes (A4/Letter).
  - 4 Table color themes: Modern Indigo, Emerald Fresh, Professional Dark, Minimal Gray.
  - Automatic page repeating headers.
- **Image to PDF Converter**:
  - Convert JPG, PNG, and WebP images to PDF.
  - Drag-and-drop reordering with move up/down controls.
  - Margin adjustments (None, Small, Normal) and orientation auto-fit.
  - Option to merge into a single PDF or export separate PDFs in a ZIP archive.
- **PDF to Image Converter**:
  - High-resolution rendering using Mozilla PDF.js.
  - Support for PNG (lossless) and JPEG outputs.
  - Resolution selector (150 DPI standard, 300 DPI ultra HD print).
  - One-click "Download All Pages as ZIP".
- **Merge PDF**:
  - Combine multiple PDF files in custom order with drag-and-drop card UI.
- **Split PDF**:
  - Mode 1: Custom page range extraction (e.g. `1-3, 5, 8-10`).
  - Mode 2: Extract every page to individual PDFs in a ZIP archive.
- **Word to Excel Converter**:
  - Parse OpenXML `.docx` documents and extract tables to individual Excel sheets.
- **Excel to Word Converter**:
  - Transform Excel spreadsheet tables into native Microsoft Word `.docx` documents with styled headers and borders.
- **Privacy & Security Architecture**:
  - Strict Content Security Policy (`connect-src 'none'`) forbidding network traffic.
  - 100% in-browser RAM execution with automatic `URL.revokeObjectURL()` memory release.
- **Desktop Application Packaging**:
  - Electron integration with standalone Windows `.exe` portable build.
  - Automated CI/CD GitHub Actions workflow for building Windows installers (`.exe`) on release.
