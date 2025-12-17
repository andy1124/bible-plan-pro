/**
 * Plan Parser Service
 * 
 * Parses the bible_plan/plan file and provides reading data based on day index.
 * The plan file contains 365 days of reading assignments, organized by month.
 * We ignore the month headers and treat it as a sequential 365-day plan.
 */

export interface PlanReading {
    bookId: string;
    bookNameCn: string;
    bookNameEn: string;
    chapterStart: number;
    chapterEnd: number;
    verseStart?: number;
    verseEnd?: number;
}

export interface DayPlan {
    dayIndex: number; // 0-364 (365 days)
    readings: PlanReading[];
    rawText: string;
}

// Book name mapping: English abbreviation -> { id, chinese name }
const BOOK_MAPPING: Record<string, { id: string; cn: string }> = {
    // Old Testament
    'Genesis': { id: 'Gen', cn: '創世記' },
    'Exodus': { id: 'Exo', cn: '出埃及記' },
    'Leviticus': { id: 'Lev', cn: '利未記' },
    'Numbers': { id: 'Num', cn: '民數記' },
    'Deuteronomy': { id: 'Deu', cn: '申命記' },
    'Joshua': { id: 'Jos', cn: '約書亞記' },
    'Judges': { id: 'Jdg', cn: '士師記' },
    'Ruth': { id: 'Rut', cn: '路得記' },
    '1 Samuel': { id: '1Sa', cn: '撒母耳記上' },
    '2 Samuel': { id: '2Sa', cn: '撒母耳記下' },
    '1 Kings': { id: '1Ki', cn: '列王紀上' },
    '2 Kings': { id: '2Ki', cn: '列王紀下' },
    '1 Chronicles': { id: '1Ch', cn: '歷代志上' },
    '2 Chronicles': { id: '2Ch', cn: '歷代志下' },
    'Ezra': { id: 'Ezr', cn: '以斯拉記' },
    'Nehemiah': { id: 'Neh', cn: '尼希米記' },
    'Esther': { id: 'Est', cn: '以斯帖記' },
    'Job': { id: 'Job', cn: '約伯記' },
    'Psalms': { id: 'Psa', cn: '詩篇' },
    'Proverbs': { id: 'Pro', cn: '箴言' },
    'Ecclesiastes': { id: 'Ecc', cn: '傳道書' },
    'Song of Solomon': { id: 'Sng', cn: '雅歌' },
    'Isaiah': { id: 'Isa', cn: '以賽亞書' },
    'Jeremiah': { id: 'Jer', cn: '耶利米書' },
    'Lamentations': { id: 'Lam', cn: '耶利米哀歌' },
    'Ezekiel': { id: 'Ezk', cn: '以西結書' },
    'Daniel': { id: 'Dan', cn: '但以理書' },
    'Hosea': { id: 'Hos', cn: '何西阿書' },
    'Joel': { id: 'Jol', cn: '約珥書' },
    'Amos': { id: 'Amo', cn: '阿摩司書' },
    'Obadiah': { id: 'Oba', cn: '俄巴底亞書' },
    'Jonah': { id: 'Jon', cn: '約拿書' },
    'Micah': { id: 'Mic', cn: '彌迦書' },
    'Nahum': { id: 'Nam', cn: '那鴻書' },
    'Habakkuk': { id: 'Hab', cn: '哈巴谷書' },
    'Zephaniah': { id: 'Zep', cn: '西番雅書' },
    'Haggai': { id: 'Hag', cn: '哈該書' },
    'Zechariah': { id: 'Zec', cn: '撒迦利亞書' },
    'Malachi': { id: 'Mal', cn: '瑪拉基書' },
    // New Testament
    'Matthew': { id: 'Mat', cn: '馬太福音' },
    'Mark': { id: 'Mar', cn: '馬可福音' },
    'Luke': { id: 'Luk', cn: '路加福音' },
    'John': { id: 'Joh', cn: '約翰福音' },
    'Acts': { id: 'Act', cn: '使徒行傳' },
    'Romans': { id: 'Rom', cn: '羅馬書' },
    '1 Corinthians': { id: '1Co', cn: '哥林多前書' },
    '2 Corinthians': { id: '2Co', cn: '哥林多後書' },
    'Galatians': { id: 'Gal', cn: '加拉太書' },
    'Ephesians': { id: 'Eph', cn: '以弗所書' },
    'Philippians': { id: 'Php', cn: '腓立比書' },
    'Colossians': { id: 'Col', cn: '歌羅西書' },
    '1 Thessalonians': { id: '1Th', cn: '帖撒羅尼迦前書' },
    '2 Thessalonians': { id: '2Th', cn: '帖撒羅尼迦後書' },
    '1 Timothy': { id: '1Ti', cn: '提摩太前書' },
    '2 Timothy': { id: '2Ti', cn: '提摩太後書' },
    '2Timothy': { id: '2Ti', cn: '提摩太後書' }, // Handle typo in plan file
    'Titus': { id: 'Tit', cn: '提多書' },
    'Philemon': { id: 'Phm', cn: '腓利門書' },
    'Hebrews': { id: 'Heb', cn: '希伯來書' },
    'James': { id: 'Jas', cn: '雅各書' },
    '1 Peter': { id: '1Pe', cn: '彼得前書' },
    '2 Peter': { id: '2Pe', cn: '彼得後書' },
    '1 John': { id: '1Jn', cn: '約翰一書' },
    '2 John': { id: '2Jn', cn: '約翰二書' },
    '3 John': { id: '3Jn', cn: '約翰三書' },
    'Jude': { id: 'Jud', cn: '猶大書' },
    'Revelation': { id: 'Rev', cn: '啟示錄' },
};

