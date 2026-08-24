import * as pdfjsLib from 'pdfjs-dist';

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

/**
 * ==================== 邏輯 1：PDF 內文辨識 (眼底攝影表單) ====================
 * 目標檔名格式：M120047055_廖大渭.pdf
 * 
 * 優先規則：捕捉「病患識別碼」或「身分證」後面「10碼字號 + 中文字」組合
 * 範例：病患識別碼 M100322762白進乾
 * combined_match = re.search(r'(?:病患識別碼|身分證字號|病歷號)?\s*([A-Z][1-2]\d{8})([\u4e00-\u9fa5]{2,4})', full_text)
 * 
 * 後備規則 1：單獨找身分證 [A-Z][1-2]\d{8}
 * 後備規則 2：單獨找姓名標籤 (?:姓名|受檢者|患者)[:：\s]*([\u4e00-\u9fa5]{2,4})
 */
export function extractInfoFromPdfText(fullText: string, filename = 'document.pdf'): {
  id: string | null;
  name: string | null;
  success: boolean;
  newName: string;
  errorMessage?: string;
} {
  let id_number: string | null = null;
  let name: string | null = null;

  // 優先規則：捕捉「病患識別碼」或「身分證」後面「10碼字號 + 中文字」組合
  // 範例：病患識別碼 M100322762白進乾
  const combined_match = fullText.match(/(?:病患識別碼|身分證字號|病歷號)?\s*([A-Z][1-2]\d{8})([\u4e00-\u9fa5]{2,4})/);
  
  if (combined_match && combined_match[1] && combined_match[2]) {
    id_number = combined_match[1]; // 取得 M100322762
    name = combined_match[2];      // 取得 白進乾
  } else {
    // 後備規則 1：單獨找身分證
    const id_match = fullText.match(/[A-Z][1-2]\d{8}/);
    if (id_match) {
      id_number = id_match[0];
    }
    
    // 後備規則 2：單獨找姓名標籤
    const name_match = fullText.match(/(?:姓名|受檢者|患者)[:：\s]*([\u4e00-\u9fa5]{2,4})/);
    if (name_match && name_match[1]) {
      name = name_match[1].trim();
    }
  }

  if (id_number && name) {
    // 產出格式：身分證_姓名.pdf (例: M100322762_白進乾.pdf)
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

// 保持向下相容別名
export const extractIdAndNameFromText = extractInfoFromPdfText;

/**
 * Parse a PDF file and extract medical records
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

    const parsed = extractInfoFromPdfText(fullText, filename);

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
      errorReason: `解析失敗: ${errorMsg}`,
      fullText: '',
    };
  }
}
