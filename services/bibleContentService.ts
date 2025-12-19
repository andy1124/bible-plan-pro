/**
 * Bible Content Service
 * 
 * Loads and provides access to real Bible content from JSON files.
 * Supports multiple Bible versions: KJV (English), CUV (Chinese), NCV (New Chinese Version)
 */

import { Verse } from '../types';

// Bible JSON file structure
export interface BibleBook {
    abbrev: string;
    book?: string;  // Book name (may not be present in all JSON files)
    chapters: string[][];
}

export type BibleVersion = 'zh_cuv' | 'zh_ncv' | 'en_kjv';

export interface BibleVersionInfo {
    id: BibleVersion;
    name: string;
    displayName: string;
    file: string;
}

// Get base URL for correct path in both dev and production (GitHub Pages)
const getBaseUrl = (): string => import.meta.env.BASE_URL || '/';

// Available Bible versions
export const BIBLE_VERSIONS: BibleVersionInfo[] = [
    { id: 'zh_cuv', name: '和合本', displayName: '和合本 (CUV)', file: 'bible/zh_cuv.json' },
    { id: 'zh_ncv', name: '新譯本', displayName: '新譯本 (NCV)', file: 'bible/zh_ncv.json' },
    { id: 'en_kjv', name: 'KJV', displayName: 'King James Version', file: 'bible/en_kjv.json' },
];

// Mapping from our book IDs to JSON abbreviations
const BOOK_ID_TO_ABBREV: Record<string, string> = {
    // Old Testament
    'Gen': 'gn', 'Exo': 'ex', 'Lev': 'lv', 'Num': 'nm', 'Deu': 'dt',
    'Jos': 'js', 'Jdg': 'jg', 'Rut': 'rt', '1Sa': '1sm', '2Sa': '2sm',
    '1Ki': '1kgs', '2Ki': '2kgs', '1Ch': '1ch', '2Ch': '2ch',
    'Ezr': 'ezr', 'Neh': 'ne', 'Est': 'et', 'Job': 'jb',
    'Psa': 'ps', 'Pro': 'prv', 'Ecc': 'ec', 'Sng': 'so',
    'Isa': 'is', 'Jer': 'jr', 'Lam': 'lm', 'Ezk': 'ez',
    'Dan': 'dn', 'Hos': 'ho', 'Jol': 'jl', 'Amo': 'am',
    'Oba': 'ob', 'Jon': 'jn', 'Mic': 'mi', 'Nam': 'na',
    'Hab': 'hk', 'Zep': 'zp', 'Hag': 'hg', 'Zec': 'zc', 'Mal': 'ml',
    // New Testament
    'Mat': 'mt', 'Mar': 'mk', 'Luk': 'lk', 'Joh': 'jo',
    'Act': 'act', 'Rom': 'rm', '1Co': '1co', '2Co': '2co',
    'Gal': 'gl', 'Eph': 'eph', 'Php': 'ph', 'Col': 'cl',
    '1Th': '1ts', '2Th': '2ts', '1Ti': '1tm', '2Ti': '2tm',
    'Tit': 'tt', 'Phm': 'phm', 'Heb': 'hb', 'Jas': 'jm',
    '1Pe': '1pe', '2Pe': '2pe', '1Jn': '1jo', '2Jn': '2jo',
    '3Jn': '3jo', 'Jud': 'jd', 'Rev': 're',
};

// Cache for loaded Bible data
const bibleCache: Map<BibleVersion, BibleBook[]> = new Map();
const loadingPromises: Map<BibleVersion, Promise<BibleBook[]>> = new Map();

/**
 * Load Bible data for a specific version
 */
