import { EyeSide } from '../types';

export interface FilenameParsedResult {
  name: string | null;
  eye: EyeSide;
  dateStr: string | null;
  newName: string;
  success: boolean;
  errorReason?: string;
}

/**
 * 取得當前點擊轉檔當天之 YYYYMMDD 日期字串 (例：20260824)
 */
export function getFormattedDate(targetDate?: Date | number | string | null): string {
  const d = targetDate ? new Date(targetDate) : new Date();
  const dateObj = isNaN(d.getTime()) ? new Date() : d;
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * ==================== 邏輯 2：非眼底鏡車拍攝 (檔名解析) ====================
 * 目標檔名格式：_古建雄_OD_20260824.pdf (無論原始為 JPG、PNG 或是 PDF，改完檔名一律輸出為 .pdf)
 * 
 * 1. 抓取姓名 (以 - 或 _ 切割取第一部分)
 * 2. 判斷眼別 (檔名包含「右」或「OD」為 OD；「左」或「OS」為 OS)
 * 3. 轉檔當天日期 (YYYYMMDD，採用點擊轉檔當天之系統日期)
 */
export function processFilenameFile(
  filename: string,
  dateOverride?: string
): FilenameParsedResult {
  const baseName = filename.replace(/\.[^/.]+$/, '');

  // 1. 抓取姓名
  const name_match = baseName.split(/[-_]/);
  const name = name_match && name_match.length > 0 && name_match[0].trim() ? name_match[0].trim() : null;

  // 2. 判斷眼別
  let eye: EyeSide = null;
  const upper = filename.toUpperCase();
  if (filename.includes('右') || upper.includes('OD')) {
    eye = 'OD';
  } else if (filename.includes('左') || upper.includes('OS')) {
    eye = 'OS';
  }

  // 3. 日期格式 YYYYMMDD (嚴格採用點擊轉檔當天日期)
  const date_str = dateOverride || getFormattedDate(new Date());

  if (name && eye && date_str) {
    // 產出格式：_姓名_眼別_日期.pdf (一律輸出為 .pdf 格式)
    const new_name = `_${name}_${eye}_${date_str}.pdf`;
    return {
      name,
      eye,
      dateStr: date_str,
      newName: new_name,
      success: true,
    };
  } else {
    return {
      name,
      eye,
      dateStr: date_str,
      newName: `${baseName}.pdf`,
      success: false,
      errorReason: `格式不符 (姓名:${name || 'None'}, 眼別:${eye || 'None'})`,
    };
  }
}

/**
 * 輔助產生格式化新檔名（一律輸出為 .pdf）
 */
export function generateNewFilename(
  info: {
    id: string | null;
    name: string | null;
    date: string | null;
    eye: EyeSide;
    originalName: string;
  },
  template: 'ID_NAME' | 'ID_NAME_EYE' | 'DATE_ID_NAME' | 'ID_NAME_DATE' | 'CUSTOM' = 'ID_NAME',
  customPattern = '{id}_{name}'
): string {
  const idPart = info.id || '未知身分證';
  const namePart = info.name || '未知姓名';
  const eyePart = info.eye ? (info.eye === 'OD' ? 'OD' : info.eye === 'OS' ? 'OS' : 'OU') : '';
  const datePart = info.date || getFormattedDate();

  let generatedBase = '';

  switch (template) {
    case 'ID_NAME':
      // M120047055_廖大渭
      generatedBase = `${idPart}_${namePart}`;
      break;
    case 'ID_NAME_EYE':
      // _姓名_眼別_日期
      generatedBase = `_${namePart}_${eyePart || 'OD'}_${datePart}`;
      break;
    case 'DATE_ID_NAME':
      generatedBase = `${datePart}_${idPart}_${namePart}`;
      break;
    case 'ID_NAME_DATE':
      generatedBase = `${idPart}_${namePart}_${datePart}`;
      break;
    case 'CUSTOM': {
      generatedBase = customPattern
        .replace(/{id}/gi, idPart)
        .replace(/{name}/gi, namePart)
        .replace(/{eye}/gi, info.eye || '')
        .replace(/{date}/gi, datePart);
      break;
    }
  }

  const sanitized = generatedBase.replace(/[\\/:*?"<>|]/g, '_').trim();
  return `${sanitized}.pdf`;
}
