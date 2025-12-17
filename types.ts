export enum Tab {
  HOME = 'HOME',
  PLAN = 'PLAN',
  BIBLE = 'BIBLE',
  FAVORITES = 'FAVORITES',
  SETTINGS = 'SETTINGS',
}

export interface Verse {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Book {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface PlanDay {
  dayIndex: number; // 0-364
  readings: {
    bookId: string;
    chapterStart: number;
    chapterEnd: number;
    verseStart?: number;
    verseEnd?: number;
  }[];
}

export interface UserSettings {
  startDate: string; // ISO Date string YYYY-MM-DD
  bibleVersion: string;
  notificationsEnabled: boolean;
  notificationTime: string;
}

export interface CheckList {
  [dateKey: string]: boolean; // 'YYYY-MM-DD-BookId-Chapter' : true
}