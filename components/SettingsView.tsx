import React, { useState, useRef } from 'react';
import { UserSettings } from '../types';
import { ChevronDown, Check, Copy, Download, Upload, ClipboardList, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { BIBLE_VERSIONS } from '../services/bibleContentService';
import { format } from 'date-fns';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onExportData: () => string;
  onImportData: (jsonStr: string) => boolean;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
}) => {
  const [showVersionPicker, setShowVersionPicker] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileImportStatus, setFileImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, startDate: e.target.value });
  };

  const handleVersionChange = (versionDisplayName: string) => {
    onUpdateSettings({ ...settings, bibleVersion: versionDisplayName });
    setShowVersionPicker(false);
  };

  // --- 匯出 ---

  const handleCopyBackup = async () => {
    try {
      const json = onExportData();
      await navigator.clipboard.writeText(json);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2500);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2500);
    }
  };

  const handleDownloadBackup = () => {
    const json = onExportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bible-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- 匯入（貼上） ---

  const handlePasteImport = () => {
    const success = onImportData(pasteText.trim());
    if (success) {
      setImportStatus('success');
      setTimeout(() => {
        setImportStatus('idle');
        setShowPasteModal(false);
        setPasteText('');
      }, 1500);
    } else {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 2500);
    }
  };

  const handleClosePasteModal = () => {
    setShowPasteModal(false);
    setPasteText('');
    setImportStatus('idle');
  };

  // --- 匯入（JSON 檔） ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const success = onImportData(text);
      setFileImportStatus(success ? 'success' : 'error');
      setTimeout(() => setFileImportStatus('idle'), 2500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-4 pb-24 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 mt-4">設置</h1>

      {/* Plan Settings */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 mb-2 ml-2">讀經計畫</h2>
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 flex justify-between items-center border-b border-gray-100">
            <span className="text-base">開始日期</span>
            <input
              type="date"
              value={settings.startDate}
              onChange={handleDateChange}
              className="bg-transparent text-right text-gray-500 focus:outline-none"
            />
          </div>
          <div className="relative">
            <div
              className="p-4 flex justify-between items-center cursor-pointer rounded-b-xl"
              onClick={() => setShowVersionPicker(!showVersionPicker)}
            >
              <span className="text-base">聖經版本</span>
              <div className="flex items-center text-indigo-600">
                <span>{settings.bibleVersion}</span>
                <ChevronDown size={16} className={`ml-1 transition-transform ${showVersionPicker ? 'rotate-180' : ''}`} />
              </div>
            </div>
            {showVersionPicker && (
              <div className="absolute right-0 left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mx-4">
                {BIBLE_VERSIONS.map((version) => (
                  <div
                    key={version.id}
                    className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => handleVersionChange(version.displayName)}
                  >
                    <div>
                      <div className="font-medium">{version.name}</div>
                      <div className="text-xs text-gray-500">{version.displayName}</div>
                    </div>
                    {settings.bibleVersion === version.displayName && (
                      <Check size={18} className="text-indigo-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 mb-2 ml-2">資料備份與還原</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">

          {/* Export */}
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-1">匯出備份</p>
            <p className="text-xs text-gray-400 mb-3">備份讀經進度、金句收藏與設定</p>
            <div className="flex gap-2">
              <button
                onClick={handleCopyBackup}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-medium active:bg-indigo-100 transition"
              >
                {copyStatus === 'success' ? (
                  <><CheckCircle size={15} /><span>已複製</span></>
                ) : copyStatus === 'error' ? (
                  <><AlertTriangle size={15} /><span>失敗</span></>
                ) : (
                  <><Copy size={15} /><span>複製備份碼</span></>
                )}
              </button>
              <button
                onClick={handleDownloadBackup}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium active:bg-gray-100 transition"
              >
                <Download size={15} />
                <span>下載 JSON</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              手機建議複製備份碼後貼到備忘錄保存
            </p>
          </div>

          {/* Import */}
          <div className="p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">匯入還原</p>
            <p className="text-xs text-gray-400 mb-3">還原後會覆蓋目前所有資料</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPasteModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-medium active:bg-indigo-100 transition"
              >
                <ClipboardList size={15} />
                <span>貼上備份碼</span>
              </button>
              <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium active:bg-gray-100 transition cursor-pointer">
                {fileImportStatus === 'success' ? (
                  <><CheckCircle size={15} className="text-green-500" /><span className="text-green-600">還原成功</span></>
                ) : fileImportStatus === 'error' ? (
                  <><AlertTriangle size={15} className="text-red-500" /><span className="text-red-500">格式錯誤</span></>
                ) : (
                  <><Upload size={15} /><span>選擇 JSON 檔</span></>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">貼上備份碼</h3>
              <button onClick={handleClosePasteModal} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-3">
                從備忘錄複製備份碼後貼到下方文字框
              </p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder='貼上備份碼（以 { "version": "1.0" ... 開頭）'
                className="w-full h-36 p-3 text-xs text-gray-700 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-indigo-400 font-mono"
              />
              {importStatus === 'error' && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertTriangle size={13} /> 格式錯誤，請確認備份碼是否完整
                </p>
              )}
              {importStatus === 'success' && (
                <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                  <CheckCircle size={13} /> 還原成功！
                </p>
              )}
            </div>
            <div className="flex border-t border-gray-100">
              <button
                onClick={handleClosePasteModal}
                className="flex-1 py-4 text-gray-600 font-medium hover:bg-gray-50 transition text-sm"
              >
                取消
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={handlePasteImport}
                disabled={!pasteText.trim() || importStatus === 'success'}
                className="flex-1 py-4 text-indigo-600 font-medium hover:bg-indigo-50 disabled:text-gray-300 transition text-sm"
              >
                還原資料
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
