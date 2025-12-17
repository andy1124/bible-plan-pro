import { BIBLE_BOOKS, MOCK_BIBLE_CONTENT } from '../constants';
import { Book, PlanDay, Verse } from '../types';
import { differenceInDays, parseISO } from 'date-fns';
import { DayPlan, PlanReading, loadPlanData, getPlanByDayIndex } from './planParser';
import {
  loadBibleVersion,
  getBibleDataSync,
  getVersesFromBible,
  getVersionFromSettings,
  BibleVersion,
  isBibleVersionLoaded
} from './bibleContentService';

// Cache for plan data
let planDataCache: DayPlan[] | null = null;
let planDataLoading: Promise<DayPlan[]> | null = null;

// Current Bible version
let currentBibleVersion: BibleVersion = 'zh_cuv';

// Helper to find a book by ID
export const getBookById = (id: string): Book | undefined => {
  return BIBLE_BOOKS.find(b => b.id === id);
};

// Helper to find a book by Chinese name or ID
export const getBookByName = (name: string): Book | undefined => {
  return BIBLE_BOOKS.find(b => b.name === name || b.id === name);
};

/**
 * Initialize and load the plan data
 * Should be called early in the app lifecycle
 */
export const initializePlanData = async (): Promise<void> => {
  if (planDataCache) return;

  if (!planDataLoading) {
    planDataLoading = loadPlanData();
  }

  planDataCache = await planDataLoading;
};

/**
 * Initialize Bible data for a specific version
 */
export const initializeBibleData = async (version: BibleVersion = 'zh_cuv'): Promise<void> => {
  currentBibleVersion = version;
  await loadBibleVersion(version);
};

/**
 * Set the current Bible version based on settings
 */
export const setBibleVersion = async (settingsVersion: string): Promise<void> => {
  const version = getVersionFromSettings(settingsVersion);
  if (version !== currentBibleVersion) {
    currentBibleVersion = version;
    await loadBibleVersion(version);
  }
};

/**
 * Get plan data synchronously (returns empty if not loaded)
 * Use initializePlanData first to ensure data is available
 */
export const getPlanDataSync = (): DayPlan[] => {
  return planDataCache || [];
};

/**
 * Convert DayPlan to PlanDay format for backward compatibility
 */
const convertToPlanDay = (dayPlan: DayPlan | null, dayIndex: number): PlanDay => {
  if (!dayPlan) {
    // Fallback to empty plan
    return {
      dayIndex: dayIndex,
      readings: [],
    };
  }

  return {
    dayIndex: dayPlan.dayIndex,
    readings: dayPlan.readings.map(r => ({
      bookId: r.bookId,
      chapterStart: r.chapterStart,
      chapterEnd: r.chapterEnd,
      verseStart: r.verseStart,
      verseEnd: r.verseEnd,
    })),
  };
};

/**
 * Get the reading plan for a specific day index (0-364)
 */
export const getReadingForDay = (dayIndex: number): PlanDay => {
  const normalizedDay = Math.abs(dayIndex % 365);
  const planData = getPlanDataSync();

  if (planData.length === 0) {
    // Return empty plan if data not loaded yet
    return {
      dayIndex: normalizedDay,
      readings: [],
    };
  }

  const dayPlan = getPlanByDayIndex(normalizedDay, planData);
  return convertToPlanDay(dayPlan, normalizedDay);
};

/**
 * Get the plan for a specific date based on start date
 * The day index is calculated as the difference between target date and start date
 */
export const getPlanForDate = (targetDate: Date, startDateStr: string): PlanDay => {
  const startDate = parseISO(startDateStr);
  const diff = differenceInDays(targetDate, startDate);

  // If date is before start date, show Day 0
  let dayIndex = diff;
  if (dayIndex < 0) dayIndex = 0;

  return getReadingForDay(dayIndex);
};

/**
 * Get the day number (1-365) for a specific date
 */
export const getDayNumberForDate = (targetDate: Date, startDateStr: string): number => {
  const startDate = parseISO(startDateStr);
  const diff = differenceInDays(targetDate, startDate);

  if (diff < 0) return 1;

  // Return 1-365 (wrapping after 365 days)
  return (diff % 365) + 1;
};

/**
 * Get the raw text description for a day's reading
 */
export const getRawTextForDate = (targetDate: Date, startDateStr: string): string => {
  const startDate = parseISO(startDateStr);
  const diff = differenceInDays(targetDate, startDate);

  let dayIndex = diff;
  if (dayIndex < 0) dayIndex = 0;

  const normalizedDay = Math.abs(dayIndex % 365);
  const planData = getPlanDataSync();

  const dayPlan = getPlanByDayIndex(normalizedDay, planData);
  return dayPlan?.rawText || '';
};

/**
 * Get verses for a specific book and chapter
 * Uses real Bible content if loaded, otherwise falls back to mock data
 */
export const getVerses = (bookId: string, chapter: number): Verse[] => {
  // Try to get from real Bible data first
  const bibleData = getBibleDataSync(currentBibleVersion);
  const book = getBookById(bookId);
  const bookName = book?.name || bookId;

  if (bibleData.length > 0) {
    const verses = getVersesFromBible(bibleData, bookId, chapter, bookName);
    if (verses.length > 0) {
      return verses;
    }
  }

  // Fallback to mock data
  const key = `${bookId}-${chapter}`;
  if (MOCK_BIBLE_CONTENT[key]) {
    return MOCK_BIBLE_CONTENT[key];
  }

  // Return placeholder if nothing found
  return Array.from({ length: 10 }).map((_, i) => ({
    bookId,
    bookName,
    chapter,
    verse: i + 1,
    text: `(載入中...) 請稍候，正在載入 ${bookName} 第 ${chapter} 章經文...`,
  }));
};

/**
 * Get verses asynchronously, ensuring Bible data is loaded
 */
export const getVersesAsync = async (bookId: string, chapter: number, settingsVersion?: string): Promise<Verse[]> => {
  // Set version if provided
  if (settingsVersion) {
    await setBibleVersion(settingsVersion);
  } else if (!isBibleVersionLoaded(currentBibleVersion)) {
    await loadBibleVersion(currentBibleVersion);
  }

  return getVerses(bookId, chapter);
};