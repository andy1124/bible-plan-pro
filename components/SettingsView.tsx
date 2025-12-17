import React, { useState } from 'react';
import { UserSettings } from '../types';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { BIBLE_VERSIONS } from '../services/bibleContentService';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const [showVersionPicker, setShowVersionPicker] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, startDate: e.target.value });
  };

  const toggleNotifications = () => {
    onUpdateSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, notificationTime: e.target.value });
  };

  const handleVersionChange = (versionDisplayName: string) => {
    onUpdateSettings({ ...settings, bibleVersion: versionDisplayName });
    setShowVersionPicker(false);
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

      {/* Notification Settings */}
      <div className="mb-6">
        <h2 className="text-sm text-gray-500 mb-2 ml-2">通知</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-100">
            <span className="text-base">允許推送通知</span>
            <button
              onClick={toggleNotifications}
              className={`w-12 h-7 rounded-full transition-colors relative ${settings.notificationsEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${settings.notificationsEnabled ? 'left-[22px]' : 'left-0.5'}`}></div>
            </button>
          </div>
          <div className="p-4 flex justify-between items-center">
            <span className="text-base">提醒時間</span>
            <input
              type="time"
              value={settings.notificationTime}
              onChange={handleTimeChange}
              className="bg-gray-100 rounded px-2 py-1 text-gray-800"
              disabled={!settings.notificationsEnabled}
            />
          </div>
          <div className="p-3 text-xs text-gray-400 bg-gray-50">
            你將會在 {settings.notificationTime} 收到閱讀提醒
          </div>
        </div>
      </div>

      {/* About */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <span className="text-base">在 App Store 中評價</span>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400 text-sm">
          Version: 1.3.0 (Bible Content Update)
        </div>
      </div>
    </div>
  );
};

export default SettingsView;