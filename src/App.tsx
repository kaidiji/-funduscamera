import React, { useState, useCallback } from 'react';
import { 
  TabMode, 
  AppState, 
  FileProcessingItem, 
  ProcessingLog 
} from './types';
import { Header } from './components/Header';
import { TabSwitcher } from './components/TabSwitcher';
import { LeftControlPanel } from './components/LeftControlPanel';
import { FileListTable } from './components/FileListTable';
import { LogConsole } from './components/LogConsole';
import { ManualEditModal } from './components/ManualEditModal';
import { PreviewDocModal } from './components/PreviewDocModal';
import { HelpModal } from './components/HelpModal';

import { parsePdfFile, extractInfoFromPdfText } from './utils/pdfParser';
import { processFilenameFile, getFormattedDate } from './utils/filenameParser';
import { generateSampleFundusPdfItems, generateSampleCameraItems } from './utils/sampleData';
import { exportRenamedFilesZip } from './utils/zipExporter';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabMode>('FUNDUS_PDF');
  
  // Processing & State Machine State
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [items, setItems] = useState<FileProcessingItem[]>([]);
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentProcessingName, setCurrentProcessingName] = useState<string>('');

  // Modals
  const [editingItem, setEditingItem] = useState<FileProcessingItem | null>(null);
  const [previewingItem, setPreviewingItem] = useState<FileProcessingItem | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Helper to add logs
  const addLog = useCallback((type: ProcessingLog['type'], message: string, targetFilename?: string, details?: string) => {
    const newLog: ProcessingLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
      type,
      message,
      targetFilename,
      details,
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  // Tab change handler
  const handleTabChange = (newTab: TabMode) => {
    if (appState === 'PROCESSING') return;
    setActiveTab(newTab);
    setItems([]);
    setAppState('IDLE');
    setProgressPercent(0);
    setLogs([]);
    addLog('info', `已切換至「${newTab === 'FUNDUS_PDF' ? '眼底攝影表單 (PDF 內文辨識)' : '非眼底鏡車拍攝 (檔名批次處理)'}」模式`);
  };

  // Uploaded Files Handler
  const handleFilesSelected = (files: File[]) => {
    const newItems: FileProcessingItem[] = files.map((file, idx) => ({
      id: `file-${Date.now()}-${idx}`,
      originalFile: file,
      originalName: file.name,
      originalSize: file.size,
      fileType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      status: 'pending',
      extractedId: null,
      extractedName: null,
      extractedDate: null,
      extractedEye: null,
      newName: file.name,
      errorMessage: null,
      manualOverride: false,
      selectedForExport: true,
    }));

    setItems(newItems);
    setAppState('FILES_SELECTED');
    setProgressPercent(0);
    addLog('info', `已載入 ${newItems.length} 個待處理檔案，請點擊「⚡ 開始轉檔」執行自動辨識。`);
  };

  // Load sample test data for instant evaluation
  const handleLoadSamples = () => {
    const samples = activeTab === 'FUNDUS_PDF' ? generateSampleFundusPdfItems() : generateSampleCameraItems();
    setItems(samples);
    setAppState('FILES_SELECTED');
    setProgressPercent(0);
    addLog('info', `已載入 ${samples.length} 筆真實醫療情境範例檔案，請點擊「⚡ 開始轉檔」。`);
  };

  // ==================== 批次核心轉檔引擎 ====================
  const handleStartProcessing = async () => {
    if (items.length === 0) return;

    setAppState('PROCESSING');
    setProgressPercent(0);
    setLogs([]);
    addLog('info', `=== 開始批次轉檔 ${items.length} 筆檔案 [${activeTab === 'FUNDUS_PDF' ? '邏輯 1：PDF 內文萃取' : '邏輯 2：檔名規則萃取'}] ===`);

    const updatedItems = [...items];
    const total = updatedItems.length;

    for (let i = 0; i < total; i++) {
      const item = { ...updatedItems[i] };
      item.status = 'processing';
      setCurrentProcessingName(item.originalName);
      updatedItems[i] = item;
      setItems([...updatedItems]);

      // Small async delay for visual feedback
      await new Promise(res => setTimeout(res, 200));

      try {
        if (activeTab === 'FUNDUS_PDF') {
          // ==================== 邏輯 1：PDF 內文辨識 (眼底攝影表單) ====================
          // 目標檔名格式：M120047055_廖大渭.pdf 或 M100322762_白進乾.pdf
          let result: {
            id: string | null;
            name: string | null;
            newName: string;
            success: boolean;
            errorReason?: string;
            fullText?: string;
          };

          if (item.originalFile) {
            result = await parsePdfFile(item.originalFile, item.originalName);
            item.rawExtractedText = result.fullText;
          } else if (item.rawExtractedText) {
            const parsed = extractInfoFromPdfText(item.rawExtractedText, item.originalName);
            result = {
              id: parsed.id,
              name: parsed.name,
              newName: parsed.newName,
              success: parsed.success,
              errorReason: parsed.errorMessage,
              fullText: item.rawExtractedText,
            };
          } else {
            result = {
              id: null,
              name: null,
              newName: item.originalName,
              success: false,
              errorReason: '無法辨識 (身分證: None, 姓名: None)',
            };
          }

          item.extractedId = result.id;
          item.extractedName = result.name;

          if (result.success) {
            item.newName = result.newName;
            item.status = 'success';
            item.errorMessage = null;

            // 🟢 [成功] -> 新檔名: M100322762_白進乾.pdf
            addLog(
              'success',
              `辨識完成 [${item.originalName}] (身分證: ${result.id}, 姓名: ${result.name})`,
              result.newName
            );
          } else {
            item.status = 'failed';
            item.errorMessage = result.errorReason || `無法辨識 (身分證:${result.id || 'None'}, 姓名:${result.name || 'None'})`;
            item.newName = item.originalName;

            // 🔴 [失敗] -> 無法辨識 (身分證: None, 姓名: 王小明)
            addLog(
              'error',
              `[${item.originalName}] ${item.errorMessage}`,
              undefined,
              '提示：請點擊右側「修正」按鈕手動補填身分證與姓名'
            );
          }

        } else {
          // ==================== 邏輯 2：非眼底鏡車拍攝 (檔名解析) ====================
          // 目標檔名格式：Y0年年月月日日01_姓名_OD/OS.pdf (日期嚴格採用點擊轉檔當天)
          const todayDateStr = getFormattedDate(new Date());
          const serialNum = i + 1;
          item.serialNumber = serialNum;
          const result = processFilenameFile(item.originalName, todayDateStr, serialNum);

          item.extractedName = result.name;
          item.extractedEye = result.eye;
          item.extractedDate = result.dateStr;

          if (result.success) {
            item.newName = result.newName;
            item.status = 'success';
            item.errorMessage = null;

            // 🟢 [成功] -> 新檔名: Y026091001_古建雄_OD.pdf
            addLog(
              'success',
              `解析完成 [${item.originalName}] (姓名: ${result.name}, 眼別: ${result.eye}, 序號: ${serialNum})`,
              result.newName
            );
          } else {
            item.status = 'failed';
            item.errorMessage = result.errorReason || `格式不符 (姓名:${result.name || 'None'}, 眼別:${result.eye || 'None'})`;
            item.newName = result.newName;

            // 🔴 [失敗] -> 格式不符 (姓名: 古建雄, 眼別: None)
            addLog(
              'error',
              `[${item.originalName}] ${item.errorMessage}`,
              undefined,
              '提示：請點擊右側「修正」按鈕指定眼別 (OD / OS)'
            );
          }
        }
      } catch (err) {
        item.status = 'failed';
        item.errorMessage = err instanceof Error ? err.message : '解析過程發生例外錯誤';
        addLog('error', `[${item.originalName}] 處理失敗：${item.errorMessage}`);
      }

      updatedItems[i] = item;
      setItems([...updatedItems]);
      setProgressPercent(Math.round(((i + 1) / total) * 100));
    }

    setAppState('COMPLETED');
    setCurrentProcessingName('');
    const successTotal = updatedItems.filter(i => i.status === 'success').length;
    const failedTotal = updatedItems.filter(i => i.status === 'failed').length;
    addLog('info', `=== 轉檔完畢！成功 ${successTotal} 筆，待補填 ${failedTotal} 筆 ===`);
  };

  // Reset/Clear
  const handleReset = () => {
    setItems([]);
    setAppState('IDLE');
    setProgressPercent(0);
    setLogs([]);
    addLog('info', '已清空檔案清單與主控台記錄。');
  };

  // Save manual edit
  const handleSaveManualEdit = (updatedItem: FileProcessingItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    
    if (updatedItem.status === 'success') {
      addLog(
        'success',
        `手動修正完成 [${updatedItem.originalName}] ➔ ${updatedItem.newName}`,
        updatedItem.newName
      );
    } else {
      addLog('warning', `手動更新 [${updatedItem.originalName}]，仍有待補齊資訊。`);
    }
  };

  // Delete single item
  const handleDeleteItem = (id: string) => {
    const target = items.find(i => i.id === id);
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      if (next.length === 0) setAppState('IDLE');
      return next;
    });
    if (target) {
      addLog('info', `已移除檔案：${target.originalName}`);
    }
  };

  // Export ZIP
  const handleDownloadZip = async () => {
    await exportRenamedFilesZip(items);
    addLog('success', `已成功打包下載 ZIP 檔案 (包含已改名檔案與稽核清冊 CSV)！`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-blue-200">
      
      {/* 1. Header Area */}
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col gap-5">
        
        {/* Top: Mode Switcher */}
        <section aria-label="功能選擇頁籤">
          <TabSwitcher
            activeTab={activeTab}
            onSelectTab={handleTabChange}
            disabled={appState === 'PROCESSING'}
          />
        </section>

        {/* 2-Column Clean Layout: Left (Upload + Single Convert Button) / Right (Converted List) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Upload Files + Single Convert Action Button */}
          <div className="lg:col-span-5">
            <LeftControlPanel
              activeTab={activeTab}
              appState={appState}
              items={items}
              progressPercent={progressPercent}
              currentProcessingName={currentProcessingName}
              onFilesSelected={handleFilesSelected}
              onStartProcessing={handleStartProcessing}
              onDownloadZip={handleDownloadZip}
              onReset={handleReset}
            />
          </div>

          {/* Right Column: Successfully Converted Files List / Pending Files List */}
          <div className="lg:col-span-7">
            <FileListTable
              appState={appState}
              items={items}
              onEditItem={(item) => setEditingItem(item)}
              onPreviewItem={(item) => setPreviewingItem(item)}
              onDeleteItem={handleDeleteItem}
              onStartProcessing={handleStartProcessing}
            />
          </div>

        </div>

        {/* Bottom Section: Processing Log Console */}
        <section aria-label="處理主控台" className="w-full">
          <LogConsole
            logs={logs}
            onClearLogs={() => setLogs([])}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 text-center text-slate-600 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">醫療影像與表單檔名自動處理系統</span>
            <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">醫事版</span>
          </div>
          <p className="text-slate-500 text-xs">
            全本機端隱私運算（個資零上傳）・支援眼底攝影 PDF 內文萃取與相機影像批次改名
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ManualEditModal
        item={editingItem}
        isOpen={Boolean(editingItem)}
        activeTab={activeTab}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveManualEdit}
      />

      <PreviewDocModal
        item={previewingItem}
        isOpen={Boolean(previewingItem)}
        onClose={() => setPreviewingItem(null)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

    </div>
  );
}
