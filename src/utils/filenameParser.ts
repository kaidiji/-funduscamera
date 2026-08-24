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
 * 取得 YYYYMMDD 日期字串
 */
export function getFormattedDate(fileMtime?: number | Date | string | null): string {
  const d = fileMtime ? new Date(fileMtime) : new Date();
  if (isNaN(d.getTime())) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * ==================== 邏輯 2：非眼底鏡車拍攝 (檔名解析) ====================
 * 目標檔名格式：_古建雄_OD_20260824.pdf
 * 
 * def process_filename_file(filename, file_mtime=None):
 *     ext = os.path.splitext(filename)[1]
 *     
 *     # 1. 抓取姓名
 *     name_match = re.split(r'[-_]', filename)
 *     name = name_match[0].strip() if name_match else None
 *     
 *     # 2. 判斷眼別
 *     eye = None
 *     if "右" in filename or "OD" in filename.upper():
 *         eye = "OD"
 *     elif "左" in filename or "OS" in filename.upper():
 *         eye = "OS"
 *         
 *     # 3. 日期格式 YYYYMMDD
 *     date_str = file_mtime if file_mtime else datetime.datetime.now().strftime('%Y%m%d')
 *     
 *     if name and eye and date_str:
 *         # 產出格式：_姓名_眼別_日期.副檔名 (例: _古建雄_OD_20260824.pdf)
 *         new_name = f"_{name}_{eye}_{date_str}{ext}"
 *         return True, new_name, filename
 *     else:
 *         return False, f"格式不符 (姓名:{name}, 眼別:{eye})", filename
 */
export function processFilenameFile(
  filename: string,
  fileMtime?: number | Date | string | null
): FilenameParsedResult {
  const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
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

  // 3. 日期格式 YYYYMMDD
  const date_str = getFormattedDate(fileMtime);

  if (name && eye && date_str) {
    // 產出格式：_姓名_眼別_日期.副檔名 (例: _古建雄_OD_20260824.pdf)
    const new_name = `_${name}_${eye}_${date_str}${ext}`;
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
      newName: filename,
      success: false,
      errorReason: `格式不符 (姓名:${name || 'None'}, 眼別:${eye || 'None'})`,
    };
  }
}

/**
 * 輔助產生格式化新檔名
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
  customPattern = '{id}_{name}',
  originalExtension?: string
): string {
  const ext = originalExtension || (info.originalName.includes('.') ? info.originalName.slice(info.originalName.lastIndexOf('.')) : '');
  
  const idPart = info.id || '未知身分證';
  const namePart = info.name || '未知姓名';
  const eyePart = info.eye ? (info.eye === 'OD' ? 'OD' : info.eye === 'OS' ? 'OS' : 'OU') : '';
  const datePart = info.date || getFormattedDate();

  let generatedBase = '';

  switch (template) {
    case 'ID_NAME':
      // M120047055_廖大渭.pdf
      generatedBase = `${idPart}_${namePart}`;
      break;
    case 'ID_NAME_EYE':
      // _姓名_眼別_日期.ext
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
  return `${sanitized}${ext}`;
}
