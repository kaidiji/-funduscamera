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
 * ==================== extract_info_from_pdf_v2 ====================
 * 目標檔名格式：{id_number}_{name}.pdf (例: M120047055_廖大渭.pdf)
 * 
 * 1. 精準抓取身分證字號 (1位大寫英文 + 1或2 + 8位數字)
 *    id_match = re.search(r'[A-Z][1-2]\d{8}', full_text)
 * 
 * 2. 精準抓取姓名 - 解決「姓 名」或「姓   名」與表格邊框問題
 *    匹配模式：(姓 + 0~4個空白/欄位符號 + 名 + 0~2個冒號/空白) + (2~4字中文姓名)
 *    name_match = re.search(r'姓\s*名[\s:：|]*([\u4e00-\u9fa5]{2,4})', full_text)
 *    排除黑名單：["眼底", "攝影", "篩檢", "報告", "說明", "結果", "無明", "顯異", "常無", "地區", "協會"]
 * 
 * 3. 備用方案 A：若無「姓 名」，尋找「受檢者/患者/病患」等標籤
 *    alt_match = re.search(r'(?:受檢者|患者|病患|被檢查者)[\s:：|]*([\u4e00-\u9fa5]{2,4})', full_text)
 * 
 * 4. 備用方案 B：針對 VeriSee 影像檔 (身分證與姓名緊黏，如 M120047055廖大渭)
 *    sticky_match = re.search(re.escape(id_number) + r'[\s|_]*([\u4e00-\u9fa5]{2,4})', full_text)
 */
export function extractInfoFromPdfV2(fullText: string, filename = 'document.pdf'): {
  id: string | null;
  name: string | null;
  success: boolean;
  newName: string;
  errorMessage?: string;
} {
  let id_number: string | null = null;
  let name: string | null = null;

  // 1. 精準抓取身分證字號 (1位大寫英文 + 1或2 + 8位數字)
  const id_match = fullText.match(/[A-Z][1-2]\d{8}/);
  if (id_match) {
    id_number = id_match[0];
  }

  // 2. 精準抓取姓名 - 解決「姓 名」或「姓   名」與表格邊框問題
  // 匹配模式：(姓 + 0~4個空白/欄位符號 + 名 + 0~2個冒號/空白) + (2~4字中文姓名)
  const name_match = fullText.match(/姓\s*名[\s:：|]*([\u4e00-\u9fa5]{2,4})/);
  if (name_match && name_match[1]) {
    const candidate_name = name_match[1].trim();
    const blacklist = new Set([
      '眼底', '攝影', '篩檢', '報告', '說明', '結果', '無明', '顯異', '常無', '地區', '協會'
    ]);
    if (!blacklist.has(candidate_name)) {
      name = candidate_name;
    }
  }

  // 3. 備用方案 A：若無「姓 名」，尋找「受檢者/患者/病患」等標籤
  if (!name) {
    const alt_match = fullText.match(/(?:受檢者|患者|病患|被檢查者)[\s:：|]*([\u4e00-\u9fa5]{2,4})/);
    if (alt_match && alt_match[1]) {
      name = alt_match[1].trim();
    }
  }

  // 4. 備用方案 B：針對 VeriSee 影像檔 (身分證與姓名緊黏，如 M120047055廖大渭)
  if (!name && id_number) {
    const sticky_match = fullText.match(new RegExp(escapeRegExp(id_number) + '[\\s|_]*([\\u4e00-\\u9fa5]{2,4})'));
    if (sticky_match && sticky_match[1]) {
      const cand = sticky_match[1].trim();
      const sticky_blacklist = new Set(['眼底', '攝影', '篩檢']);
      if (!sticky_blacklist.has(cand)) {
        name = cand;
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
export const extractInfoFromPdfText = extractInfoFromPdfV2;
export const extractInfoFromPdfUniversal = extractInfoFromPdfV2;
export const extractIdAndNameFromText = extractInfoFromPdfV2;

/**
 * Parse a PDF file and extract medical records with v2 logic
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

    const parsed = extractInfoFromPdfV2(fullText, filename);

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
