import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FolderOpen, 
  Sparkles, 
  Play, 
  Loader2, 
  Download, 
  RotateCcw,
} from 'lucide-react';
import { TabMode, AppState, FileProcessingItem } from '../types';

interface LeftControlPanelProps {
  activeTab: TabMode;
  appState: AppState;
  items: FileProcessingItem[];
  progressPercent: number;
  currentProcessingName?: string;
  onFilesSelected: (files: File[]) => void;
  onLoadSamples: () => void;
  onStartProcessing: () => void;
  onDownloadZip: () => void;
  onReset: () => void;
}

export const LeftControlPanel: React.FC<LeftControlPanelProps> = ({
  activeTab,
  appState,
  items,
  progressPercent,
  currentProcessingName,
  onFilesSelected,
  onLoadSamples,
  onStartProcessing,
  onDownloadZip,
  onReset,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProcessing = appState === 'PROCESSING';
  const isCompleted = appState === 'COMPLETED';
  const hasFiles = items.length > 0;
  const successCount = items.filter(i => i.status === 'success').length;

  const acceptedFormats = activeTab === 'FUNDUS_PDF' 
    ? '.pdf,application/pdf' 
    : '.pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf';

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray: File[] = Array.from(e.dataTransfer.files);
      const filtered = filesArray.filter((file: File) => {
        if (activeTab === 'FUNDUS_PDF') {
          return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        }
        return (
          file.type === 'application/pdf' ||
          file.name.toLowerCase().endsWith('.pdf') ||
          file.type.startsWith('image/') ||
          /\.(jpg|jpeg|png)$/i.test(file.name)
        );
      });

      if (filtered.length > 0) {
        onFilesSelected(filtered);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray: File[] = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
            1
          </span>
          <h2 className="font-bold text-slate-900 text-lg">
            上傳待處理檔案
          </h2>
        </div>
        {hasFiles && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            已載入 {items.length} 個檔案
          </span>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats}
        onChange={handleFileInputChange}
        className="hidden"
        id="control-file-input"
        aria-label="選擇檔案上傳"
      />

      {/* Upload Drag & Drop Box */}
      <div
        role="button"
        tabIndex={isProcessing ? -1 : 0}
        onClick={triggerFileInput}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerFileInput();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full rounded-xl transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-6 text-center select-none ${
          isDragOver
            ? 'bg-blue-50 border-blue-600 shadow-md'
            : 'bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
        style={{
          minHeight: '190px',
          borderWidth: '2px',
          borderStyle: 'dashed',
          borderColor: isDragOver ? '#1565C0' : '#94A3B8',
        }}
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 shadow-xs">
          <UploadCloud className="w-8 h-8 text-blue-700" />
        </div>

        <p className="font-bold text-slate-800 text-base mb-1">
          點擊選擇檔案 或 拖曳至此
        </p>
        <p className="text-slate-500 text-xs sm:text-sm mb-3">
          {activeTab === 'FUNDUS_PDF' ? '僅支援 PDF 格式 (眼底表單)' : '支援 PDF、JPG、PNG 影像格式'}
        </p>

        <div className="flex items-center gap-2 flex-wrap justify-center" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={triggerFileInput}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 shadow-xs transition-colors"
            style={{ backgroundColor: '#1565C0' }}
          >
            <FolderOpen className="w-4 h-4" />
            <span>選擇本機檔案</span>
          </button>

          <button
            type="button"
            id="load-sample-btn-unified"
            onClick={onLoadSamples}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-bold text-sm hover:bg-amber-100 shadow-xs transition-colors"
            title="一鍵載入測試範例"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>🧪 載入測試範例</span>
          </button>
        </div>
      </div>

      {/* Progress Bar when Processing */}
      {isProcessing && (
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1 truncate max-w-[220px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-700 shrink-0" />
              <span>處理：{currentProcessingName || '解析中...'}</span>
            </span>
            <span className="font-mono text-blue-900 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-blue-700 transition-all duration-200 rounded-full"
              style={{ width: `${progressPercent}%`, backgroundColor: '#1565C0' }}
            />
          </div>
        </div>
      )}

      {/* 2. THE SINGLE CONVERT ACTION BUTTON */}
      <div className="pt-2 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
            2
          </span>
          <h2 className="font-bold text-slate-900 text-lg">
            執行轉檔
          </h2>
        </div>

        {/* Primary Action Button */}
        {!isCompleted ? (
          <button
            id="main-convert-action-button"
            type="button"
            disabled={!hasFiles || isProcessing}
            onClick={onStartProcessing}
            className={`min-touch-target w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-bold text-lg text-white shadow-md transition-all ${
              !hasFiles || isProcessing
                ? 'opacity-50 cursor-not-allowed bg-slate-400'
                : 'hover:brightness-110 active:scale-[0.99] cursor-pointer'
            }`}
            style={{
              backgroundColor: !hasFiles || isProcessing ? '#94A3B8' : '#1565C0',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>正在轉檔辨識中 ({progressPercent}%)...</span>
              </>
            ) : hasFiles ? (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>⚡ 開始轉檔 ({items.length} 個檔案)</span>
              </>
            ) : (
              <span>請先上傳檔案</span>
            )}
          </button>
        ) : (
          <div className="flex flex-col gap-2.5">
            {/* Download Zip Main Green Button */}
            <button
              id="download-zip-unified-btn"
              type="button"
              onClick={onDownloadZip}
              className="min-touch-target w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-bold text-lg text-white shadow-md hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
              style={{ backgroundColor: '#2E7D32' }}
            >
              <Download className="w-5 h-5" />
              <span>📥 下載已改名打包檔 ({successCount} 件 .zip)</span>
            </button>

            {/* Reset / New Batch Button */}
            <button
              type="button"
              onClick={onReset}
              className="min-touch-target flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
              title="清空檔案並處理新的一批"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>清空，處理下一批檔案</span>
            </button>
          </div>
        )}

        {/* Reset button if files loaded but not completed */}
        {hasFiles && !isProcessing && !isCompleted && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 py-1 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>清空已選取檔案</span>
          </button>
        )}
      </div>

    </div>
  );
};
