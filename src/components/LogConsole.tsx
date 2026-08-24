import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Check, Trash2, Filter } from 'lucide-react';
import { ProcessingLog } from '../types';

interface LogConsoleProps {
  logs: ProcessingLog[];
  onClearLogs: () => void;
}

export const LogConsole: React.FC<LogConsoleProps> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'success') return log.type === 'success';
    if (filter === 'error') return log.type === 'error' || log.type === 'warning';
    return true;
  });

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleCopyLogs = async () => {
    const text = logs
      .map(l => `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.message} ${l.targetFilename ? `-> 新檔名: ${l.targetFilename}` : ''}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* Console Header Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-base sm:text-lg tracking-wide text-white">
            處理紀錄主控台 (Real-time Log Console)
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
            {logs.length} 則日誌
          </span>
        </div>

        {/* Filter & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Status Filter */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <span className="px-1.5 text-xs text-slate-400 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1" />
            </span>
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                filter === 'success' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              🟢 成功
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                filter === 'error' ? 'bg-rose-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              🔴 失敗
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            title="切換日誌底色"
          >
            {theme === 'dark' ? '☀️ 亮色' : '🌙 暗色'}
          </button>

          {/* Copy Logs */}
          <button
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-40"
            title="複製全部處理日誌"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已複製' : '複製日誌'}</span>
          </button>

          {/* Clear Logs */}
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-300 border border-slate-700 transition-colors"
              title="清除日誌"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Log Output Screen */}
      <div
        id="realtime-log-container"
        className={`p-4 font-mono text-sm sm:text-base overflow-y-auto custom-scrollbar transition-colors ${
          theme === 'dark'
            ? 'bg-[#0B0F19] text-slate-200 log-scrollbar-dark'
            : 'bg-slate-50 text-slate-800 border-t border-slate-200'
        }`}
        style={{ height: '240px', minHeight: '200px' }}
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 font-sans py-8">
            <Terminal className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-base font-medium">尚未有處理日誌，點擊「開始自動解析與改名」後將在此即時串流顯示</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => {
              const isSuccess = log.type === 'success';
              const isError = log.type === 'error';
              const isWarning = log.type === 'warning';

              return (
                <div
                  key={log.id}
                  className={`p-2 rounded-lg flex items-start gap-2.5 transition-all text-sm sm:text-base leading-relaxed ${
                    theme === 'dark'
                      ? isSuccess
                        ? 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-200'
                        : isError
                        ? 'bg-rose-950/50 border border-rose-900/60 text-rose-200'
                        : isWarning
                        ? 'bg-amber-950/40 border border-amber-900/50 text-amber-200'
                        : 'bg-slate-900/60 text-slate-300'
                      : isSuccess
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : isError
                      ? 'bg-rose-50 border border-rose-200 text-rose-900'
                      : isWarning
                      ? 'bg-amber-50 border border-amber-200 text-amber-900'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  {/* Status Indicator Icon as specified in requirements */}
                  <span className="shrink-0 text-base select-none">
                    {isSuccess && '🟢'}
                    {isError && '🔴'}
                    {isWarning && '🟡'}
                    {log.type === 'info' && 'ℹ️'}
                  </span>

                  {/* Timestamp */}
                  <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-mono ${
                    theme === 'dark' ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {log.timestamp}
                  </span>

                  {/* Message & Status Target */}
                  <div className="flex-1 break-all">
                    {isSuccess ? (
                      <div>
                        <span className="font-bold mr-1 text-emerald-400">[成功]</span>
                        <span className="font-semibold">{log.message}</span>
                        {log.targetFilename && (
                          <div className="mt-0.5 font-bold tracking-wide text-emerald-300">
                            -&gt; 新檔名: <span className="underline decoration-emerald-500">{log.targetFilename}</span>
                          </div>
                        )}
                      </div>
                    ) : isError ? (
                      <div>
                        <span className="font-bold mr-1 text-rose-400">[失敗]</span>
                        <span className="font-bold text-rose-300">{log.message}</span>
                        {log.details && (
                          <div className="mt-0.5 text-xs text-rose-200/90 font-sans">
                            {log.details}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>{log.message}</span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={consoleBottomRef} />
          </div>
        )}
      </div>
    </div>
  );
};