export async function loadBibleVersion(version: BibleVersion): Promise<BibleBook[]> {
    // Check cache first
    if (bibleCache.has(version)) {
        return bibleCache.get(version)!;
    }

    // Check if already loading
    if (loadingPromises.has(version)) {
        return loadingPromises.get(version)!;
    }

    // Find version info
    const versionInfo = BIBLE_VERSIONS.find(v => v.id === version);
    if (!versionInfo) {
        console.error('Unknown Bible version:', version);
        return [];
    }

    // Create loading promise
    const loadPromise = (async () => {
        try {
            console.log('Loading Bible version:', version);
            // Use BASE_URL for correct path in both dev and production
            const fileUrl = `${getBaseUrl()}${versionInfo.file}`;
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Failed to load Bible: ${response.status}`);
            }
            const data: BibleBook[] = await response.json();
            console.log(`Loaded ${data.length} books for ${version}`);
            bibleCache.set(version, data);
            return data;
        } catch (error) {
            console.error('Error loading Bible version:', version, error);
            return [];
        } finally {
            loadingPromises.delete(version);
        }
    })();

    loadingPromises.set(version, loadPromise);
    return loadPromise;
}

/**
 * Get Bible data synchronously (returns empty if not loaded)
 */
export function getBibleDataSync(version: BibleVersion): BibleBook[] {
    return bibleCache.get(version) || [];
}

/**
 * Find a book in the loaded Bible data by book ID
 */
export function findBookInBible(books: BibleBook[], bookId: string): BibleBook | undefined {
    const abbrev = BOOK_ID_TO_ABBREV[bookId];
    if (!abbrev) {
        console.warn('Unknown book ID:', bookId);
        return undefined;
    }
    return books.find(b => b.abbrev === abbrev);
}

/**
 * Get verses for a specific book and chapter
 */
export function getVersesFromBible(
    books: BibleBook[],
    bookId: string,
    chapter: number,
    bookName: string
): Verse[] {
    const book = findBookInBible(books, bookId);
    if (!book) {
        console.warn('Book not found:', bookId);
        return [];
    }

    // Chapters are 0-indexed in the JSON
    const chapterIndex = chapter - 1;
    if (chapterIndex < 0 || chapterIndex >= book.chapters.length) {
        console.warn('Chapter out of range:', chapter, 'for book', bookId);
        return [];
    }

    const chapterVerses = book.chapters[chapterIndex];
    return chapterVerses.map((text, index) => ({
        bookId,
        bookName,
        chapter,
        verse: index + 1,
        text: text.trim(),
    }));
}

/**
 * Get verses for a specific range (chapter:verseStart - verseEnd)
 */
export function getVerseRangeFromBible(
    books: BibleBook[],
    bookId: string,
    chapter: number,
    verseStart: number,
    verseEnd: number,
    bookName: string
): Verse[] {
    const allVerses = getVersesFromBible(books, bookId, chapter, bookName);
    return allVerses.filter(v => v.verse >= verseStart && v.verse <= verseEnd);
}

/**
 * Get the total number of verses in a chapter
 */
export function getChapterVerseCount(books: BibleBook[], bookId: string, chapter: number): number {
    const book = findBookInBible(books, bookId);
    if (!book) return 0;

    const chapterIndex = chapter - 1;
    if (chapterIndex < 0 || chapterIndex >= book.chapters.length) return 0;

    return book.chapters[chapterIndex].length;
}

/**
 * Check if Bible version is loaded
 */
export function isBibleVersionLoaded(version: BibleVersion): boolean {
    return bibleCache.has(version);
}

/**
 * Clear cached Bible data for a version
 */
export function clearBibleCache(version?: BibleVersion): void {
    if (version) {
        bibleCache.delete(version);
    } else {
        bibleCache.clear();
    }
}

/**
 * Get version info by settings string
 */
export function getVersionFromSettings(settingsVersion: string): BibleVersion {
    // Map user-facing version names to internal IDs
    if (settingsVersion.includes('和合本') || settingsVersion.includes('CUV')) {
        return 'zh_cuv';
    }
    if (settingsVersion.includes('新譯本') || settingsVersion.includes('NCV')) {
        return 'zh_ncv';
    }
    if (settingsVersion.includes('KJV') || settingsVersion.includes('King James')) {
        return 'en_kjv';
    }
    // Default to CUV
    return 'zh_cuv';
}
