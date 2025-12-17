import React, { useState, useMemo } from 'react';
import { UserSettings, CheckList, PlanDay } from '../types';
import { getPlanForDate, getBookById, getDayNumberForDate } from '../services/bibleService';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
  differenceInDays
} from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, ChevronRight as ChevronIcon } from 'lucide-react';

interface PlanViewProps {
  settings: UserSettings;
  checkedReadings: CheckList;
  onToggleCheck: (key: string) => void;
  onNavigateToBible: (bookId: string, chapter: number) => void;
}

const TOTAL_PLAN_DAYS = 365;
const WEEKDAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

/**
 * Format reading range for display
 */
const formatReadingRange = (reading: PlanDay['readings'][0]): string => {
  const { chapterStart, chapterEnd, verseStart, verseEnd } = reading;

  if (verseStart !== undefined && verseEnd !== undefined) {
    if (chapterStart === chapterEnd) {
      return `${chapterStart}:${verseStart}-${verseEnd}`;
    }
    return `${chapterStart}:${verseStart} - ${chapterEnd}:${verseEnd}`;
  }

  if (chapterStart === chapterEnd) {
    return `${chapterStart}`;
  }
  return `${chapterStart}-${chapterEnd}`;
};

/**
 * Check if a date is within the plan range (365 days from start)
 */
const isDateInPlanRange = (date: Date, startDateStr: string): boolean => {
  const startDate = parseISO(startDateStr);
  const diff = differenceInDays(date, startDate);
  return diff >= 0 && diff < TOTAL_PLAN_DAYS;
};

/**
 * Check if all readings for a date are completed
 */
const isDayCompleted = (date: Date, startDateStr: string, checkedReadings: CheckList): boolean => {
  const plan = getPlanForDate(date, startDateStr);
  if (plan.readings.length === 0) return false;

  const dateStr = format(date, 'yyyy-MM-dd');
  return plan.readings.every(reading => {
    const checkKey = `${dateStr}-${reading.bookId}-${reading.chapterStart}`;
    return !!checkedReadings[checkKey];
  });
};

/**
 * Check if at least one reading for a date is completed
 */
const isDayPartiallyCompleted = (date: Date, startDateStr: string, checkedReadings: CheckList): boolean => {
  const plan = getPlanForDate(date, startDateStr);
  if (plan.readings.length === 0) return false;

  const dateStr = format(date, 'yyyy-MM-dd');
  return plan.readings.some(reading => {
    const checkKey = `${dateStr}-${reading.bookId}-${reading.chapterStart}`;
    return !!checkedReadings[checkKey];
  });
};

const PlanView: React.FC<PlanViewProps> = ({ settings, checkedReadings, onToggleCheck, onNavigateToBible }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const plan = getPlanForDate(selectedDate, settings.startDate);
  const dayNumber = getDayNumberForDate(selectedDate, settings.startDate);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isInPlanRange = isDateInPlanRange(selectedDate, settings.startDate);

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleToday = () => {
    setSelectedDate(new Date());
    setCurrentMonth(new Date());
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Get the status indicator for a date
  const getDateStatus = (date: Date): 'completed' | 'partial' | 'pending' | 'outside' => {
    if (!isDateInPlanRange(date, settings.startDate)) {
      return 'outside';
    }
    if (isDayCompleted(date, settings.startDate, checkedReadings)) {
      return 'completed';
    }
    if (isDayPartiallyCompleted(date, settings.startDate, checkedReadings)) {
      return 'partial';
    }
    return 'pending';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Calendar Header */}
      <div className="flex-shrink-0 bg-white px-4 pt-4 pb-2 shadow-sm">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold">
              {format(currentMonth, 'M月 yyyy', { locale: zhTW })}
            </h2>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              className="text-blue-600 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-blue-50 transition"
              onClick={handleToday}
            >
              今日
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((day, index) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-gray-500'
                }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            const status = getDateStatus(day);
            const dayOfWeek = day.getDay();

            return (
              <button
                key={index}
                onClick={() => handleDateSelect(day)}
                className={`
                  relative flex flex-col items-center justify-center py-2 rounded-lg transition-all
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isSelected && !isToday ? 'bg-red-500 text-white' : ''}
                  ${isToday && !isSelected ? 'bg-blue-500 text-white' : ''}
                  ${isToday && isSelected ? 'bg-blue-500 text-white ring-2 ring-red-400 ring-offset-1' : ''}
                  ${!isSelected && !isToday && isCurrentMonth ? 'hover:bg-gray-100' : ''}
                `}
              >
                <span className={`
                  text-sm font-medium
                  ${isSelected || isToday ? 'text-white' : ''}
                  ${!isSelected && !isToday && dayOfWeek === 0 ? 'text-red-500' : ''}
                  ${!isSelected && !isToday && dayOfWeek === 6 ? 'text-blue-500' : ''}
                `}>
                  {format(day, 'd')}
                </span>

                {/* Status Indicator */}
                {status !== 'outside' && isCurrentMonth && (
                  <div className="mt-0.5">
                    {status === 'completed' && (
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected || isToday ? 'bg-white' : 'bg-green-500'}`} />
                    )}
                    {status === 'partial' && (
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected || isToday ? 'bg-white/60' : 'bg-yellow-500'}`} />
                    )}
                    {status === 'pending' && (
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected || isToday ? 'bg-white/40' : 'bg-gray-300'}`} />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500">已完成</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-500">部分完成</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="text-xs text-gray-500">未完成</span>
          </div>
        </div>
      </div>

      {/* Date Title */}
      <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-700 font-bold text-lg">
            {format(selectedDate, 'M月d日', { locale: zhTW })}
          </h3>
          {isInPlanRange ? (
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              第 {dayNumber} 天 / {TOTAL_PLAN_DAYS}
            </span>
          ) : (
            <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              不在計畫範圍內
            </span>
          )}
        </div>
      </div>

      {/* Reading List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-24">
        {!isInPlanRange ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-center">此日期不在您的 365 天讀經計畫範圍內</p>
          </div>
        ) : plan.readings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-center">此日期沒有讀經計畫</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plan.readings.map((reading, index) => {
              const book = getBookById(reading.bookId);
              const checkKey = `${dateStr}-${reading.bookId}-${reading.chapterStart}`;
              const isChecked = !!checkedReadings[checkKey];

              return (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer active:bg-gray-50 transition"
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
                        <CheckCircle className="text-green-500" size={28} />
                      ) : (
                        <Circle className="text-gray-300" size={28} />
                      )}
                    </button>
                    <div>
                      <h4 className={`font-bold ${isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {book?.name}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {book?.name} {formatReadingRange(reading)}
                      </p>
                    </div>
                  </div>
                  <ChevronIcon className="text-gray-300" size={20} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanView;