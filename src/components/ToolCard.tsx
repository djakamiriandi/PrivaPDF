import React from 'react';
import {
  FileSpreadsheet,
  Image as ImageIcon,
  FileText,
  Combine,
  Split,
  FileCode,
  FileArchive,
  ArrowRight,
} from 'lucide-react';
import { ToolDefinition } from '../types';

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: (tool: ToolDefinition) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const getIcon = () => {
    switch (tool.id) {
      case 'excel-to-pdf':
        return <FileSpreadsheet className="w-7 h-7 text-emerald-500" />;
      case 'image-to-pdf':
        return <ImageIcon className="w-7 h-7 text-purple-500" />;
      case 'pdf-to-image':
        return <FileArchive className="w-7 h-7 text-blue-500" />;
      case 'merge-pdf':
        return <Combine className="w-7 h-7 text-amber-500" />;
      case 'split-pdf':
        return <Split className="w-7 h-7 text-rose-500" />;
      case 'word-to-excel':
        return <FileCode className="w-7 h-7 text-teal-500" />;
      case 'excel-to-word':
        return <FileText className="w-7 h-7 text-indigo-500" />;
      default:
        return <FileText className="w-7 h-7 text-indigo-500" />;
    }
  };

  const getBorderHover = () => {
    switch (tool.id) {
      case 'excel-to-pdf':
        return 'group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/10';
      case 'image-to-pdf':
        return 'group-hover:border-purple-500/50 group-hover:shadow-purple-500/10';
      case 'pdf-to-image':
        return 'group-hover:border-blue-500/50 group-hover:shadow-blue-500/10';
      case 'merge-pdf':
        return 'group-hover:border-amber-500/50 group-hover:shadow-amber-500/10';
      case 'split-pdf':
        return 'group-hover:border-rose-500/50 group-hover:shadow-rose-500/10';
      case 'word-to-excel':
        return 'group-hover:border-teal-500/50 group-hover:shadow-teal-500/10';
      case 'excel-to-word':
        return 'group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/10';
      default:
        return 'group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/10';
    }
  };

  return (
    <button
      onClick={() => onSelect(tool)}
      className={`group relative flex flex-col text-left p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${getBorderHover()}`}
    >
      {/* Badge */}
      {tool.badge && (
        <span className="absolute top-4 right-4 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {tool.badge}
        </span>
      )}

      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
        {getIcon()}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {tool.name}
      </h3>

      {/* Description */}
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
        {tool.description}
      </p>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
        <span>Buka Alat</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};
