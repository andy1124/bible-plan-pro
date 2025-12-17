import React, { useMemo } from 'react';
import { UserSettings, CheckList, Tab, PlanDay } from '../types';
import { GOLDEN_VERSES } from '../constants';
import { getPlanForDate, getBookById, getDayNumberForDate } from '../services/bibleService';
import { format, parseISO, addDays } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { CheckCircle, Circle } from 'lucide-react';

const TOTAL_PLAN_DAYS = 365;

interface HomeViewProps {
  settings: UserSettings;
  checkedReadings: CheckList;
  onToggleCheck: (key: string) => void;
  onNavigateToBible: (bookId: string, chapter: number) => void;
}

/**
 * Format reading range for display
 * Examples: "1-3", "5:1-26", "119:1-88"
 */
const formatReadingRange = (reading: PlanDay['readings'][0]): string => {
  const { chapterStart, chapterEnd, verseStart, verseEnd } = reading;

  if (verseStart !== undefined && verseEnd !== undefined) {
    // Has verse specification
    if (chapterStart === chapterEnd) {
      return `${chapterStart}:${verseStart}-${verseEnd}`;
    }
    // Different chapters with verses (rare but possible)
    return `${chapterStart}:${verseStart} - ${chapterEnd}:${verseEnd}`;
  }

  // Chapter only
  if (chapterStart === chapterEnd) {
    return `${chapterStart}`;
  }
  return `${chapterStart}-${chapterEnd}`;
};

const HomeView: React.FC<HomeViewProps> = ({ settings, checkedReadings, onToggleCheck, onNavigateToBible }) => {
  const today = new Date();

  // Random Golden Verse (stable for the session usually, but for now random on render)
  // To make it stable per day, we could seed it with the date string.
  const dailyVerse = useMemo(() => {
    const seed = today.getDate() % GOLDEN_VERSES.length;
    return GOLDEN_VERSES[seed];
  }, []);

  const plan = getPlanForDate(today, settings.startDate);
  const dayNumber = getDayNumberForDate(today, settings.startDate);
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

      {/* Progress Bar */}
      {(() => {
        const startDate = parseISO(settings.startDate);
        const endDate = addDays(startDate, TOTAL_PLAN_DAYS - 1);
        const startYear = format(startDate, 'yyyy');
        const endYear = format(endDate, 'yyyy');
        const progressPercent = Math.min((dayNumber / TOTAL_PLAN_DAYS) * 100, 100);

        return (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between text-sm font-semibold mb-1">
              <span>{format(startDate, 'M/d', { locale: zhTW })} 開始</span>
              <span className="text-blue-600 font-bold">{dayNumber}/{TOTAL_PLAN_DAYS} 天</span>
              <span>{format(endDate, 'M/d', { locale: zhTW })} 結束</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>{startYear}</span>
              <span>{endYear}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        );
      })()}

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
                    {book?.name} {formatReadingRange(reading)}
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