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

// 輔助跳脫正規表達式特殊字元 (如 Python re.escape)
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * ==================== extract_info_from_pdf_universal ====================
 * 目標檔名格式：{id_number}_{name}.pdf (例: M120047055_廖大渭.pdf)
 * 
 * 1. 抓取身分證字號 (全字串搜尋 1 位大寫英文 + 1 或 2 + 8 位數字)
 *    re.search(r'[A-Z][1-2]\d{8}', full_text)
 * 
 * 2. 抓取姓名 - 策略 A：針對篩檢表單 (搜尋 "姓名：xxx" 或 "受檢者：xxx")
 *    支援包含冒號、空白、特殊符號的隔開
 *    re.search(r'(?:姓名|受檢者|患者|病患|被檢查者)[:：\s|]*([\u4e00-\u9fa5]{2,4})', full_text)
 * 
 * 3. 抓取姓名 - 策略 B：針對 VeriSee 影像檔 (身分證號碼緊黏著姓名，如 M120047055廖大渭)
 *    re.search(re.escape(id_number) + r'[\s|_]*([\u4e00-\u9fa5]{2,4})', full_text)
 * 
 * 4. 抓取姓名 - 策略 C：備用字詞過濾 (若上方均未命中，提取排除黑名單後的中文人名)
 *    blacklist = ["說明", "表單", "篩檢", "眼底", "報告", "檢查", "醫師", "同意", "簽名", "兩眼", "右眼", "左眼"]
 */
export function extractInfoFromPdfUniversal(fullText: string, filename = 'document.pdf'): {
  id: string | null;
  name: string | null;
  success: boolean;
  newName: string;
  errorMessage?: string;
} {
  let id_number: string | null = null;
  let name: string | null = null;

  // 1. 抓取身分證字號 (全字串搜尋 1 位大寫英文 + 1 或 2 + 8 位數字)
  const id_match = fullText.match(/[A-Z][1-2]\d{8}/);
  if (id_match) {
    id_number = id_match[0];
  }

  // 2. 抓取姓名 - 策略 A：針對篩檢表單 (搜尋 "姓名：xxx" 或 "受檢者：xxx")
  // 支援包含冒號、空白、特殊符號的隔開
  const name_label_match = fullText.match(/(?:姓名|受檢者|患者|病患|被檢查者)[:：\s|]*([\u4e00-\u9fa5]{2,4})/);
  if (name_label_match && name_label_match[1]) {
    name = name_label_match[1].trim();
  }

  // 3. 抓取姓名 - 策略 B：針對 VeriSee 影像檔 (身分證號碼緊黏著姓名，如 M120047055廖大渭)
  if (!name && id_number) {
    const sticky_match = fullText.match(new RegExp(escapeRegExp(id_number) + '[\\s|_]*([\\u4e00-\\u9fa5]{2,4})'));
    if (sticky_match && sticky_match[1]) {
      name = sticky_match[1].trim();
    }
  }

  // 4. 抓取姓名 - 策略 C：備用字詞過濾 (若上方均未命中，提取排除黑名單後的中文人名)
  if (!name) {
    const blacklist = new Set([
      '說明', '表單', '篩檢', '眼底', '報告', '檢查', '醫師', '同意', '簽名', '兩眼', '右眼', '左眼', '您好', '親愛的'
    ]);
    const candidates = fullText.match(/[\u4e00-\u9fa5]{2,4}/g);
    if (candidates) {
      for (const cand of candidates) {
        if (!blacklist.has(cand)) {
          name = cand;
          break;
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

// 別名相容匯出
export const extractInfoFromPdfText = extractInfoFromPdfUniversal;
export const extractIdAndNameFromText = extractInfoFromPdfUniversal;

/**
 * Parse a PDF file and extract medical records with universal logic
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

    const parsed = extractInfoFromPdfUniversal(fullText, filename);

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
      errorReason: `PDF 解析異常: ${errorMsg}`,
      fullText: '',
    };
  }
}
