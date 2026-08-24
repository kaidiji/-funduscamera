import * as pdfjsLib from 'pdfjs-dist';
import { EyeSide } from '../types';

// Set up worker source with CDN fallback
try {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  }
} catch {
  // worker initialization fallback
}

export interface ExtractedPdfResult {
  id: string | null;
  name: string | null;
  newName: string;
  success: boolean;
  errorReason?: string;
  fullText: string;
}

const NAME_BLACKLIST = new Set([
  '您好', '說明', '表單', '篩檢', '眼底', '報告', '檢查', '親愛的'
]);

/**
 * ==================== 邏輯 1：PDF 內文辨識 (眼底攝影表單) ====================
 * 目標檔名格式：M120047055_廖大渭.pdf
 * 
 * 1. 識別身分證字號：[A-Z][1-2]\d{8}
 * 2. 識別姓名：
 *    name_match = re.search(r'(?:姓名|受檢者|患者|被檢查者)[:：]?\s*([\u4e00-\u9fa5]{2,4})', full_text)
 *    若在排除清單中，逐行尋找關鍵字並替換去除後匹配中文姓名
 * 3. 產出格式：{身分證}_{姓名}.pdf
 */
export function extractIdAndNameFromText(fullText: string, filename = 'document.pdf'): {
  id: string | null;
  name: string | null;
  success: boolean;
  newName: string;
  errorMessage?: string;
} {
  let id_number: string | null = null;
  let name: string | null = null;

  // 1. 識別身分證字號
  const id_match = fullText.match(/[A-Z][1-2]\d{8}/);
  if (id_match) {
    id_number = id_match[0];
  }

  // 2. 識別姓名
  const name_match = fullText.match(/(?:姓名|受檢者|患者|被檢查者)[:：]?\s*([\u4e00-\u9fa5]{2,4})/);
  if (name_match && name_match[1]) {
    const potential_name = name_match[1].trim();
    if (!NAME_BLACKLIST.has(potential_name)) {
      name = potential_name;
    }
  }

  if (!name) {
    const lines = fullText.split('\n');
    for (const line of lines) {
      if (['姓名', '受檢者', '患者', '被檢查者'].some(keyword => line.includes(keyword))) {
        const cleaned = line
          .replaceAll('姓名', '')
          .replaceAll('受檢者', '')
          .replaceAll('患者', '')
          .replaceAll('被檢查者', '');
        const cn_match = cleaned.match(/[\u4e00-\u9fa5]{2,4}/);
        if (cn_match) {
          const potential_name = cn_match[0].trim();
          if (!NAME_BLACKLIST.has(potential_name)) {
            name = potential_name;
            break;
          }
        }
      }
    }
  }

  if (id_number && name) {
    // 產出格式：身分證_姓名.pdf (例: M120047055_廖大渭.pdf)
    const new_name = `${id_number}_${name}.pdf`;
    return {
      id: id_number,
      name,
      success: true,
      newName: new_name,
    };
  } else {
    return {
      id: id_number,
      name,
      success: false,
      newName: filename,
      errorMessage: `無法辨識 (身分證:${id_number || 'None'}, 姓名:${name || 'None'})`,
    };
  }
}

/**
 * Parse a PDF file and extract medical records (Matching Python logic 1)
 */
export async function parsePdfFile(file: File | Blob, originalFilename?: string): Promise<ExtractedPdfResult> {
  const filename = originalFilename || ('name' in file ? (file as File).name : 'document.pdf');
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    let fullText = '';

    try {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      const maxPages = Math.min(pdfDoc.numPages, 5);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: unknown) => {
            if (typeof item === 'object' && item !== null && 'str' in item) {
              return (item as { str: string }).str;
            }
            return '';
          })
          .join(' ');
        if (pageText) {
          fullText += pageText + '\n';
        }
      }
    } catch {
      // Fallback: Try decoding raw binary text if pdf.js fails in environment
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const rawString = decoder.decode(arrayBuffer);
      fullText = rawString;
    }

    const parsed = extractIdAndNameFromText(fullText, filename);

    return {
      id: parsed.id,
      name: parsed.name,
      newName: parsed.newName,
      success: parsed.success,
      errorReason: parsed.errorMessage,
      fullText: fullText.trim(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      id: null,
      name: null,
      newName: filename,
      success: false,
      errorReason: `PDF 讀取錯誤: ${errorMsg}`,
      fullText: '',
    };
  }
}
