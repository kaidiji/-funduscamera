import React, { useState, useEffect } from 'react';
import { X, Check, Edit3, ArrowRight } from 'lucide-react';
import { FileProcessingItem, EyeSide, TabMode } from '../types';
import { getFormattedDate } from '../utils/filenameParser';

interface ManualEditModalProps {
  item: FileProcessingItem | null;
  isOpen: boolean;
  activeTab: TabMode;
  onClose: () => void;
  onSave: (updatedItem: FileProcessingItem) => void;
}

export const ManualEditModal: React.FC<ManualEditModalProps> = ({
  item,
  isOpen,
  activeTab,
  onClose,
  onSave,
}) => {
  const [idValue, setIdValue] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [eyeValue, setEyeValue] = useState<EyeSide>(null);
  const [dateValue, setDateValue] = useState('');
  const [previewFilename, setPreviewFilename] = useState('');

  useEffect(() => {
    if (item) {
      setIdValue(item.extractedId || '');
      setNameValue(item.extractedName || '');
      setEyeValue(item.extractedEye || null);
      setDateValue(item.extractedDate || getFormattedDate());
    }
  }, [item]);

  // Live recalculate preview filename according to the active tab logic (一律輸出為 .pdf)
  useEffect(() => {
    if (!item) return;

    if (activeTab === 'FUNDUS_PDF') {
      const cleanId = idValue.trim();
      const cleanName = nameValue.trim();
      if (cleanId && cleanName) {
        setPreviewFilename(`${cleanId}_${cleanName}.pdf`);
      } else {
        setPreviewFilename(cleanId ? `${cleanId}_[請填寫姓名].pdf` : `[請填寫身分證]_${cleanName || '未命名'}.pdf`);
      }
    } else {
      // 邏輯 2：_姓名_眼別_日期.pdf (一律輸出為 .pdf)
      const cleanName = nameValue.trim();
      const cleanEye = eyeValue || 'OD';
      const cleanDate = dateValue.trim() || getFormattedDate();
      if (cleanName && eyeValue) {
        setPreviewFilename(`_${cleanName}_${cleanEye}_${cleanDate}.pdf`);
      } else {
        setPreviewFilename(`_${cleanName || '[請填寫姓名]'}_${eyeValue || '[請選眼別]'}_${cleanDate}.pdf`);
      }
    }
  }, [idValue, nameValue, eyeValue, dateValue, item, activeTab]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    let isSuccess = false;
    let finalNewName = previewFilename;
    let errorReason: string | null = null;

    if (activeTab === 'FUNDUS_PDF') {
      const cleanId = idValue.trim();
      const cleanName = nameValue.trim();
      if (cleanId && cleanName) {
        isSuccess = true;
        finalNewName = `${cleanId}_${cleanName}.pdf`;
      } else {
        isSuccess = false;
        errorReason = `無法辨識 (身分證:${cleanId || 'None'}, 姓名:${cleanName || 'None'})`;
        finalNewName = item.originalName.toLowerCase().endsWith('.pdf') ? item.originalName : `${item.originalName.replace(/\.[^/.]+$/, '')}.pdf`;
      }
    } else {
      const cleanName = nameValue.trim();
      const cleanEye = eyeValue;
      const cleanDate = dateValue.trim() || getFormattedDate();
      if (cleanName && cleanEye) {
        isSuccess = true;
        finalNewName = `_${cleanName}_${cleanEye}_${cleanDate}.pdf`;
      } else {
        isSuccess = false;
        errorReason = `格式不符 (姓名:${cleanName || 'None'}, 眼別:${cleanEye || 'None'})`;
        finalNewName = item.originalName.toLowerCase().endsWith('.pdf') ? item.originalName : `${item.originalName.replace(/\.[^/.]+$/, '')}.pdf`;
      }
    }

    const updated: FileProcessingItem = {
      ...item,
      extractedId: idValue.trim() || null,
      extractedName: nameValue.trim() || null,
      extractedEye: eyeValue,
      extractedDate: dateValue.trim() || null,
      newName: finalNewName,
      status: isSuccess ? 'success' : 'failed',
      errorMessage: errorReason,
      manualOverride: true,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                手動修正 / 補填資訊
              </h3>
              <p className="text-slate-500 text-xs truncate max-w-xs">
                原檔名: {item.originalName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="mt-4 p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
          <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
            預計改名後新檔名 (輸出為 PDF)
          </span>
          <div className="flex items-center gap-2 font-mono text-sm sm:text-base font-bold text-blue-900 break-all">
            <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{previewFilename}</span>
          </div>
        </div>

        {/* Fields */}
        <div className="mt-5 space-y-4">
          {/* Patient ID */}
          {activeTab === 'FUNDUS_PDF' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                身分證字號 / 病歷號 (必要) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={idValue}
                onChange={(e) => setIdValue(e.target.value.toUpperCase())}
                placeholder="例如：M120047055"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              />
            </div>
          )}

          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              受檢者 / 病患姓名 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder="例如：廖大渭 或 古建雄"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Eye Side (Only for Tab 2 or if needed) */}
          {activeTab === 'CAMERA_BATCH' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                檢查眼別 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEyeValue('OD')}
                  className={`py-2 px-3 rounded-xl border text-sm font-bold transition-all ${
                    eyeValue === 'OD'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  右眼 (OD)
                </button>
                <button
                  type="button"
                  onClick={() => setEyeValue('OS')}
                  className={`py-2 px-3 rounded-xl border text-sm font-bold transition-all ${
                    eyeValue === 'OS'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  左眼 (OS)
                </button>
                <button
                  type="button"
                  onClick={() => setEyeValue('OU')}
                  className={`py-2 px-3 rounded-xl border text-sm font-bold transition-all ${
                    eyeValue === 'OU'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  雙眼 (OU)
                </button>
              </div>
            </div>
          )}

          {/* Date (for Camera Batch) */}
          {activeTab === 'CAMERA_BATCH' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                轉檔日期 (YYYYMMDD)
              </label>
              <input
                type="text"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                placeholder="例如：20260824"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition-colors"
            style={{ backgroundColor: '#1565C0' }}
          >
            <Check className="w-4 h-4" />
            <span>儲存並改名</span>
          </button>
        </div>

      </div>
    </div>
  );
};
