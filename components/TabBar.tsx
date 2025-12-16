import React from 'react';
import { Tab } from '../types';
import { Home, Calendar, BookOpen, Heart, Settings } from 'lucide-react';

interface TabBarProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ currentTab, onTabChange }) => {
  const getIcon = (tab: Tab, isActive: boolean) => {
    const color = isActive ? '#DC2626' : '#9CA3AF'; // red-600 vs gray-400
    switch (tab) {
      case Tab.HOME: return <Home color={color} size={24} />;
      case Tab.PLAN: return <Calendar color={color} size={24} />;
      case Tab.BIBLE: return <BookOpen color={color} size={24} />;
      case Tab.FAVORITES: return <Heart color={color} size={24} />;
      case Tab.SETTINGS: return <Settings color={color} size={24} />;
    }
  };

  const getLabel = (tab: Tab) => {
    switch (tab) {
      case Tab.HOME: return '今日';
      case Tab.PLAN: return '計劃';
      case Tab.BIBLE: return '聖經';
      case Tab.FAVORITES: return '金句';
      case Tab.SETTINGS: return '設置';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 pb-safe pt-2">
      <div className="flex justify-around items-center h-12">
        {Object.values(Tab).map((tab) => {
          const isActive = currentTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="flex flex-col items-center justify-center w-full active:scale-95 transition-transform"
            >
              <div className="mb-0.5">
                {getIcon(tab, isActive)}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-red-600' : 'text-gray-400'}`}>
                {getLabel(tab)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabBar;