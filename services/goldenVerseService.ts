/**
 * Golden Verse Service
 * 
 * Loads golden verses from external file and fetches actual Bible content.
 */

import { BIBLE_BOOKS } from '../constants';

// Bible JSON file structure (same as bibleContentService)
interface BibleBook {
    abbrev: string;
    book?: string;
    chapters: string[][];
}

// Golden verse data structure
export interface GoldenVerse {
    bookName: string;
    reference: string;
    text: string;
}

// Mapping from Chinese book names to JSON abbreviations
const BOOK_NAME_TO_ABBREV: Record<string, string> = {
    // Old Testament
    '創世記': 'gn', '出埃及記': 'ex', '利未記': 'lv', '民數記': 'nm', '申命記': 'dt',
    '約書亞記': 'js', '士師記': 'jg', '路得記': 'rt', '撒母耳記上': '1sm', '撒母耳記下': '2sm',
    '列王紀上': '1kgs', '列王紀下': '2kgs', '歷代志上': '1ch', '歷代志下': '2ch',
    '以斯拉記': 'ezr', '尼希米記': 'ne', '以斯帖記': 'et', '約伯記': 'jb',
    '詩篇': 'ps', '箴言': 'prv', '傳道書': 'ec', '雅歌': 'so',
    '以賽亞書': 'is', '耶利米書': 'jr', '耶利米哀歌': 'lm', '以西結書': 'ez',
    '但以理書': 'dn', '何西阿書': 'ho', '約珥書': 'jl', '阿摩司書': 'am',
    '俄巴底亞書': 'ob', '約拿書': 'jn', '彌迦書': 'mi', '那鴻書': 'na',
    '哈巴谷書': 'hk', '西番雅書': 'zp', '哈該書': 'hg', '撒迦利亞書': 'zc', '瑪拉基書': 'ml',
    // New Testament
    '馬太福音': 'mt', '馬可福音': 'mk', '路加福音': 'lk', '約翰福音': 'jo',
    '使徒行傳': 'act', '羅馬書': 'rm', '哥林多前書': '1co', '哥林多後書': '2co',
    '加拉太書': 'gl', '以弗所書': 'eph', '腓立比書': 'ph', '歌羅西書': 'cl',
    '帖撒羅尼迦前書': '1ts', '帖撒羅尼迦後書': '2ts', '提摩太前書': '1tm', '提摩太後書': '2tm',
    '提多書': 'tt', '腓利門書': 'phm', '希伯來書': 'hb', '雅各書': 'jm',
    '彼得前書': '1pe', '彼得後書': '2pe', '約翰一書': '1jo', '約翰二書': '2jo',
    '約翰三書': '3jo', '猶大書': 'jd', '啟示錄': 're',
};

// Get base URL for correct path in both dev and production (GitHub Pages)
const getBaseUrl = (): string => import.meta.env.BASE_URL || '/';

// Cache for loaded data
let versesListCache: string[] | null = null;
let bibleDataCache: BibleBook[] | null = null;
let goldenVersesCache: GoldenVerse[] | null = null;

/**
 * Parse a verse reference like "13:4-5" or "3:16"
 * Returns { chapter, verseStart, verseEnd }
 */
function parseReference(reference: string): { chapter: number; verseStart: number; verseEnd: number } {
    const parts = reference.split(':');
    const chapter = parseInt(parts[0], 10);

    const versePart = parts[1];
    if (versePart.includes('-')) {
        const [start, end] = versePart.split('-').map(v => parseInt(v, 10));
        return { chapter, verseStart: start, verseEnd: end };
    }

    const verse = parseInt(versePart, 10);
    return { chapter, verseStart: verse, verseEnd: verse };
}

/**
 * Load the verses list from external file
 */
async function loadVersesList(): Promise<string[]> {
    if (versesListCache) {
        return versesListCache;
    }

    try {
        const response = await fetch(`${getBaseUrl()}golden_verses/verses.txt`);
        if (!response.ok) {
            throw new Error('Failed to load verses list');
        }
        const text = await response.text();
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        versesListCache = lines;
        console.log(`Loaded ${lines.length} golden verse references`);
        return lines;
    } catch (error) {
        console.error('Error loading verses list:', error);
        return [];
    }
}

/**
 * Load Bible data (zh_cuv.json)
 */
async function loadBibleData(): Promise<BibleBook[]> {
    if (bibleDataCache) {
        return bibleDataCache;
    }

    try {
        const response = await fetch(`${getBaseUrl()}bible/zh_cuv.json`);
        if (!response.ok) {
            throw new Error('Failed to load Bible data');
        }
        const data: BibleBook[] = await response.json();
        bibleDataCache = data;
        return data;
    } catch (error) {
        console.error('Error loading Bible data:', error);
        return [];
    }
}

/**
 * Get text for a verse reference from Bible data
 */
function getVerseText(
    bibleData: BibleBook[],
    bookName: string,
    chapter: number,
    verseStart: number,
    verseEnd: number
): string {
    const abbrev = BOOK_NAME_TO_ABBREV[bookName];
    if (!abbrev) {
        console.warn('Unknown book name:', bookName);
        return '';
    }

    const book = bibleData.find(b => b.abbrev === abbrev);
    if (!book) {
        console.warn('Book not found in Bible data:', bookName, abbrev);
        return '';
    }

    const chapterIndex = chapter - 1;
    if (chapterIndex < 0 || chapterIndex >= book.chapters.length) {
        console.warn('Chapter out of range:', chapter, 'for book', bookName);
        return '';
    }

    const chapterVerses = book.chapters[chapterIndex];
    const verses: string[] = [];

    for (let v = verseStart; v <= verseEnd && v <= chapterVerses.length; v++) {
        const verseIndex = v - 1;
        if (verseIndex >= 0 && verseIndex < chapterVerses.length) {
            verses.push(chapterVerses[verseIndex].trim());
        }
    }

    return verses.join(' ');
}

/**
 * Parse a verse line like "哥林多前書 13:4-5"
 * Returns { bookName, reference } or null if invalid
 */
function parseVerseLine(line: string): { bookName: string; reference: string } | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Match pattern: BookName Chapter:Verse(-Verse)
    // Example: "哥林多前書 13:4-5"
    const match = trimmed.match(/^(.+?)\s+(\d+:\d+(?:-\d+)?)$/);

    if (!match) {
        console.warn('Could not parse verse line:', line);
        return null;
    }

    return {
        bookName: match[1].trim(),
        reference: match[2].trim()
    };
}

/**
 * Initialize and load all golden verses with actual Bible text
 */
export async function loadGoldenVerses(): Promise<GoldenVerse[]> {
    if (goldenVersesCache) {
        return goldenVersesCache;
    }

    try {
        // Load both resources in parallel
        const [versesList, bibleData] = await Promise.all([
            loadVersesList(),
            loadBibleData()
        ]);

        if (versesList.length === 0 || bibleData.length === 0) {
            console.warn('Failed to load required data for golden verses');
            return getFallbackVerses();
        }

        const goldenVerses: GoldenVerse[] = [];

        for (const line of versesList) {
            const parsed = parseVerseLine(line);
            if (!parsed) continue;

            const { chapter, verseStart, verseEnd } = parseReference(parsed.reference);
            const text = getVerseText(bibleData, parsed.bookName, chapter, verseStart, verseEnd);

            if (text) {
                goldenVerses.push({
                    bookName: parsed.bookName,
                    reference: parsed.reference,
                    text: text
                });
            }
        }

        console.log(`Loaded ${goldenVerses.length} golden verses with text`);
        goldenVersesCache = goldenVerses;
        return goldenVerses;

    } catch (error) {
        console.error('Error loading golden verses:', error);
        return getFallbackVerses();
    }
}

/**
 * Get a random golden verse for today (deterministic based on date)
 */
export function getDailyVerse(verses: GoldenVerse[], date: Date = new Date()): GoldenVerse {
    if (verses.length === 0) {
        return getFallbackVerses()[0];
    }

    // Use day of year as seed for consistent daily verse
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    const index = dayOfYear % verses.length;
    return verses[index];
}

/**
 * Fallback verses in case loading fails
 */
function getFallbackVerses(): GoldenVerse[] {
    return [
        { bookName: '詩篇', reference: '119:105', text: '你的話是我腳前的燈，是我路上的光。' },
        { bookName: '腓立比書', reference: '4:13', text: '我靠著那加給我力量的，凡事都能做。' },
        { bookName: '約翰福音', reference: '3:16', text: '神愛世人，甚至將他的獨生子賜給他們，叫一切信他的，不至滅亡，反得永生。' },
    ];
}

/**
 * Clear cache (useful for testing)
 */
export function clearGoldenVersesCache(): void {
    versesListCache = null;
    bibleDataCache = null;
    goldenVersesCache = null;
}
