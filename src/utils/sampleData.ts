import { FileProcessingItem } from '../types';

/**
 * Generates sample mock files for Tab 1: 眼底攝影表單 (PDF 內文辨識)
 * 格式範例：M100322762_白進乾.pdf / M120047055_廖大渭.pdf
 */
export function generateSampleFundusPdfItems(): FileProcessingItem[] {
  return [
    {
      id: 'sample-pdf-1',
      originalName: 'Scan_20260824_091522.pdf',
      originalSize: 458200,
      fileType: 'application/pdf',
      status: 'pending',
      extractedId: null,
      extractedName: null,
      extractedDate: null,
      extractedEye: null,
      newName: 'Scan_20260824_091522.pdf',
      errorMessage: null,
      rawExtractedText: `臺北榮民總醫院 眼底攝影數位檢查報告單
檢查日期：2026-08-24 09:15
病患識別碼 M100322762白進乾
檢查項目：眼底彩色攝影 (Fundus Color Photography)
檢查眼別：雙眼 (OU)
黃斑部狀態：未見顯著水腫，視神經盤邊緣清晰。`,
      manualOverride: false,
      selectedForExport: true,
    },
    {
      id: 'sample-pdf-2',
      originalName: 'Fundus_Report_Temp_882.pdf',
      originalSize: 512400,
      fileType: 'application/pdf',
      status: 'pending',
      extractedId: null,
      extractedName: null,
      extractedDate: null,
      extractedEye: null,
      newName: 'Fundus_Report_Temp_882.pdf',
      errorMessage: null,
      rawExtractedText: `高雄長庚紀念醫院 眼科部視網膜專科檢驗單
受檢日期：2026/08/24
身分證字號 B234567890李淑芬
檢查部位：右眼 (OD)
診斷：糖尿病視網膜病變 (Non-proliferative Diabetic Retinopathy)`,
      manualOverride: false,
      selectedForExport: true,
    },
    {
      id: 'sample-pdf-3',
      originalName: 'DOC20260824-0012.pdf',
      originalSize: 389100,
      fileType: 'application/pdf',
      status: 'pending',
      extractedId: null,
      extractedName: null,
      extractedDate: null,
      extractedEye: null,
      newName: 'DOC20260824-0012.pdf',
      errorMessage: null,
      rawExtractedText: `衛生福利部雙和醫院 眼底攝影巡迴醫療檢查表記錄
姓名：廖大渭
身分證：M120047055
檢查日期：2026年08月24日
眼別：左眼 (OS)`,
      manualOverride: false,
      selectedForExport: true,
    },
    {
      id: 'sample-pdf-4',
      originalName: 'Unlabeled_Scan_Damaged.pdf',
      originalSize: 215600,
      fileType: 'application/pdf',
      status: 'pending',
      extractedId: null,
      extractedName: null,
      extractedDate: null,
      extractedEye: null,
      newName: 'Unlabeled_Scan_Damaged.pdf',
      errorMessage: null,
      rawExtractedText: `眼科門診檢查影像報告 (掃描殘缺頁)
受檢者：趙天晴  女士
身分證號：********** (條碼損毀無文字)
檢查日期：2026-08-24`,
      manualOverride: false,
      selectedForExport: true,
    },
    {
      id: 'sample-pdf-5',
      originalName: 'Report_991823_Fundus.pdf',
      originalSize: 642300,
      fileType: 'application/pdf',
      status: 'pending',
      extractedId: null,
      extractedName: null,
      extractedDate: null,
      extractedEye: null,
      newName: 'Report_991823_Fundus.pdf',
      errorMessage: null,
      rawExtractedText: `臺中榮民總醫院 眼科部視力與眼底檢查報告
患者：張雅婷
身分證：H223456789
檢查日期：2026-08-24`,
      manualOverride: false,
      selectedForExport: true,
    },
  ];
}

/**
 * Generates sample mock files for Tab 2: 非眼底鏡車拍攝 (檔名批次處理)
 * 格式範例：_古建雄_OD_20260824.pdf
 */
export function generateSampleCameraItems(): FileProcessingItem[] {
  return [
    {
      id: 'sample-cam-1',
      originalName: '古建雄_右眼_01.pdf',
      originalSize: 845000,
      fileType: 'application/pdf',
      status: 'pending',
      extractedId: null,
      extractedName: null,
      extractedDate: null,
      extractedEye: null,
      newName: '古建雄_右眼_01.pdf',
      errorMessage: null,
      manualOverride: false,
      selectedForExport: true,
    },
    {
      id: 'sample-cam-2',
      originalName: '陳大文_OS_左眼.jpg',
      originalSize: 2150000,
      fileType: 'image/jpeg',
      status: 'pending',
      extractedId: null,
      extractedName: null,
      extractedDate: null,
      extractedEye: null,
      newName: '陳大文_OS_左眼.jpg',
      errorMessage: null,
      manualOverride: false,
      selectedForExport: true,
    },
    {
      id: 'sample-cam-3',
      originalName: '林志明_OD.png',
      originalSize: 1980000,
      fileType: 'image/png',
      status: 'pending',
      extractedId: null,
      extractedName: null,
      extractedDate: null,
      extractedEye: null,
      newName: '林志明_OD.png',
      errorMessage: null,
      manualOverride: false,
      selectedForExport: true,
    },
    {
      id: 'sample-cam-4',
      originalName: '李美華-左眼-檢驗.pdf',
      originalSize: 520000,
      fileType: 'application/pdf',
      status: 'pending',
      extractedId: null,
      extractedName: null,
      extractedDate: null,
      extractedEye: null,
      newName: '李美華-左眼-檢驗.pdf',
      errorMessage: null,
      manualOverride: false,
      selectedForExport: true,
    },
    {
      id: 'sample-cam-5',
      originalName: 'IMG_0892_Cornea_Exam.jpg',
      originalSize: 1650000,
      fileType: 'image/jpeg',
      status: 'pending',
      extractedId: null,
      extractedName: null,
      extractedDate: null,
      extractedEye: null,
      newName: 'IMG_0892_Cornea_Exam.jpg',
      errorMessage: null,
      manualOverride: false,
      selectedForExport: true,
    },
  ];
}
