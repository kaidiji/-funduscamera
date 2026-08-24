import React from 'react';
import { Play, Loader2, RotateCcw, CheckCircle, AlertTriangle, FileStack, RefreshCw } from 'lucide-react';
import { AppState } from '../types';

interface ActionPanelProps {
  appState: AppState;
  filesCount: number;
  successCount: number;
  failedCount: number;
  progressPercent: number;
  currentProcessingName?: string;
  onStartProcessing: () => void;
  onReset: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  appState,
  filesCount,
  successCount,
  failedCount,
  progressPercent,
  currentProcessingName,
  onStartProcessing,
  onReset,
}) => {
  const isIdle = appState === 'IDLE';
  const isProcessing = appState === 'PROCESSING';
  const isCompleted = appState === 'COMPLETED';
  const hasFiles = filesCount > 0;

  return (
    <div className="w-full bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
      
      {/* Top Status & Counters Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <FileStack className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
              檔案處理狀態與控制
            </h3>
            <p className="text-slate-600 text-sm sm:text-base">
              {isIdle && '請先選取或拖曳檔案至上方區域'}
              {appState === 'FILES_SELECTED' && `檔案已就緒，共 ${filesCount} 個待處理檔案`}
              {isProcessing && `正在解析中... (${progressPercent}%)`}
              {isCompleted && `解析完成！成功 ${successCount} 件 / 失敗待查 ${failedCount} 件`}
            </p>
          </div>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div 
            id="badge-total-files"
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 font-bold text-base flex items-center gap-1.5"
          >
            <span>總數:</span>
            <span className="text-blue-800 text-lg">{filesCount}</span>
          </div>

          <div 
            id="badge-success-files"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-base flex items-center gap-1.5"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>成功:</span>
            <span className="text-emerald-700 text-lg">{successCount}</span>
          </div>

          <div 
            id="badge-failed-files"
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 font-bold text-base flex items-center gap-1.5"
          >
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>失敗:</span>
            <span className="text-rose-700 text-lg">{failedCount}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar (Visible during processing and completed) */}
      {(isProcessing || isCompleted) && (
        <div className="mt-4 mb-4">
          <div className="flex justify-between items-center text-sm sm:text-base font-semibold text-slate-700 mb-1.5">
            <span className="flex items-center gap-2">
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-blue-700" />}
              {isProcessing ? `處理進度：${currentProcessingName || '解析資料中...'}` : '✅ 批次解析已全部執行完成'}
            </span>
            <span className="font-mono text-blue-900 text-lg font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isCompleted ? 'bg-emerald-600' : 'bg-blue-700'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons Section */}
      <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
        
        {/* Main Action Button (Min height 56px, high contrast >= 7:1) */}
        {!isCompleted ? (
          <button
            id="start-process-button"
            type="button"
            disabled={!hasFiles || isProcessing}
            onClick={onStartProcessing}
            className={`min-touch-target flex-1 flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold text-xl sm:text-2xl text-white shadow-md transition-all duration-200 ${
              !hasFiles || isProcessing
                ? 'opacity-50 cursor-not-allowed bg-slate-400'
                : 'hover:brightness-110 active:scale-[0.99] cursor-pointer'
            }`}
            style={{
              minHeight: '56px',
              backgroundColor: !hasFiles || isProcessing ? '#94A3B8' : '#1565C0', // #1565C0 high contrast primary
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                <span>正在自動辨識與改名中...</span>
              </>
            ) : (
              <>
                <Play className="w-7 h-7 fill-white" />
                <span>🚀 開始自動解析與改名</span>
              </>
            )}
          </button>
        ) : (
          <button
            id="reprocess-button"
            type="button"
            onClick={onStartProcessing}
            className="min-touch-target flex-1 flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold text-xl text-white shadow-md hover:brightness-110 transition-all cursor-pointer"
            style={{
              minHeight: '56px',
              backgroundColor: '#1565C0',
            }}
          >
            <RefreshCw className="w-6 h-6" />
            <span>🔄 重新執行解析</span>
          </button>
        )}

        {/* Reset / Clear Button */}
        {hasFiles && !isProcessing && (
          <button
            id="reset-files-button"
            type="button"
            onClick={onReset}
            className="min-touch-target flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-lg transition-colors"
            style={{ minHeight: '56px' }}
            title="清空目前清單並重新選擇檔案"
          >
            <RotateCcw className="w-5 h-5 text-slate-600" />
            <span>清空重置</span>
          </button>
        )}

      </div>
    </div>
  );
};
