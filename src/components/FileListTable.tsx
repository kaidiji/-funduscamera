import React, { useState } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Edit3, 
  Eye, 
  Trash2, 
  ArrowRight,
  Search,
  AlertCircle,
  Play,
  Layers
} from 'lucide-react';
import { FileProcessingItem, AppState } from '../types';

interface FileListTableProps {
  appState: AppState;
  items: FileProcessingItem[];
  onEditItem: (item: FileProcessingItem) => void;
  onPreviewItem: (item: FileProcessingItem) => void;
  onDeleteItem: (id: string) => void;
  onStartProcessing?: () => void;
}

export const FileListTable: React.FC<FileListTableProps> = ({
  appState,
  items,
  onEditItem,
  onPreviewItem,
  onDeleteItem,
  onStartProcessing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

  const isPendingState = appState === 'FILES_SELECTED';

  const successCount = items.filter(i => i.status === 'success').length;
  const failedCount = items.filter(i => i.status === 'failed').length;

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.newName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.extractedId && item.extractedId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.extractedName && item.extractedName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  // 1. Empty State (IDLE)
  if (items.length === 0 || appState === 'IDLE') {
    return (
      <div className="w-full h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-[380px]">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-blue-700" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg sm:text-xl mb-1.5">
          尚未有待處理檔案
        </h3>
        <p className="text-slate-500 text-sm max-w-sm mb-4 leading-relaxed">
          請於左側上傳待處理檔案或點擊「🧪 載入測試範例」，並按下「⚡ 開始轉檔」按鈕執行自動辨識。
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
          💡 轉檔後的新舊檔名對照與病患資訊將於點擊「開始轉檔」後即時呈現於此
        </div>
      </div>
    );
  }

  // 2. Pending Queue State (剛上傳檔案到待處理檔案，尚未開始轉檔)
  if (isPendingState) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Top Header Bar for Pending Files */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                待處理檔案清單
              </h3>
              <p className="text-slate-500 text-xs">
                檔案已載入就緒，請點擊左側「⚡ 開始轉檔」執行批次辨識
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              已就緒 {items.length} 件
            </span>
          </div>
        </div>

        {/* Informational banner */}
        <div className="px-4 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between gap-2 text-xs text-blue-900">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-blue-700 shrink-0" />
            <span>目前處於等候轉檔狀態，點擊「⚡ 開始轉檔」後即會呈現辨識結果與新檔名</span>
          </div>
          {onStartProcessing && (
            <button
              onClick={onStartProcessing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-700 text-white font-bold hover:bg-blue-800 transition-colors shrink-0"
              style={{ backgroundColor: '#1565C0' }}
            >
              <Play className="w-3 h-3 fill-white" />
              <span>立即轉檔</span>
            </button>
          )}
        </div>

        {/* Pending File Items List */}
        <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto custom-scrollbar">
          {items.map((item, index) => {
            const isPdf = item.fileType.includes('pdf') || item.originalName.endsWith('.pdf');
            return (
              <div 
                key={item.id}
                className="p-3.5 sm:p-4 transition-colors hover:bg-slate-50 flex items-center justify-between gap-3 bg-white"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* File Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isPdf ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                      <p className="font-mono text-sm font-bold text-slate-800 truncate">
                        {item.originalName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{(item.originalSize / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>{isPdf ? 'PDF 文件' : '影像圖檔'}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Pending status & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>等候轉檔</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="移除此檔案"
                    aria-label={`移除 ${item.originalName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 3. Processing or Completed State
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* Top Header Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Title & Badge */}
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-slate-900 text-lg">
            轉檔清單
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
              成功 {successCount}
            </span>
            {failedCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                失敗 {failedCount}
              </span>
            )}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative min-w-[150px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋身分證/姓名/檔名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            />
          </div>

          {/* Status Filter Tabs (全部 / 成功 / 失敗) */}
          <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter('success')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'success' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              成功 ({successCount})
            </button>
            <button
              onClick={() => setStatusFilter('failed')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'failed' ? 'bg-rose-700 text-white shadow-xs' : 'text-rose-800 hover:text-rose-950'
              }`}
            >
              失敗 ({failedCount})
            </button>
          </div>
        </div>
      </div>

      {/* List / Cards Layout */}
      <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            {statusFilter === 'failed' ? '目前沒有失敗檔案' : '沒有符合篩選條件的檔案'}
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const isPdf = item.fileType.includes('pdf') || item.originalName.endsWith('.pdf');
            const isSuccess = item.status === 'success';
            const isFailed = item.status === 'failed';
            const isProcessing = item.status === 'processing';

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 transition-colors hover:bg-slate-50 ${
                  isSuccess
                    ? 'bg-white'
                    : isFailed
                    ? 'bg-rose-50/30'
                    : 'bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Icon + Filenames & Extracted Metadata */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    
                    {/* File Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isPdf ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      
                      {/* Original filename */}
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500">
                        <span className="font-semibold text-slate-400">#{index + 1}</span>
                        <span className="font-mono text-slate-600 truncate max-w-full">
                          {item.originalName}
                        </span>
                        <span>({(item.originalSize / 1024).toFixed(1)} KB)</span>
                      </div>

                      {/* Renamed target (New Name) */}
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className={`font-mono text-base font-bold tracking-tight break-all ${
                          isSuccess ? 'text-emerald-800' : 'text-slate-800'
                        }`}>
                          {item.newName}
                        </span>
                        {item.manualOverride && (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                            已修正
                          </span>
                        )}
                      </div>

                      {/* Extracted Metadata Pills */}
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap text-xs">
                        {/* ID Badge */}
                        <span className={`px-2 py-0.5 rounded font-semibold border ${
                          item.extractedId 
                            ? 'bg-blue-50 text-blue-900 border-blue-200' 
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          身分證/病歷: {item.extractedId || '待查'}
                        </span>

                        {/* Patient Name Badge */}
                        <span className={`px-2 py-0.5 rounded font-semibold border ${
                          item.extractedName 
                            ? 'bg-blue-50 text-blue-900 border-blue-200' 
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          姓名: {item.extractedName || '待查'}
                        </span>

                        {/* Eye Side */}
                        {item.extractedEye && (
                          <span className="px-2 py-0.5 rounded font-semibold bg-purple-50 text-purple-900 border border-purple-200">
                            眼別: {item.extractedEye === 'OD' ? '右眼(OD)' : item.extractedEye === 'OS' ? '左眼(OS)' : '雙眼(OU)'}
                          </span>
                        )}

                        {/* Failure reason if failed */}
                        {isFailed && (
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            {item.errorMessage || '辨識不完整'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status Pill & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 shrink-0">
                    
                    {/* Status Indicator */}
                    {isSuccess && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>已轉檔</span>
                      </span>
                    )}
                    {isFailed && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-900">
                        <XCircle className="w-3.5 h-3.5 text-rose-700" />
                        <span>失敗</span>
                      </span>
                    )}
                    {isProcessing && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-900 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-blue-700" />
                        <span>處理中</span>
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>待轉檔</span>
                      </span>
                    )}

                    {/* 只有在失敗/未完成狀態 (isFailed) 才顯示「修正」按鈕 */}
                    {isFailed && (
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                        title="手動修正資訊"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-700" />
                        <span>修正</span>
                      </button>
                    )}

                    {/* 只有在失敗/未完成狀態 (isFailed) 且有文字時才顯示「預覽」按鈕 */}
                    {isFailed && item.rawExtractedText && (
                      <button
                        type="button"
                        onClick={() => onPreviewItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
                        title="預覽擷取文字"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>預覽</span>
                      </button>
                    )}

                    {/* Delete / Remove Item */}
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="移除此檔案"
                      aria-label={`移除 ${item.originalName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
