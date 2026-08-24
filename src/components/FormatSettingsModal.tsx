import React, { useState } from 'react';
import { X, Sliders, Check, Sparkles } from 'lucide-react';
import { NamingTemplateConfig } from '../types';

interface FormatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NamingTemplateConfig;
  onSaveConfig: (newConfig: NamingTemplateConfig) => void;
}

export const FormatSettingsModal: React.FC<FormatSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [format, setFormat] = useState<NamingTemplateConfig['format']>(config.format);
  const [customPattern, setCustomPattern] = useState(config.customPattern);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      ...config,
      format,
      customPattern,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl">
                自訂檔名格式規範
              </h3>
              <p className="text-slate-600 text-sm">
                依據院所或系統需求調整標準化產出格式
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

        {/* Options */}
        <div className="mt-5 space-y-3">
          
          {/* Format 1: Default ID_NAME */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            format === 'ID_NAME' ? 'border-blue-600 bg-blue-50/70' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <input
              type="radio"
              name="format"
              checked={format === 'ID_NAME'}
              onChange={() => setFormat('ID_NAME')}
              className="mt-1 w-5 h-5 text-blue-700 focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-base">身分證_姓名 (預設標準規格)</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">推薦</span>
              </div>
              <p className="font-mono text-sm text-slate-600 mt-1 font-semibold">
                範例：<span className="text-blue-900">1234567890_王小明.pdf</span>
              </p>
            </div>
          </label>

          {/* Format 2: ID_NAME_EYE */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            format === 'ID_NAME_EYE' ? 'border-blue-600 bg-blue-50/70' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <input
              type="radio"
              name="format"
              checked={format === 'ID_NAME_EYE'}
              onChange={() => setFormat('ID_NAME_EYE')}
              className="mt-1 w-5 h-5 text-blue-700 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">身分證_姓名_眼別 (眼科專用)</span>
              <p className="font-mono text-sm text-slate-600 mt-1 font-semibold">
                範例：<span className="text-blue-900">1234567890_王小明_OD.jpg</span>
              </p>
            </div>
          </label>

          {/* Format 3: DATE_ID_NAME */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            format === 'DATE_ID_NAME' ? 'border-blue-600 bg-blue-50/70' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <input
              type="radio"
              name="format"
              checked={format === 'DATE_ID_NAME'}
              onChange={() => setFormat('DATE_ID_NAME')}
              className="mt-1 w-5 h-5 text-blue-700 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">日期_身分證_姓名 (按日期歸檔)</span>
              <p className="font-mono text-sm text-slate-600 mt-1 font-semibold">
                範例：<span className="text-blue-900">20240518_1234567890_王小明.pdf</span>
              </p>
            </div>
          </label>

          {/* Format 4: ID_NAME_DATE */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            format === 'ID_NAME_DATE' ? 'border-blue-600 bg-blue-50/70' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <input
              type="radio"
              name="format"
              checked={format === 'ID_NAME_DATE'}
              onChange={() => setFormat('ID_NAME_DATE')}
              className="mt-1 w-5 h-5 text-blue-700 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">身分證_姓名_日期</span>
              <p className="font-mono text-sm text-slate-600 mt-1 font-semibold">
                範例：<span className="text-blue-900">1234567890_王小明_20240518.pdf</span>
              </p>
            </div>
          </label>

          {/* Custom Template */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            format === 'CUSTOM' ? 'border-blue-600 bg-blue-50/70' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <input
              type="radio"
              name="format"
              checked={format === 'CUSTOM'}
              onChange={() => setFormat('CUSTOM')}
              className="mt-1 w-5 h-5 text-blue-700 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">自訂標籤組合</span>
              {format === 'CUSTOM' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customPattern}
                    onChange={(e) => setCustomPattern(e.target.value)}
                    placeholder="{id}_{name}_{date}"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm bg-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    可用變數：<code className="text-blue-700 font-bold">{'{id}'}</code>, <code className="text-blue-700 font-bold">{'{name}'}</code>, <code className="text-blue-700 font-bold">{'{eye}'}</code>, <code className="text-blue-700 font-bold">{'{date}'}</code>
                  </p>
                </div>
              )}
            </div>
          </label>

        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="min-touch-target px-5 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 text-base"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="min-touch-target flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 text-lg shadow-md"
            style={{ backgroundColor: '#1565C0' }}
          >
            <Check className="w-5 h-5" />
            <span>套用設定</span>
          </button>
        </div>

      </div>
    </div>
  );
};
