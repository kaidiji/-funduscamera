import React from 'react';
import { FileText, Camera, CheckCircle2 } from 'lucide-react';
import { TabMode } from '../types';

interface TabSwitcherProps {
  activeTab: TabMode;
  onSelectTab: (tab: TabMode) => void;
  disabled?: boolean;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({
  activeTab,
  onSelectTab,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      <div 
        id="main-tab-switcher"
        className="bg-slate-200/90 p-1.5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-2 shadow-inner border border-slate-300"
        role="tablist"
      >
        {/* Tab 1 */}
        <button
          id="tab-fundus-pdf"
          role="tab"
          aria-selected={activeTab === 'FUNDUS_PDF'}
          disabled={disabled}
          onClick={() => onSelectTab('FUNDUS_PDF')}
          className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold transition-all duration-200 text-lg sm:text-xl min-h-[52px] ${
            activeTab === 'FUNDUS_PDF'
              ? 'text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-300/70 hover:text-slate-900'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            backgroundColor: activeTab === 'FUNDUS_PDF' ? '#1565C0' : 'transparent',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="eye">👁️</span>
            <FileText className="w-6 h-6 shrink-0" />
            <span className="tracking-wide">眼底攝影表單 (PDF 內文辨識)</span>
          </div>
          {activeTab === 'FUNDUS_PDF' && (
            <CheckCircle2 className="w-5 h-5 ml-1 shrink-0 text-blue-200" />
          )}
        </button>

        {/* Tab 2 */}
        <button
          id="tab-other-camera"
          role="tab"
          aria-selected={activeTab === 'OTHER_CAMERA'}
          disabled={disabled}
          onClick={() => onSelectTab('OTHER_CAMERA')}
          className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-bold transition-all duration-200 text-lg sm:text-xl min-h-[52px] ${
            activeTab === 'OTHER_CAMERA'
              ? 'text-white shadow-md'
              : 'text-slate-700 hover:bg-slate-300/70 hover:text-slate-900'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            backgroundColor: activeTab === 'OTHER_CAMERA' ? '#1565C0' : 'transparent',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="camera">📷</span>
            <Camera className="w-6 h-6 shrink-0" />
            <span className="tracking-wide">非眼底鏡車拍攝 (檔名批次處理)</span>
          </div>
          {activeTab === 'OTHER_CAMERA' && (
            <CheckCircle2 className="w-5 h-5 ml-1 shrink-0 text-blue-200" />
          )}
        </button>
      </div>

      {/* Tab description hint banner */}
      <div className="mt-2.5 px-3 text-slate-600 flex items-center justify-between text-sm sm:text-base">
        {activeTab === 'FUNDUS_PDF' ? (
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>解析 PDF 內文自動提取「身分證字號 / 病歷號」與「病患姓名」，並自動產出標準化檔名</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>解析現有影像/表單檔案檔名中包含的病患姓名與身分證號，進行批次重構與標準化</span>
          </div>
        )}
      </div>
    </div>
  );
};
