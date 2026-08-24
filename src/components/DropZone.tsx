import React, { useRef, useState } from 'react';
import { UploadCloud, FileUp, Sparkles, FolderOpen, AlertCircle } from 'lucide-react';
import { TabMode } from '../types';

interface DropZoneProps {
  activeTab: TabMode;
  disabled?: boolean;
  onFilesSelected: (files: File[]) => void;
  onLoadSamples: () => void;
  selectedFilesCount: number;
}

export const DropZone: React.FC<DropZoneProps> = ({
  activeTab,
  disabled = false,
  onFilesSelected,
  onLoadSamples,
  selectedFilesCount,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = activeTab === 'FUNDUS_PDF' ? '.pdf,application/pdf' : '.pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf';
  const formatHintText = activeTab === 'FUNDUS_PDF' ? '僅支援 PDF 格式 (眼底攝影掃描與數位報告)' : '支援 PDF, JPG, PNG 格式 (相機照片、眼底圖檔、掃描件)';

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

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
      // Reset input value so re-selecting same files triggers change event
      e.target.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats}
        onChange={handleFileInputChange}
        className="hidden"
        id="file-upload-input"
        aria-label="選擇檔案上傳"
      />

      {/* Senior-Friendly Drop Zone Container */}
      <div
        id="file-drop-zone"
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
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
        className={`relative w-full rounded-2xl transition-all duration-200 cursor-pointer flex flex-col items-center justify-center p-6 sm:p-8 text-center select-none ${
          isDragOver
            ? 'bg-blue-100 border-blue-600 scale-[1.005] shadow-lg'
            : 'hover:bg-[#EEF4FB] hover:border-blue-500'
        } ${
          disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
        }`}
        style={{
          minHeight: '220px',
          backgroundColor: isDragOver ? '#EEF4FB' : '#F4F7FA',
          borderWidth: '3px',
          borderStyle: 'dashed',
          borderColor: isDragOver ? '#1565C0' : '#60A5FA', // 3px border-blue-400
        }}
      >
        {/* Cloud Upload Icon 64x64 */}
        <div 
          id="dropzone-cloud-icon"
          className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 shadow-sm"
        >
          <UploadCloud className="w-16 h-16 text-blue-700" strokeWidth={2.2} />
        </div>

        {/* Primary Prompt Text (1.25rem font size) */}
        <p 
          id="dropzone-prompt-text"
          className="font-bold text-slate-800 tracking-wide text-xl sm:text-2xl mb-2"
          style={{ fontSize: '1.25rem' }}
        >
          點擊此處選擇檔案 或 將檔案拖曳至此區域
        </p>

        {/* Format hint */}
        <p className="text-slate-600 font-medium text-base sm:text-lg mb-4">
          {formatHintText}（支援多檔案批次選取）
        </p>

        {/* Action Button Strip */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={triggerFileInput}
            className="min-touch-target inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-800 text-white font-bold text-lg hover:bg-blue-900 shadow-md transition-transform active:scale-95"
            style={{ backgroundColor: '#1565C0' }}
          >
            <FolderOpen className="w-5 h-5" />
            <span>瀏覽本機檔案</span>
          </button>

          {/* One-click Sample Test Loader */}
          <button
            type="button"
            id="load-samples-button"
            onClick={onLoadSamples}
            className="min-touch-target inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 text-amber-900 border-2 border-amber-300 font-bold text-lg hover:bg-amber-100 shadow-sm transition-transform active:scale-95"
            title="一鍵載入真實醫療情境範例檔案快速體驗"
          >
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>🧪 載入測試範例 ({activeTab === 'FUNDUS_PDF' ? '5份PDF表單' : '6張影像檔案'})</span>
          </button>
        </div>

        {/* Selected count notification pill */}
        {selectedFilesCount > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-900 font-bold text-base border border-blue-300 animate-pulse">
            <FileUp className="w-5 h-5 text-blue-700" />
            <span>目前已選擇 {selectedFilesCount} 個檔案</span>
          </div>
        )}
      </div>
    </div>
  );
};
