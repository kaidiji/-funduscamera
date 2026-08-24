import JSZip from 'jszip';
import { FileProcessingItem } from '../types';

/**
 * Creates and triggers download of a ZIP file containing all renamed items
 */
export async function exportRenamedFilesZip(
  items: FileProcessingItem[],
  zipFilename = `醫療影像與表單改名打包_${new Date().toISOString().slice(0, 10)}.zip`
): Promise<{ success: boolean; totalExported: number }> {
  const zip = new JSZip();
  const successfulItems = items.filter(item => item.status === 'success' && item.selectedForExport !== false);

  if (successfulItems.length === 0) {
    throw new Error('目前沒有可供打包下載的成功改名檔案');
  }

  // 1. Add renamed files to zip
  for (const item of successfulItems) {
    const filename = item.newName || `${item.extractedId || '未知'}_${item.extractedName || '病患'}.${item.fileType.split('/')[1] || 'pdf'}`;
    
    if (item.originalFile) {
      // Real uploaded file
      zip.file(filename, item.originalFile);
    } else {
      // Sample / generated file: generate lightweight valid payload or report text
      const content = item.rawExtractedText
        ? `【醫療影像與表單處理系統 - 已改名檔案】\n新檔名: ${filename}\n原檔名: ${item.originalName}\n身分證字號: ${item.extractedId || '無'}\n受檢者姓名: ${item.extractedName || '無'}\n檢查日期: ${item.extractedDate || '無'}\n檢查眼別: ${item.extractedEye || '無'}\n處理時間: ${new Date().toLocaleString('zh-TW')}\n\n=== 原始表單內文摘要 ===\n${item.rawExtractedText}`
        : `Medical Image / Form Data File: ${filename}\nOriginal: ${item.originalName}\nRenamed at: ${new Date().toISOString()}`;
      
      zip.file(filename, content);
    }
  }

  // 2. Generate Audit Report CSV for Hospital Medical Records compliance
  const csvHeaders = ['序號', '原始檔名', '新檔名', '身分證字號/病歷號', '病患姓名', '檢查眼別', '檢查日期', '處理狀態', '處理備註'];
  const csvRows = items.map((item, idx) => [
    idx + 1,
    `"${item.originalName.replace(/"/g, '""')}"`,
    `"${item.newName.replace(/"/g, '""')}"`,
    `"${item.extractedId || '無法辨識'}"`,
    `"${item.extractedName || '無法辨識'}"`,
    `"${item.extractedEye || '無'}"`,
    `"${item.extractedDate || '無'}"`,
    item.status === 'success' ? '成功' : '失敗',
    `"${(item.errorMessage || '正常處理完成').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\r\n');
  zip.file('📋_醫療表單改名稽核清單_Audit_Report.csv', csvContent);

  // 3. Generate README / Instructions in ZIP
  const readmeContent = `================================================
醫療影像與表單檔名自動處理系統 - 批次處理報告
處理時間：${new Date().toLocaleString('zh-TW')}
總計處理檔案數：${items.length} 筆
成功改名檔案數：${successfulItems.length} 筆
失敗待查檔案數：${items.length - successfulItems.length} 筆
================================================

【處理規範依據】
- 眼底攝影表單：自 PDF 內文自動辨識身分證字號與受檢者姓名
- 影像檔案：自檔名精確解析病歷號/身分證與病患姓名並重組
- 命名規範：[身分證/病歷號]_[病患姓名].[副檔名]

【隱私與合規聲明】
本系統採本機瀏覽器端即時運算解析，影像與個人識別資料 (PHI) 絕不上傳至任何外部公有伺服器，符合個人資料保護法與醫療機構資安規範。
`;
  zip.file('README_說明與資安聲明.txt', readmeContent);

  // 4. Generate ZIP blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return {
    success: true,
    totalExported: successfulItems.length,
  };
}

/**
 * Export single CSV report
 */
export function exportCsvReport(items: FileProcessingItem[]) {
  const csvHeaders = ['序號', '原始檔名', '新檔名', '身分證字號/病歷號', '病患姓名', '檢查眼別', '檢查日期', '處理狀態', '處理備註'];
  const csvRows = items.map((item, idx) => [
    idx + 1,
    `"${item.originalName.replace(/"/g, '""')}"`,
    `"${item.newName.replace(/"/g, '""')}"`,
    `"${item.extractedId || '無法辨識'}"`,
    `"${item.extractedName || '無法辨識'}"`,
    `"${item.extractedEye || '無'}"`,
    `"${item.extractedDate || '無'}"`,
    item.status === 'success' ? '成功' : '失敗',
    `"${(item.errorMessage || '正常處理完成').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [csvHeaders.join(','), ...csvRows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `醫療影像改名報告_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
