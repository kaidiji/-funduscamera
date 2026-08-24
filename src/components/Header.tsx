import React from 'react';
import { Stethoscope, ShieldCheck, HelpCircle, Sliders } from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onOpenSettings,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Title & Subtitle Area */}
          <div className="flex items-center space-x-3.5">
            <div 
              id="header-icon-box"
              className="w-11 h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm flex-shrink-0"
              style={{ backgroundColor: '#1565C0' }}
            >
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 
                  id="main-app-title"
                  className="font-bold text-slate-900 tracking-tight leading-tight text-xl sm:text-2xl"
                >
                  醫療影像與表單檔名自動處理系統
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  本機安全處理・無個資外洩
                </span>
              </div>
              <p 
                id="main-app-subtitle"
                className="text-slate-600 font-medium text-sm sm:text-base"
              >
                眼底攝影 PDF 內文自動提取與相機影像檔名批次標準化
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-2.5 self-end md:self-auto">
            {/* Naming Rules Settings */}
            <button
              id="open-settings-btn"
              onClick={onOpenSettings}
              className="min-touch-target flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-sm sm:text-base transition-colors shadow-sm"
              title="檔名格式設定"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>規則設定</span>
            </button>

            {/* Help / Guide */}
            <button
              id="open-help-guide-btn"
              onClick={onOpenHelp}
              className="min-touch-target flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 font-bold text-sm sm:text-base transition-colors"
              title="使用教學與規範"
            >
              <HelpCircle className="w-4 h-4 text-blue-700" />
              <span>使用說明</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