/**
 * Parse a single reading segment like "Genesis(創)1-3" or "Matthew(太)5:1-26"
 */
function parseReadingSegment(segment: string): PlanReading | null {
    // Pattern: BookName(中文)Chapter:Verse-Chapter:Verse or BookName(中文)Chapter-Chapter
    // Examples:
    // "Genesis(創)1-3" -> Gen 1-3
    // "Matthew(太)5:1-26" -> Mat 5:1-26
    // "Psalms(詩)119:1-88" -> Psa 119:1-88

    const trimmed = segment.trim();
    if (!trimmed) return null;

    // Match pattern: BookName(chinese)ChapterInfo
    // ChapterInfo can be: 1, 1-3, 5:1-26, 119:1-88, 119:89-176
    const match = trimmed.match(/^(.+?)\s*\([^)]+\)\s*(.+)$/);

    if (!match) {
        console.warn('Could not parse reading segment:', segment);
        return null;
    }

    const bookNameEn = match[1].trim();
    const chapterInfo = match[2].trim();

    const bookData = BOOK_MAPPING[bookNameEn];
    if (!bookData) {
        console.warn('Unknown book name:', bookNameEn);
        return null;
    }

    // Parse chapter info
    // Cases: 
    // "1" -> chapter 1
    // "1-3" -> chapter 1 to 3
    // "5:1-26" -> chapter 5, verse 1-26
    // "119:1-88" -> chapter 119, verse 1-88

    const reading: PlanReading = {
        bookId: bookData.id,
        bookNameCn: bookData.cn,
        bookNameEn: bookNameEn,
        chapterStart: 1,
        chapterEnd: 1,
    };

    if (chapterInfo.includes(':')) {
        // Has verse specification
        const colonParts = chapterInfo.split(':');
        reading.chapterStart = parseInt(colonParts[0], 10);
        reading.chapterEnd = reading.chapterStart;

        // Parse verse range
        const versePart = colonParts[1];
        if (versePart.includes('-')) {
            const [verseStart, verseEnd] = versePart.split('-').map(v => parseInt(v, 10));
            reading.verseStart = verseStart;
            reading.verseEnd = verseEnd;
        } else {
            reading.verseStart = parseInt(versePart, 10);
            reading.verseEnd = reading.verseStart;
        }
    } else if (chapterInfo.includes('-')) {
        // Chapter range without verses
        const [start, end] = chapterInfo.split('-').map(c => parseInt(c, 10));
        reading.chapterStart = start;
        reading.chapterEnd = end;
    } else {
        // Single chapter
        reading.chapterStart = parseInt(chapterInfo, 10);
        reading.chapterEnd = reading.chapterStart;
    }

    return reading;
}

/**
 * Parse a single day line like "1 Genesis(創)1-3;Matthew(太)1"
 */
function parseDayLine(line: string): { dayNum: number; readings: PlanReading[] } | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Match pattern: DayNumber ReadingContent
    // Example: "1 Genesis(創)1-3;Matthew(太)1"
    const match = trimmed.match(/^(\d+)\s+(.+)$/);

    if (!match) {
        return null;
    }

    const dayNum = parseInt(match[1], 10);
    const readingsText = match[2];

    // Split by ; or ; and parse each segment
    const segments = readingsText.split(/[;；]/).filter(s => s.trim());
    const readings: PlanReading[] = [];

    for (const segment of segments) {
        const reading = parseReadingSegment(segment);
        if (reading) {
            readings.push(reading);
        }
    }

    return { dayNum, readings };
}

/**
 * Check if a line is a month header
 */
function isMonthHeader(line: string): boolean {
    const monthPatterns = [
        /^January/i, /^February/i, /^March/i, /^April/i,
        /^May/i, /^June/i, /^July/i, /^August/i,
        /^September/i, /^October/i, /^November/i, /^December/i,
        /^一月/, /^二月/, /^三月/, /^四月/,
        /^五月/, /^六月/, /^七月/, /^八月/,
        /^九月/, /^十月/, /^十一月/, /^十二月/,
    ];

    return monthPatterns.some(pattern => pattern.test(line.trim()));
}

// Cache for parsed plan data
let cachedPlanData: DayPlan[] | null = null;

/**
 * Parse the entire plan content and return an array of 365 day plans
 */
export function parsePlanContent(content: string): DayPlan[] {
    const lines = content.split('\n');
    const dayPlans: DayPlan[] = [];
    let globalDayIndex = 0;

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and month headers
        if (!trimmed || isMonthHeader(trimmed)) {
            continue;
        }

        const parsed = parseDayLine(trimmed);
        if (parsed && parsed.readings.length > 0) {
            dayPlans.push({
                dayIndex: globalDayIndex,
                readings: parsed.readings,
                rawText: trimmed,
            });
            globalDayIndex++;
        }
    }

    console.log(`Parsed ${dayPlans.length} days from plan file`);
    return dayPlans;
}

/**
 * Load and parse the plan from the embedded data
 * In a real app, this would fetch from an API or bundled asset
 */
export async function loadPlanData(): Promise<DayPlan[]> {
    if (cachedPlanData) {
        return cachedPlanData;
    }

    try {
        // Fetch the plan file from the public folder
        const response = await fetch('/bible_plan/plan');
        if (!response.ok) {
            throw new Error('Failed to load plan file');
        }
        const content = await response.text();
        cachedPlanData = parsePlanContent(content);
        return cachedPlanData;
    } catch (error) {
        console.error('Error loading plan data:', error);
        return [];
    }
}

/**
 * Get the plan for a specific day index (0-364)
 */
export function getPlanByDayIndex(dayIndex: number, allPlans: DayPlan[]): DayPlan | null {
    // Normalize to 0-364 range (wraps around for year 2, 3, etc.)
    const normalizedIndex = Math.abs(dayIndex % 365);

    return allPlans.find(plan => plan.dayIndex === normalizedIndex) || null;
}

/**
 * Clear the cached plan data (useful for testing or reloading)
 */
export function clearPlanCache(): void {
    cachedPlanData = null;
}
