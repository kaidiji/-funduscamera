export type TabMode = 'FUNDUS_PDF' | 'OTHER_CAMERA';

export type AppState = 'IDLE' | 'FILES_SELECTED' | 'PROCESSING' | 'COMPLETED';

export type ItemStatus = 'pending' | 'processing' | 'success' | 'failed';

export type EyeSide = 'OD' | 'OS' | 'OU' | 'R' | 'L' | null;

export interface FileProcessingItem {
  id: string;
  originalFile?: File;
  originalName: string;
  originalSize: number;
  fileType: string;
  status: ItemStatus;
  extractedId: string | null;
  extractedName: string | null;
  extractedDate: string | null;
  extractedEye: EyeSide;
  extractedDepartment?: string | null;
  newName: string;
  errorMessage: string | null;
  previewUrl?: string | null;
  rawExtractedText?: string | null;
  manualOverride: boolean;
  selectedForExport: boolean;
}

export type LogLevel = 'info' | 'success' | 'error' | 'warning';

export interface ProcessingLog {
  id: string;
  timestamp: string;
  type: LogLevel;
  message: string;
  targetFilename?: string;
  details?: string;
}

export interface NamingTemplateConfig {
  format: 'ID_NAME' | 'ID_NAME_EYE' | 'DATE_ID_NAME' | 'ID_NAME_DATE' | 'CUSTOM';
  customPattern: string; // e.g. "{id}_{name}"
  preserveExtension: boolean;
  eyeFormat: 'OD_OS' | 'ZH_EYE'; // OD/OS vs 右眼/左眼
  dateFormat: 'YYYYMMDD' | 'YYYY-MM-DD' | 'ROC'; // 20240518, 2024-05-18, 1130518
  fallbackPrefix: string;
}
