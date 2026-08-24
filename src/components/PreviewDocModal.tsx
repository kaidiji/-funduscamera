import React from 'react';
import { X, FileText, User, CreditCard, Calendar, Eye } from 'lucide-react';
import { FileProcessingItem } from '../types';

interface PreviewDocModalProps {
  item: FileProcessingItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewDocModal: React.FC<PreviewDocModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl">
                醫療表單解析內容預覽
              </h3>
              <p className="text-slate-600 text-sm font-mono truncate max-w-md">
                檔案：{item.originalName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Extracted Key Info Cards */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-1 text-xs font-bold text-blue-800 mb-1">
              <CreditCard className="w-3.5 h-3.5" />
              <span>身分證/病歷號</span>
            </div>
            <p className="font-mono text-base font-bold text-blue-950">
              {item.extractedId || '未辨識'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-1 text-xs font-bold text-blue-800 mb-1">
              <User className="w-3.5 h-3.5" />
              <span>病患姓名</span>
            </div>
            <p className="font-bold text-base text-blue-950">
              {item.extractedName || '未辨識'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
            <div className="flex items-center gap-1 text-xs font-bold text-purple-800 mb-1">
              <Eye className="w-3.5 h-3.5" />
              <span>檢查眼別</span>
            </div>
            <p className="font-bold text-base text-purple-950">
              {item.extractedEye ? (item.extractedEye === 'OD' ? '右眼 OD' : item.extractedEye === 'OS' ? '左眼 OS' : '雙眼 OU') : '無標記'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-600 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>檢查日期</span>
            </div>
            <p className="font-mono text-base font-bold text-slate-800">
              {item.extractedDate || '無'}
            </p>
          </div>

        </div>

        {/* Full Text Content Area */}
        <div className="mt-4 flex-1 overflow-y-auto custom-scrollbar p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            表單內文原始文字層 (Extracted Raw Text)
          </h4>
          <pre className="font-mono text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {item.rawExtractedText || '（無純文字層或為純影像檔案）'}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-touch-target px-6 py-2.5 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 text-base"
            style={{ backgroundColor: '#1565C0' }}
          >
            關閉預覽
          </button>
        </div>

      </div>
    </div>
  );
};
