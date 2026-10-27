import { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ToolDefinition, ToolId } from './types';
import { Navbar } from './components/Navbar';
import { PrivacyModal } from './components/PrivacyBadge';
import { ToolCard } from './components/ToolCard';
import { ToolWorkspace } from './components/ToolWorkspace';

const TOOLS: ToolDefinition[] = [
  {
    id: 'excel-to-pdf',
    name: 'Excel ke PDF',
    description: 'Konversi file spreadsheet (.xlsx, .xls) ke format dokumen PDF rapi dengan pilihan sheet & orientasi.',
    category: 'pdf',
    accentColor: '#10b981',
    badge: 'Populer',
    acceptedFormats: ['.xlsx', '.xls'],
    allowMultiple: false,
  },
  {
    id: 'image-to-pdf',
    name: 'Gambar ke PDF',
    description: 'Ubah foto JPG, PNG, atau WebP menjadi satu atau beberapa file PDF dengan pilihan margin & orientasi.',
    category: 'pdf',
    accentColor: '#a855f7',
    badge: 'Multi-Foto',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    allowMultiple: true,
  },
  {
    id: 'pdf-to-image',
    name: 'PDF ke Gambar',
    description: 'Ekstrak setiap halaman file PDF menjadi gambar PNG tajam atau JPG berkualitas tinggi (unduh ZIP).',
    category: 'pdf',
    accentColor: '#3b82f6',
    acceptedFormats: ['.pdf'],
    allowMultiple: false,
  },
  {
    id: 'merge-pdf',
    name: 'Gabungkan PDF',
    description: 'Satukan dua atau lebih dokumen PDF menjadi satu file utuh dengan susunan urutan yang dapat diatur.',
    category: 'pdf',
    accentColor: '#f59e0b',
    badge: 'Paling Dicari',
    acceptedFormats: ['.pdf'],
    allowMultiple: true,
  },
  {
    id: 'split-pdf',
    name: 'Pisahkan PDF',
    description: 'Ambil rentang halaman tertentu (misal 1-3, 5) atau pisahkan setiap halaman menjadi file PDF tersendiri.',
    category: 'pdf',
    accentColor: '#f43f5e',
    acceptedFormats: ['.pdf'],
    allowMultiple: false,
  },
  {
    id: 'word-to-excel',
    name: 'Word ke Excel',
    description: 'Ekstrak tabel dan data terstruktur dari dokumen Word (.docx) menjadi spreadsheet Excel (.xlsx).',
    category: 'office',
    accentColor: '#14b8a6',
    badge: 'Baru',
    acceptedFormats: ['.docx'],
    allowMultiple: false,
  },
  {
    id: 'excel-to-word',
    name: 'Excel ke Word',
    description: 'Ubah lembar kerja spreadsheet Excel (.xlsx) menjadi dokumen laporan Microsoft Word (.docx) dengan tabel terformat.',
    category: 'office',
    accentColor: '#6366f1',
    badge: 'Baru',
    acceptedFormats: ['.xlsx', '.xls'],
    allowMultiple: false,
  },
];

export function App() {
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'pdf' | 'office'>('all');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Dark mode initialized from localStorage or prefers-color-scheme
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('privapdf_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('privapdf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('privapdf_theme', 'light');
    }
  }, [darkMode]);

  const filteredTools = TOOLS.filter((tool) => {
    if (activeCategory === 'all') return true;
    return tool.category === activeCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onResetToDashboard={() => setActiveTool(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTool ? (
          <ToolWorkspace tool={activeTool} onBack={() => setActiveTool(null)} />
        ) : (
          <div className="space-y-10 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Alternatif iLovePDF 100% Offline & Mandiri di Laptop</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Studio Konversi Dokumen & PDF{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
                  Paling Aman
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Konversi Excel, gambar, dan dokumen Word ke PDF secara lokal tanpa koneksi internet. Semua proses berlangsung di RAM laptop Anda sehingga data dijamin 100% privat dan tidak bocor.
              </p>

              {/* Category Filter Pills */}
              <div className="pt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === 'all'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Semua Alat ({TOOLS.length})
                </button>
                <button
                  onClick={() => setActiveCategory('pdf')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === 'pdf'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  PDF Toolkit (5)
                </button>
                <button
                  onClick={() => setActiveCategory('office')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === 'office'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Office Converters (2)
                </button>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onSelect={(selected) => setActiveTool(selected)}
                />
              ))}
            </div>

            {/* Privacy Highlight Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-emerald-900/10 border border-indigo-200/50 dark:border-indigo-800/40 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-center md:text-left">
                <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30 shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Mengapa PrivaPDF Aman untuk Dokumen Rahasia & Finansial?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tidak ada server, tidak ada database, dan tidak ada akses keluar. Anda bahkan bisa mematikan Wi-Fi laptop saat menggunakannya.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrivacyModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0 transition-colors"
              >
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            PrivaPDF — Studio Konversi & Manipulasi PDF Offline Lokal
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>🛡️ Zero Telemetry</span>
            <span>✈️ Airplane Mode Ready</span>
            <span>⚡ In-Memory Engine</span>
          </div>
        </div>
      </footer>

      {/* Privacy Explanation Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}

export default App;
