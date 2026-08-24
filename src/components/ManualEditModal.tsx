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

  const ext = item?.originalName.includes('.') 
    ? item.originalName.slice(item.originalName.lastIndexOf('.')) 
    : (activeTab === 'FUNDUS_PDF' ? '.pdf' : '');

  useEffect(() => {
    if (item) {
      setIdValue(item.extractedId || '');
      setNameValue(item.extractedName || '');
      setEyeValue(item.extractedEye || null);
      setDateValue(item.extractedDate || getFormattedDate());
    }
  }, [item]);

  // Live recalculate preview filename according to the active tab logic
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
      // 邏輯 2：_姓名_眼別_日期.副檔名 (例: _古建雄_OD_20260824.pdf)
      const cleanName = nameValue.trim();
      const cleanEye = eyeValue || 'OD';
      const cleanDate = dateValue.trim() || getFormattedDate();
      if (cleanName && eyeValue) {
        setPreviewFilename(`_${cleanName}_${cleanEye}_${cleanDate}${ext}`);
      } else {
        setPreviewFilename(`_${cleanName || '[請填寫姓名]'}_${eyeValue || '[請選眼別]'}_${cleanDate}${ext}`);
      }
    }
  }, [idValue, nameValue, eyeValue, dateValue, item, activeTab, ext]);

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
        finalNewName = item.originalName;
      }
    } else {
      const cleanName = nameValue.trim();
      const cleanEye = eyeValue;
      const cleanDate = dateValue.trim() || getFormattedDate();
      if (cleanName && cleanEye) {
        isSuccess = true;
        finalNewName = `_${cleanName}_${cleanEye}_${cleanDate}${ext}`;
      } else {
        isSuccess = false;
        errorReason = `格式不符 (姓名:${cleanName || 'None'}, 眼別:${cleanEye || 'None'})`;
        finalNewName = item.originalName;
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
                手動修正轉檔資料
              </h3>
              <p className="text-slate-500 text-xs font-mono truncate max-w-[280px]">
                {item.originalName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="mt-4 space-y-3.5">
          
          {/* Patient Name */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">
              病患 / 受檢者姓名 <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              placeholder="例：廖大渭 或 古建雄"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-base font-bold focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          {/* ID Input (Shown for PDF mode) */}
          {activeTab === 'FUNDUS_PDF' && (
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                身分證字號 <span className="text-rose-600">* (例: M120047055)</span>
              </label>
              <input
                type="text"
                value={idValue}
                onChange={(e) => setIdValue(e.target.value.toUpperCase())}
                placeholder="例：M120047055"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-base font-mono tracking-wider focus:outline-none bg-slate-50 focus:bg-white"
              />
            </div>
          )}

          {/* Eye Side & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                眼別 {activeTab === 'CAMERA_NAME' && <span className="text-rose-600">*</span>}
              </label>
              <select
                value={eyeValue || ''}
                onChange={(e) => setEyeValue((e.target.value || null) as EyeSide)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm font-bold focus:outline-none bg-white"
              >
                <option value="">請選擇眼別</option>
                <option value="OD">右眼 (OD)</option>
                <option value="OS">左眼 (OS)</option>
                <option value="OU">雙眼 (OU)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                日期 (YYYYMMDD)
              </label>
              <input
                type="text"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                placeholder="例：20260824"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-sm font-mono focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* New Filename Live Preview Box */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
            <div className="text-xs font-bold text-blue-900 flex items-center gap-1 mb-1">
              <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
              <span>
                產生目標檔名：
              </span>
            </div>
            <p className="font-mono text-base font-bold text-blue-950 break-all">
              {previewFilename}
            </p>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 text-sm transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 text-sm shadow-md transition-colors"
            style={{ backgroundColor: '#1565C0' }}
          >
            <Check className="w-4 h-4" />
            <span>儲存並更新</span>
          </button>
        </div>

      </div>
    </div>
  );
};
