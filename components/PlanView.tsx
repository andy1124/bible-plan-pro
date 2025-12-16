import React, { useState, useEffect } from 'react';
import { UserSettings, CheckList } from '../types';
import { getPlanForDate, getBookById } from '../services/bibleService';
import { format, addDays, subDays } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, ChevronRight as ChevronIcon } from 'lucide-react';

interface PlanViewProps {
  settings: UserSettings;
  checkedReadings: CheckList;
  onToggleCheck: (key: string) => void;
  onNavigateToBible: (bookId: string, chapter: number) => void;
}

const PlanView: React.FC<PlanViewProps> = ({ settings, checkedReadings, onToggleCheck, onNavigateToBible }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const plan = getPlanForDate(selectedDate, settings.startDate);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const monthYearStr = format(selectedDate, 'MM月 yyyy', { locale: zhTW });

  const handlePrevDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
      {/* Calendar Strip Header */}
      <div className="bg-white pt-4 pb-4 px-4 shadow-sm z-10 sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">{monthYearStr}</h2>
          <div className="flex space-x-2">
            <button className="text-red-600 font-bold text-sm" onClick={() => setSelectedDate(new Date())}>
              今日
            </button>
          </div>
        </div>

        {/* Simple Day Navigation */}
        <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
            <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-white transition">
                <ChevronLeft size={20} />
            </button>
            <div className="font-semibold text-lg">
                {format(selectedDate, 'yyyy-MM-dd')}
            </div>
            <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-white transition">
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      {/* Date Title */}
      <div className="px-4 py-4">
        <h3 className="text-gray-500 font-bold">{format(selectedDate, 'MM月dd日', { locale: zhTW })}</h3>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        {plan.readings.map((reading, index) => {
           const book = getBookById(reading.bookId);
           const checkKey = `${dateStr}-${reading.bookId}-${reading.chapterStart}`;
           const isChecked = !!checkedReadings[checkKey];

           return (
             <div 
                key={index} 
                className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer"
                onClick={() => onNavigateToBible(reading.bookId, reading.chapterStart)}
             >
                <div className="flex items-center space-x-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCheck(checkKey);
                        }}
                    >
                        {isChecked ? (
                            <CheckCircle className="text-gray-400" size={28} />
                        ) : (
                            <Circle className="text-gray-300" size={28} />
                        )}
                    </button>
                    <div>
                        <h4 className={`font-bold ${isChecked ? 'text-gray-400' : 'text-gray-800'}`}>
                            {book?.name}
                        </h4>
                        <p className="text-gray-500 text-sm">
                             {book?.name} {reading.chapterStart} -- {reading.chapterEnd}
                        </p>
                    </div>
                </div>
                <ChevronIcon className="text-gray-300" size={20} />
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default PlanView;