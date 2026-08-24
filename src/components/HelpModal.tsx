import React from 'react';
import { X, ShieldCheck, CheckCircle2, FileText, Camera, Download, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl">
                使用說明與作業規範
              </h3>
              <p className="text-slate-600 text-sm">
                醫療影像與表單檔名批次處理系統作業手冊
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

        {/* Scrollable Content */}
        <div className="mt-4 flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 text-slate-700">
          
          {/* Privacy & Compliance Section */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300">
            <div className="flex items-center gap-2 font-bold text-emerald-950 text-base mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>本機安全隱私保證 (符合資安與個人資料保護法)</span>
            </div>
            <p className="text-sm text-emerald-900 leading-relaxed">
              本工具所有辨識與批次改名運算均在您當前的瀏覽器本機端執行，表單內容與病患機敏資料絕不上傳至任何外部伺服器，請安心處理臨床檢驗單與影像。
            </p>
          </div>

          {/* Naming Rules Summary */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2.5">
            <h4 className="font-bold text-blue-950 text-base">
              核心轉檔規則規範
            </h4>
            <div className="text-sm text-blue-900 space-y-1.5 font-mono">
              <div>
                <span className="font-bold text-blue-950">1. 眼底攝影表單 (PDF 內文)：</span>
                <br />
                格式：<span className="bg-blue-100 px-1.5 py-0.5 rounded font-bold text-blue-950">[身分證字號]_[病患姓名].pdf</span>
                <br />
                範例：<span className="text-slate-700 font-bold">M100322762_白進乾.pdf</span> 或 <span className="text-slate-700 font-bold">M120047055_廖大渭.pdf</span>
              </div>
              <div className="pt-1 border-t border-blue-200">
                <span className="font-bold text-blue-950">2. 非眼底鏡車拍攝 (檔名解析)：</span>
                <br />
                格式：<span className="bg-blue-100 px-1.5 py-0.5 rounded font-bold text-blue-950">_[病患姓名]_[眼別]_[日期].[副檔名]</span>
                <br />
                範例：<span className="text-slate-700 font-bold">_古建雄_OD_20260824.pdf</span> 或 <span className="text-slate-700 font-bold">_陳大文_OS_20260824.jpg</span>
              </div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-700" />
              <span>標準作業流程 (3 步驟)：</span>
            </h4>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 text-base">步驟 1：選擇功能頁籤與上傳檔案</p>
              <ul className="list-disc list-inside text-sm text-slate-600 mt-1 space-y-1">
                <li><strong className="text-blue-900">眼底攝影表單 (PDF 內文辨識)：</strong>上傳巡迴車或診所眼底檢查單 PDF 檔，系統自動掃描內文識別身分證與姓名。</li>
                <li><strong className="text-blue-900">非眼底鏡車拍攝 (檔名批次處理)：</strong>上傳拍攝影像圖檔 (JPG/PNG/PDF)，系統自動自檔名解析姓名、眼別 (OD/OS) 與日期。</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 text-base">步驟 2：點擊「⚡ 開始轉檔」</p>
              <p className="text-sm text-slate-600 mt-1">
                系統將即時在主控台輸出結果：
                <br /><span className="text-emerald-700 font-mono font-bold">🟢 [成功] -&gt; 新檔名: M100322762_白進乾.pdf</span>
                <br /><span className="text-rose-700 font-mono font-bold">🔴 [失敗] -&gt; 無法辨識 (身分證: None, 姓名: 白進乾)</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900 text-base">步驟 3：複核與打包下載</p>
              <p className="text-sm text-slate-600 mt-1">
                辨識失敗或需微調之項目可點擊清單中的「修正」手動補填。完成後點擊綠色「📥 下載已改名打包檔 (.zip)」即可一鍵取得整理完成之檔案與 CSV 稽核清冊。
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-touch-target px-6 py-2.5 rounded-xl font-bold text-white bg-blue-700 hover:bg-blue-800 text-base"
            style={{ backgroundColor: '#1565C0' }}
          >
            了解，開始使用
          </button>
        </div>

      </div>
    </div>
  );
};
