# 🛡️ PrivaPDF — Studio Konversi & Manipulasi PDF Offline

> **100% Offline • Zero Telemetry • Client-Side In-Memory • Data Dijamin Tidak Bocor**

PrivaPDF adalah aplikasi web lokal modern (*Single Page Application*) yang berfungsi mirip dengan **iLovePDF** dan **Stirling-PDF**, namun dirancang khusus agar berjalan **sepenuhnya di browser lokal laptop Anda tanpa membutuhkan koneksi internet, tanpa server cloud, dan tanpa database eksternal**.

---

## 🌟 Mengapa PrivaPDF Sangat Aman?

1. **Nol Trafik Jaringan (Zero Network Traffic)**  
   Aplikasi dilindungi secara sistemik oleh header *Content Security Policy (CSP)*:
   ```html
   <meta http-equiv="Content-Security-Policy" content="... connect-src 'none'; ...">
   ```
   Aturan `connect-src 'none'` secara tegas memblokir semua panggilan `fetch()`, `XMLHttpRequest`, atau WebSocket ke internet. Browser menolak mentah-mentah segala transmisi data keluar.
2. **Pemrosesan Murni di Memori Laptop (RAM)**  
   Dokumen yang Anda unggah hanya dibaca ke dalam memori RAM lokal (`ArrayBuffer` / `Uint8Array`), diproses oleh engine JavaScript lokal, dan langsung di-generate untuk diunduh.
3. **Pembersihan Memori Otomatis (*No Leakage*)**  
   Begitu file diunduh atau sesi direset, referensi objek biner langsung dihancurkan via `URL.revokeObjectURL()`.
4. **Bisa Digunakan dalam Mode Pesawat (*Airplane Mode Ready*)**  
   Anda dapat mematikan seluruh koneksi Wi-Fi laptop Anda saat mengonversi dokumen sensitif, finansial, atau rahasia perusahaan.

---

## 🧰 7 Alat Konversi & Manipulasi Utama

### A. PDF Toolkit
1. **Excel ke PDF (`.xlsx`, `.xls` ➡️ `.pdf`)**
   * Deteksi multi-sheet otomatis (pilih sheet tertentu atau semua).
   * Pilihan orientasi (Landscape / Portrait) dan ukuran kertas (A4 / Letter).
   * 4 Tema tabel elegan: *Modern Indigo, Emerald Fresh, Professional Dark, Minimal Gray*.
   * Header tabel berulang otomatis pada dokumen multi-halaman.
2. **Gambar ke PDF (`.jpg`, `.jpeg`, `.png`, `.webp` ➡️ `.pdf`)**
   * Multi-unggah gambar sekaligus dengan fitur atur urutan (naik/turun).
   * Pilihan batas margin (Tanpa margin, Tipis, Normal).
   * Opsi: Gabung jadi 1 dokumen PDF atau pisah per gambar dalam arsip ZIP.
3. **PDF ke Gambar (`.pdf` ➡️ `.png` / `.jpg`)**
   * Menggunakan engine Mozilla PDF.js lokal.
   * Pilihan resolusi: Standard (150 DPI) atau Ultra HD Print (300 DPI).
   * Unduh seluruh halaman dalam satu file arsip `.zip`.
4. **Gabungkan PDF (Merge Multiple PDF)**
   * Satukan 2 atau lebih file PDF dalam urutan kustom tanpa batas halaman.
5. **Pisahkan PDF (Split PDF)**
   * **Mode 1**: Ekstrak rentang halaman kustom (contoh: `1-3, 5, 8-10`).
   * **Mode 2**: Pisahkan setiap halaman menjadi file PDF mandiri (bundel ZIP).

### B. Office Document Converters
6. **Word ke Excel (`.docx` ➡️ `.xlsx`)**
   * Membaca tabel OpenXML Word dan mengekstraknya menjadi lembar kerja Excel (`Table_1`, `Table_2`).
7. **Excel ke Word (`.xlsx` ➡️ `.docx`)**
   * Mengubah lembar kerja spreadsheet Excel menjadi laporan dokumen Word (`.docx`) lengkap dengan tabel native terformat dan judul sheet.

---

## 🚀 Cara Menjalankan di Laptop

### 1. Prasyarat
* Laptop sudah terpasang **Node.js** (versi 18 ke atas disarankan).

### 2. Menjalankan Aplikasi
Buka Terminal dan arahkan ke folder proyek di Desktop:
```bash
cd /Users/jakamiriandi/Desktop/PrivaPDF

# Jalankan server lokal
npm run dev
```

Buka browser Anda dan akses:
👉 **`http://localhost:5173`**

### 3. Build Versi Produksi Mandiri (Opsional)
Jika Anda ingin menghasilkan bundle statis mandiri:
```bash
npm run build
npm run preview
```

---

## 📁 Struktur Proyek
```text
PrivaPDF/
├── index.html                  # HTML Entry Point dengan CSP ketat (connect-src 'none')
├── package.json                # Dependensi lokal & scripts
├── vite.config.ts              # Konfigurasi Vite
├── tailwind.config.js          # Tema warna & Dark mode
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Dashboard utama & navigasi
│   ├── index.css               # Styling global & scrollbar
│   ├── types/
│   │   └── index.ts            # Definisi tipe data TypeScript
│   ├── components/             # Komponen antarmuka (UI)
│   │   ├── Navbar.tsx          # Navigasi atas & toggle tema
│   │   ├── ToolCard.tsx        # Kartu alat konversi interaktif
│   │   ├── Dropzone.tsx        # Drag-and-drop file uploader
│   │   ├── ToolWorkspace.tsx   # Lembar kerja alat aktif
│   │   └── PrivacyBadge.tsx    # Modal edukasi & jaminan privasi
│   ├── modules/                # Engine konversi 100% client-side
│   │   ├── excelToPdf.ts       # SheetJS + jsPDF-AutoTable
│   │   ├── imageToPdf.ts       # HTML5 Canvas + pdf-lib
│   │   ├── pdfToImage.ts       # Mozilla PDF.js + JSZip
│   │   ├── mergePdf.ts         # pdf-lib merger
│   │   ├── splitPdf.ts         # pdf-lib splitter + JSZip
│   │   ├── wordToExcel.ts      # Mammoth.js + SheetJS
│   │   └── excelToWord.ts      # SheetJS + docx
│   └── utils/
│       ├── fileHelpers.ts      # Format ukuran & sanitasi nama file
│       └── downloadHelper.ts   # Auto revokeObjectURL download helper
└── sample-files/               # File contoh untuk pengujian
```

---

## ⚖️ Lisensi & Hak Cipta
Dibuat untuk penggunaan mandiri secara lokal dengan jaminan privasi penuh (*Self-hosted & Air-gapped ready*).
