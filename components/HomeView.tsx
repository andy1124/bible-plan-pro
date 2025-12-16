import React, { useMemo } from 'react';
import { UserSettings, CheckList, Tab } from '../types';
import { GOLDEN_VERSES } from '../constants';
import { getPlanForDate, getBookById } from '../services/bibleService';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { CheckCircle, Circle } from 'lucide-react';

interface HomeViewProps {
  settings: UserSettings;
  checkedReadings: CheckList;
  onToggleCheck: (key: string) => void;
  onNavigateToBible: (bookId: string, chapter: number) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ settings, checkedReadings, onToggleCheck, onNavigateToBible }) => {
  const today = new Date();
  
  // Random Golden Verse (stable for the session usually, but for now random on render)
  // To make it stable per day, we could seed it with the date string.
  const dailyVerse = useMemo(() => {
    const seed = today.getDate() % GOLDEN_VERSES.length;
    return GOLDEN_VERSES[seed];
  }, []);

  const plan = getPlanForDate(today, settings.startDate);
  const dateStr = format(today, 'yyyy-MM-dd');
  const displayDate = format(today, 'yyyy年 M月 d日', { locale: zhTW });

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{displayDate}</h1>
      </div>

      {/* Golden Verse Card */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-lg font-medium leading-relaxed mb-4">
          {dailyVerse.text}
        </p>
        <div className="text-right text-sm opacity-90 font-bold">
          {dailyVerse.bookName} {dailyVerse.reference}
        </div>
      </div>

      {/* Progress Bar (Mock) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span>2025</span>
          <span>2026</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
        </div>
      </div>

      {/* Today's Reading List */}
      <div className="grid grid-cols-1 gap-4">
        {plan.readings.map((reading, index) => {
          const book = getBookById(reading.bookId);
          const checkKey = `${dateStr}-${reading.bookId}-${reading.chapterStart}`;
          const isChecked = !!checkedReadings[checkKey];

          return (
            <div 
              key={index} 
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-50"
              onClick={() => onNavigateToBible(reading.bookId, reading.chapterStart)}
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCheck(checkKey);
                  }}
                  className="focus:outline-none"
                >
                  {isChecked ? (
                    <CheckCircle className="text-gray-400" size={28} />
                  ) : (
                    <Circle className="text-gray-300" size={28} />
                  )}
                </button>
                
                <div>
                  <h3 className={`font-bold text-lg ${isChecked ? 'text-gray-400' : 'text-gray-800'}`}>
                    {book?.name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {book?.name} {reading.chapterStart}
                    {reading.chapterEnd !== reading.chapterStart ? ` - ${reading.chapterEnd}` : ''}
                  </p>
                </div>
              </div>

              {/* Tag / Category */}
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${book?.testament === 'OT' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'}`}>
                {book?.testament === 'OT' ? '舊約' : '新約'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeView;