import React, { useState, useEffect } from 'react';
import TabBar from './components/TabBar';
import HomeView from './components/HomeView';
import PlanView from './components/PlanView';
import BibleView from './components/BibleView';
import FavoritesView from './components/FavoritesView';
import SettingsView from './components/SettingsView';
import { Tab, UserSettings, CheckList, Verse } from './types';
import { format } from 'date-fns';

const DEFAULT_SETTINGS: UserSettings = {
  startDate: format(new Date(), 'yyyy-MM-dd'),
  bibleVersion: '和合本 (CUV)',
  notificationsEnabled: false,
  notificationTime: '08:00',
};

function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  
  // Persisted Data
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('bible_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [checkedReadings, setCheckedReadings] = useState<CheckList>(() => {
    const saved = localStorage.getItem('bible_checks');
    return saved ? JSON.parse(saved) : {};
  });

  const [favorites, setFavorites] = useState<Verse[]>(() => {
    const saved = localStorage.getItem('bible_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Navigation State for Deep Linking inside Bible Tab
  const [navTarget, setNavTarget] = useState<{ bookId: string; chapter: number } | null>(null);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('bible_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('bible_checks', JSON.stringify(checkedReadings));
  }, [checkedReadings]);

  useEffect(() => {
    localStorage.setItem('bible_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // --- Handlers ---

  const handleToggleCheck = (key: string) => {
    setCheckedReadings(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  const handleNavigateToBible = (bookId: string, chapter: number) => {
    setNavTarget({ bookId, chapter });
    setActiveTab(Tab.BIBLE);
  };

  const handleAddToFavorites = (verse: Verse) => {
    setFavorites(prev => {
       // Avoid duplicates
       if (prev.some(f => f.bookId === verse.bookId && f.chapter === verse.chapter && f.verse === verse.verse)) {
           return prev;
       }
       return [...prev, verse];
    });
  };

  const handleRemoveFavorite = (verse: Verse) => {
      setFavorites(prev => prev.filter(f => !(f.bookId === verse.bookId && f.chapter === verse.chapter && f.verse === verse.verse)));
  };

  const handleTabChange = (tab: Tab) => {
      setActiveTab(tab);
      // Reset nav target if navigating away from Bible manually, 
      // or if clicking Bible tab directly (optional UX choice)
      if (tab !== Tab.BIBLE) {
          setNavTarget(null);
      }
  };

  // --- View Rendering ---

  const renderContent = () => {
    switch (activeTab) {
      case Tab.HOME:
        return (
          <HomeView 
            settings={settings} 
            checkedReadings={checkedReadings} 
            onToggleCheck={handleToggleCheck}
            onNavigateToBible={handleNavigateToBible}
          />
        );
      case Tab.PLAN:
        return (
          <PlanView 
            settings={settings}
            checkedReadings={checkedReadings}
            onToggleCheck={handleToggleCheck}
            onNavigateToBible={handleNavigateToBible}
          />
        );
      case Tab.BIBLE:
        return (
          <BibleView 
             initialBookId={navTarget?.bookId}
             initialChapter={navTarget?.chapter}
             onAddToFavorites={handleAddToFavorites}
             favorites={favorites}
          />
        );
      case Tab.FAVORITES:
        return (
          <FavoritesView 
             favorites={favorites} 
             onRemove={handleRemoveFavorite}
          />
        );
      case Tab.SETTINGS:
        return (
          <SettingsView 
            settings={settings} 
            onUpdateSettings={setSettings} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 shadow-2xl overflow-hidden relative">
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        {renderContent()}
      </main>
      <TabBar currentTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default App;