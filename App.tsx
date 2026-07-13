import React, { useState, useEffect } from 'react';
import TabBar from './components/TabBar';
import HomeView from './components/HomeView';
import PlanView from './components/PlanView';
import BibleView from './components/BibleView';
import FavoritesView from './components/FavoritesView';
import SettingsView from './components/SettingsView';
import ReadingView from './components/ReadingView';
import { Tab, UserSettings, CheckList, Verse, PlanDay } from './types';
import { format } from 'date-fns';
import { initializePlanData, initializeBibleData } from './services/bibleService';
import { getVersionFromSettings } from './services/bibleContentService';

const DEFAULT_SETTINGS: UserSettings = {
  startDate: format(new Date(), 'yyyy-MM-dd'),
  bibleVersion: '和合本 (CUV)',
  notificationsEnabled: false,
  notificationTime: '08:00',
};

// Reading target for plan-based navigation
interface ReadingTarget {
  reading: PlanDay['readings'][0];
  dateStr: string;
}

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

  // Navigation State for Reading View (plan-based multi-chapter reading)
  const [readingTarget, setReadingTarget] = useState<ReadingTarget | null>(null);

  const [planLoaded, setPlanLoaded] = useState(false);

  // PlanView date state — lifted here so it survives ReadingView overlay
  const [planSelectedDate, setPlanSelectedDate] = useState(new Date());
  const [planCurrentMonth, setPlanCurrentMonth] = useState(new Date());

  // --- Effects ---

  // Initialize plan and Bible data on app startup
  useEffect(() => {
    const initializeData = async () => {
      await initializePlanData();
      setPlanLoaded(true);
      // Preload Bible data based on user settings
      const version = getVersionFromSettings(settings.bibleVersion);
      await initializeBibleData(version);
    };
    initializeData();
  }, []);

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

  // New handler for navigating to reading view (multi-chapter plan reading)
  const handleNavigateToReading = (reading: PlanDay['readings'][0], dateStr: string) => {
    setReadingTarget({ reading, dateStr });
  };

  // Handler to close reading view
  const handleCloseReading = () => {
    setReadingTarget(null);
  };

  const handleToggleFavorite = (verse: Verse) => {
    setFavorites(prev => {
      const existingIndex = prev.findIndex(
        f => f.bookId === verse.bookId && f.chapter === verse.chapter && f.verse === verse.verse
      );

      if (existingIndex !== -1) {
        // Already favorited, remove it
        return prev.filter((_, index) => index !== existingIndex);
      }
      // Not favorited, add it
      return [...prev, verse];
    });
  };

  const handleRemoveFavorite = (verse: Verse) => {
    setFavorites(prev => prev.filter(f => !(f.bookId === verse.bookId && f.chapter === verse.chapter && f.verse === verse.verse)));
  };

  // --- Backup / Restore ---

  const handleExportData = (): string => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      checks: checkedReadings,
      favorites,
    };
    return JSON.stringify(data, null, 2);
  };

  const handleImportData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (
        !data.version ||
        !data.settings ||
        data.checks === undefined ||
        !Array.isArray(data.favorites)
      ) {
        return false;
      }
      setSettings(data.settings);
      setCheckedReadings(data.checks);
      setFavorites(data.favorites);
      return true;
    } catch {
      return false;
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    // Reset nav target if navigating away from Bible manually, 
    // or if clicking Bible tab directly (optional UX choice)
    if (tab !== Tab.BIBLE) {
      setNavTarget(null);
    }
    // Close reading view when changing tabs
    setReadingTarget(null);
  };

  // --- View Rendering ---

  const renderContent = () => {
    // If reading target is set, show ReadingView overlay
    if (readingTarget) {
      return (
        <ReadingView
          reading={readingTarget.reading}
          dateStr={readingTarget.dateStr}
          onBack={handleCloseReading}
          onAddToFavorites={handleToggleFavorite}
          favorites={favorites}
          settings={settings}
        />
      );
    }

    switch (activeTab) {
      case Tab.HOME:
        return (
          <HomeView
            settings={settings}
            checkedReadings={checkedReadings}
            onToggleCheck={handleToggleCheck}
            onNavigateToReading={handleNavigateToReading}
          />
        );
      case Tab.PLAN:
        return (
          <PlanView
            settings={settings}
            checkedReadings={checkedReadings}
            onToggleCheck={handleToggleCheck}
            onNavigateToReading={handleNavigateToReading}
            selectedDate={planSelectedDate}
            onSelectedDateChange={setPlanSelectedDate}
            currentMonth={planCurrentMonth}
            onCurrentMonthChange={setPlanCurrentMonth}
          />
        );
      case Tab.BIBLE:
        return (
          <BibleView
            initialBookId={navTarget?.bookId}
            initialChapter={navTarget?.chapter}
            onAddToFavorites={handleToggleFavorite}
            favorites={favorites}
            settings={settings}
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
            onExportData={handleExportData}
            onImportData={handleImportData}
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
      {/* Hide TabBar when in ReadingView */}
      {!readingTarget && <TabBar currentTab={activeTab} onTabChange={handleTabChange} />}
    </div>
  );
}

export default App;