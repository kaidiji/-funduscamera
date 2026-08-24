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

// 醫療與系統黑名單（嚴格禁止當作人名）
export const SYSTEM_BLACKLIST = [
  '眼底', '攝影', '篩檢', '報告', '說明', '結果', '無明', '顯異', '常無', '地區', '協會',
  '分析', '類別', '備註', '轉診', '建議', '品質', '不佳', '視網膜', '拍攝', '模式', '時間',
  '出血', '滲出', '棉絮', '血管', '兩眼', '右眼', '左眼', '醫師', '醫院', '診所'
];

/**
 * 檢查字串是否包含黑名單中的任何詞彙
 */
function containsBlacklistWord(candidate: string): boolean {
  return SYSTEM_BLACKLIST.some(word => candidate.includes(word));
}

/**
 * ==================== extract_info_from_pdf_strict ====================
 * 目標檔名格式：{id_number}_{name}.pdf (例: M120047055_廖大渭.pdf)
 * 
 * 1. 抓取身分證字號
 *    re.search(r'[A-Z][1-2]\d{8}', full_text)
 * 
 * 2. 策略 A：表格化「姓 名」或「姓名」標籤
 *    re.search(r'姓\s*名[\s:：|]*([\u4e00-\u9fa5]{2,4})', full_text)
 * 
 * 3. 策略 B：身分證字號緊黏姓名 (例如：M100322762白進乾)
 *    re.search(re.escape(id_number) + r'[\s|_]*([\u4e00-\u9fa5]{2,4})', full_text)
 * 
 * 4. 策略 C：其他常見標籤 (受檢者/患者/病患/被檢查者)
 *    re.search(r'(?:受檢者|患者|病患|被檢查者)[\s:：|]*([\u4e00-\u9fa5]{2,4})', full_text)
 * 
 * ⚠️ 關鍵保護機制：若找不到正確姓名，不進行盲目猜測，直接回傳 None 觸發「待補填/失敗」
 */
export function extractInfoFromPdfStrict(fullText: string, filename = 'document.pdf'): {
  id: string | null;
  name: string | null;
  success: boolean;
  newName: string;
  errorMessage?: string;
} {
  let id_number: string | null = null;
  let name: string | null = null;

  // 1. 抓取身分證字號
  const id_match = fullText.match(/[A-Z][1-2]\d{8}/);
  if (id_match) {
    id_number = id_match[0];
  }

  // 2. 策略 A：表格化「姓 名」或「姓名」標籤
  const name_match = fullText.match(/姓\s*名[\s:：|]*([\u4e00-\u9fa5]{2,4})/);
  if (name_match && name_match[1]) {
    const cand = name_match[1].trim();
    if (!containsBlacklistWord(cand)) {
      name = cand;
    }
  }

  // 3. 策略 B：身分證字號緊黏姓名 (例如：M100322762白進乾)
  if (!name && id_number) {
    const sticky_match = fullText.match(new RegExp(escapeRegExp(id_number) + '[\\s|_]*([\\u4e00-\\u9fa5]{2,4})'));
    if (sticky_match && sticky_match[1]) {
      const cand = sticky_match[1].trim();
      if (!containsBlacklistWord(cand)) {
        name = cand;
      }
    }
  }

  // 4. 策略 C：其他常見標籤 (受檢者/患者/病患/被檢查者)
  if (!name) {
    const alt_match = fullText.match(/(?:受檢者|患者|病患|被檢查者)[\s:：|]*([\u4e00-\u9fa5]{2,4})/);
    if (alt_match && alt_match[1]) {
      const cand = alt_match[1].trim();
      if (!containsBlacklistWord(cand)) {
        name = cand;
      }
    }
  }

  // ⚠️ 關鍵保護機制：若找不到正確姓名，不進行盲目猜測，直接回傳 None 觸發「待補填/失敗」
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
export const extractInfoFromPdfV2 = extractInfoFromPdfStrict;
export const extractInfoFromPdfText = extractInfoFromPdfStrict;
export const extractInfoFromPdfUniversal = extractInfoFromPdfStrict;
export const extractIdAndNameFromText = extractInfoFromPdfStrict;

/**
 * Parse a PDF file and extract medical records with strict logic
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

    const parsed = extractInfoFromPdfStrict(fullText, filename);

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
