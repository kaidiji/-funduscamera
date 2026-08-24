import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, Package, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FileProcessingItem } from '../types';

interface ExportSectionProps {
  items: FileProcessingItem[];
  onDownloadZip: () => Promise<void>;
  onExportCsv: () => void;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  items,
  onDownloadZip,
  onExportCsv,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const successfulItems = items.filter(item => item.status === 'success' && item.selectedForExport !== false);
  const hasSuccessfulItems = successfulItems.length > 0;

  const handleZipClick = async () => {
    if (!hasSuccessfulItems || isExporting) return;

    try {
      setIsExporting(true);
      await onDownloadZip();
      
      // Trigger festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // confetti fallback
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch {
      // handled upstream
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-5 sm:p-7 rounded-2xl border-2 border-emerald-300 shadow-md">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl">🎉</span>
            <h3 className="font-extrabold text-emerald-950 text-xl sm:text-2xl">
              批次改名處理完畢・匯出打包專區
            </h3>
          </div>
          <p className="text-emerald-800 text-base sm:text-lg font-medium mt-1">
            已成功為 <span className="font-extrabold text-emerald-950 text-xl">{successfulItems.length}</span> 筆檔案產出標準化檔名，可立即打包下載 ZIP 或匯出稽核報表。
          </p>
        </div>

        {downloadSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-base shadow-sm animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>ZIP 下載已啟動！</span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
        
        {/* Prominent Green Download ZIP Button (#2E7D32, Min-height 56px) */}
        <button
          id="download-zip-button"
          type="button"
          disabled={!hasSuccessfulItems || isExporting}
          onClick={handleZipClick}
          className={`min-touch-target flex-1 flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-extrabold text-xl sm:text-2xl text-white shadow-lg transition-all duration-200 ${
            !hasSuccessfulItems || isExporting
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:brightness-110 active:scale-[0.99] cursor-pointer ring-4 ring-emerald-400/30'
          }`}
          style={{
            minHeight: '56px',
            backgroundColor: '#2E7D32', // Prominent Green Color #2E7D32 as specified in requirements
          }}
        >
          {isExporting ? (
            <>
              <Package className="w-7 h-7 animate-bounce" />
              <span>正在壓縮打包中，請稍候...</span>
            </>
          ) : (
            <>
              <Download className="w-7 h-7" />
              <span>📥 下載已改名打包檔 (.zip)</span>
            </>
          )}
        </button>

        {/* CSV Audit Report Button */}
        <button
          id="export-csv-button"
          type="button"
          onClick={onExportCsv}
          className="min-touch-target flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-slate-800 bg-white hover:bg-emerald-100/60 border-2 border-emerald-400 text-lg transition-all shadow-sm"
          style={{ minHeight: '56px' }}
          title="匯出包含原始檔名、新檔名與身分證字號的對照清單"
        >
          <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
          <span>📋 匯出改名清冊 (.csv)</span>
        </button>

      </div>

      <div className="mt-3 text-xs sm:text-sm text-emerald-800 flex items-center gap-1.5 font-medium">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>ZIP 壓縮檔內已自動包含「已改名檔案」及「醫療表單改名稽核清單_Audit_Report.csv」。</span>
      </div>

    </div>
  );
};
