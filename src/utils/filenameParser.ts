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
 * 格式化為：Y0年年月月日日01 (9碼數字，後面兩個數字由1開始依序)
 * 範例："20260910", 1 => "Y026091001"
 */
export function formatSerialCode(dateStr8: string, serialNumber: number): string {
  let yy = '26';
  let mm = '09';
  let dd = '10';
  
  const clean = dateStr8.replace(/\D/g, ''); // 只保留數字
  if (clean.length === 8) {
    yy = clean.slice(2, 4);
    mm = clean.slice(4, 6);
    dd = clean.slice(6, 8);
  } else if (clean.length === 6) {
    yy = clean.slice(0, 2);
    mm = clean.slice(2, 4);
    dd = clean.slice(4, 6);
  } else {
    // 預設採用當前系統日期
    const d = new Date();
    yy = String(d.getFullYear()).slice(-2);
    mm = String(d.getMonth() + 1).padStart(2, '0');
    dd = String(d.getDate()).padStart(2, '0');
  }
  
  const ss = String(serialNumber).padStart(2, '0');
  return `Y0${yy}${mm}${dd}${ss}`;
}

/**
 * ==================== 邏輯 2：非眼底鏡車拍攝 (檔名解析) ====================
 * 目標檔名格式：Y0年年月月日日01_姓名_OD/OS.pdf
 * 
 * 1. 抓取姓名 (以 - 或 _ 切割取第一部分)
 * 2. 判斷眼別 (檔名包含「右」或「OD」為 OD；「左」或「OS」為 OS)
 * 3. 轉檔當天日期 (YYYYMMDD，採用點擊轉檔當天之系統日期，轉為 YYMMDD)
 * 4. 序號 (從 1 開始依序遞增，並格式化為 2 位數，如 01, 02)
 */
export function processFilenameFile(
  filename: string,
  dateOverride?: string,
  serialNumber = 1
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

  // 3. 轉檔日期格式 YYYYMMDD
  const date_str = dateOverride || getFormattedDate(new Date());

  // 4. 生成九碼序號前綴 Y0年年月月日日01
  const serialPrefix = formatSerialCode(date_str, serialNumber);

  if (name && eye) {
    // 產出格式：Y0年年月月日日01_姓名_眼別.pdf (一律輸出為 .pdf)
    const new_name = `${serialPrefix}_${name}_${eye}.pdf`;
    return {
      name,
      eye,
      dateStr: date_str,
      newName: new_name,
      success: true,
    };
  } else {
    // 即使失敗，也用預設名稱與序號拼裝，讓使用者知道如何補填
    const new_name = `${serialPrefix}_${name || '未知姓名'}_${eye || '未知眼別'}.pdf`;
    return {
      name,
      eye,
      dateStr: date_str,
      newName: new_name,
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
