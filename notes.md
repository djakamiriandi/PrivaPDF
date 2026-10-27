# 📝 Release & Distribution Notes — PrivaPDF v1.0.0

Aplikasi **PrivaPDF** kini mendukung instalasi desktop secara penuh untuk **MacBook (macOS)** dan **Windows PC**, serta dapat dijalankan langsung di peramban web lokal.

---

## 📦 File Paket Rilis yang Tersedia di GitHub Releases:

1. 🍏 **Untuk Pengguna MacBook / Apple Silicon (macOS):**
   * **Nama File:** `PrivaPDF-1.0.0-arm64.dmg`
   * **Format:** Apple Disk Image (`.dmg`)
   * **Cara Pasang:** Klik dua kali file `.dmg`, lalu tarik (*drag & drop*) icon **PrivaPDF** ke folder **Applications**.
   * **Kompatibilitas:** macOS Ventura (13.0), Sonoma (14.0), Sequoia (15.0), dan versi lebih baru.

2. 🪟 **Untuk Pengguna Windows PC (64-bit):**
   * **Nama File:** `PrivaPDF-Windows-x64.zip`
   * **Format:** Portable Zip Package
   * **Cara Pasang:** Klik kanan file `.zip` ➡️ pilih **Extract All...** ➡️ buka folder dan klik dua kali **`PrivaPDF.exe`**.
   * **Kompatibilitas:** Windows 10 dan Windows 11 (64-bit).

3. 🌐 **Untuk Pengembang / Web Lokal:**
   * Dapat dijalankan menggunakan `npm run dev` di browser lokal dengan proteksi *Content Security Policy* (`connect-src 'none'`).

---

## 🔒 Catatan Keamanan & Privasi
* Semua pemrosesan berkas (Excel, gambar JPG/PNG/WebP, PDF, dan dokumen Word) dilakukan **100% secara offline** di dalam memori RAM komputer klien.
* Tidak ada koneksi internet yang dibuka, tidak ada analitik atau telemetri yang dikirimkan.
