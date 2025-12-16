import { BIBLE_BOOKS, MOCK_BIBLE_CONTENT } from '../constants';
import { Book, PlanDay, Verse } from '../types';
import { differenceInDays, addDays, format, parseISO } from 'date-fns';

// Helper to find a book by ID
export const getBookById = (id: string): Book | undefined => {
  return BIBLE_BOOKS.find(b => b.id === id);
};

// Simulate a 1-year reading plan algorithm
// In a real app, this would map 0-364 to specific ranges via a static JSON file
export const getReadingForDay = (dayIndex: number): PlanDay => {
  // Normalize to 365 days
  const normalizedDay = Math.abs(dayIndex % 365);
  
  // Logic: 
  // OT: Cycle through roughly 3 chapters
  // NT: Cycle through roughly 1 chapter
  // Psa/Pro: 1 chapter
  
  // Simplified Mock Plan for Demo purposes:
  const otBookIndex = Math.floor(normalizedDay / 10) % BIBLE_BOOKS.filter(b => b.testament === 'OT').length;
  const ntBookIndex = Math.floor(normalizedDay / 20) % BIBLE_BOOKS.filter(b => b.testament === 'NT').length;
  
  const otBook = BIBLE_BOOKS.filter(b => b.testament === 'OT')[otBookIndex];
  const ntBook = BIBLE_BOOKS.filter(b => b.testament === 'NT')[ntBookIndex];

  return {
    dayIndex: normalizedDay,
    readings: [
      {
        bookId: otBook.id,
        chapterStart: (normalizedDay % otBook.chapters) + 1,
        chapterEnd: (normalizedDay % otBook.chapters) + 1,
      },
      {
        bookId: ntBook.id,
        chapterStart: (normalizedDay % ntBook.chapters) + 1,
        chapterEnd: (normalizedDay % ntBook.chapters) + 1,
      }
    ]
  };
};

export const getPlanForDate = (targetDate: Date, startDateStr: string): PlanDay => {
  const startDate = parseISO(startDateStr);
  const diff = differenceInDays(targetDate, startDate);
  
  // If date is before start date, we can either show Day 1 or handle negative.
  // Assuming the plan wraps around or repeats:
  let dayIndex = diff;
  if (dayIndex < 0) dayIndex = 0; 
  
  return getReadingForDay(dayIndex);
};

export const getVerses = (bookId: string, chapter: number): Verse[] => {
  const key = `${bookId}-${chapter}`;
  if (MOCK_BIBLE_CONTENT[key]) {
    return MOCK_BIBLE_CONTENT[key];
  }
  
  // Return placeholder if not in mock data
  const book = getBookById(bookId);
  return Array.from({ length: 10 }).map((_, i) => ({
    bookId,
    bookName: book?.name || bookId,
    chapter,
    verse: i + 1,
    text: `(示範經文) 這是 ${book?.name} 第 ${chapter} 章第 ${i + 1} 節的內容。請整合完整 JSON 檔案以顯示真實經文。`,
  }));
};