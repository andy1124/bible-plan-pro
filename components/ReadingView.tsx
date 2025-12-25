import React, { useState, useEffect } from 'react';
import { PlanDay, Verse, UserSettings } from '../types';
import { getBookById, getVersesAsync } from '../services/bibleService';
import { ChevronLeft, Heart, Loader2 } from 'lucide-react';

interface ReadingViewProps {
    reading: PlanDay['readings'][0];
    dateStr: string;
    onBack: () => void;
    onAddToFavorites: (verse: Verse) => void;
    favorites: Verse[];
    settings?: UserSettings;
}

interface ChapterVerses {
    chapter: number;
    verses: Verse[];
}

/**
 * ReadingView - Displays multiple chapters of a reading plan item
 * Unlike BibleView which shows one chapter at a time, this shows all chapters
 * in the reading range (e.g., Genesis 1-3 shows chapters 1, 2, and 3)
 */
const ReadingView: React.FC<ReadingViewProps> = ({
    reading,
    dateStr,
    onBack,
    onAddToFavorites,
    favorites,
    settings
}) => {
    const [allChapters, setAllChapters] = useState<ChapterVerses[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isToastVisible, setIsToastVisible] = useState(false);

    const book = getBookById(reading.bookId);
    const { chapterStart, chapterEnd, verseStart, verseEnd } = reading;

    // Format display title
    const getDisplayTitle = (): string => {
        if (!book) return '';

        if (chapterStart === chapterEnd) {
            if (verseStart !== undefined && verseEnd !== undefined) {
                return `${book.name} ${chapterStart}:${verseStart}-${verseEnd}`;
            }
            return `${book.name} 第 ${chapterStart} 章`;
        }
        return `${book.name} ${chapterStart}-${chapterEnd} 章`;
    };

    // Load all chapters in the range
    useEffect(() => {
        const loadAllChapters = async () => {
            setIsLoading(true);
            try {
                const chapters: ChapterVerses[] = [];

                for (let ch = chapterStart; ch <= chapterEnd; ch++) {
                    let verses = await getVersesAsync(reading.bookId, ch, settings?.bibleVersion);

                    // If specific verse range is specified and it's a single chapter
                    if (chapterStart === chapterEnd && verseStart !== undefined && verseEnd !== undefined) {
                        verses = verses.filter(v => v.verse >= verseStart && v.verse <= verseEnd);
                    }

                    if (verses.length > 0) {
                        chapters.push({ chapter: ch, verses });
                    }
                }

                setAllChapters(chapters);
            } catch (error) {
                console.error('Error loading chapters:', error);
                setAllChapters([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadAllChapters();
    }, [reading.bookId, chapterStart, chapterEnd, verseStart, verseEnd, settings?.bibleVersion]);

    const isFavorited = (v: Verse) => {
        return favorites.some(
            fav => fav.bookId === v.bookId && fav.chapter === v.chapter && fav.verse === v.verse
        );
    };

    const [toastMessage, setToastMessage] = useState('');

    const handleFavoriteClick = (v: Verse) => {
        const willRemove = isFavorited(v);
        onAddToFavorites(v);
        setToastMessage(willRemove ? '已取消收藏' : '已加入金句');
        setIsToastVisible(true);
        setTimeout(() => setIsToastVisible(false), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Fixed Header */}
            <div className="flex-shrink-0 flex items-center px-4 py-3 bg-white border-b border-gray-100">
                <button onClick={onBack} className="p-2 -ml-2">
                    <ChevronLeft size={24} className="text-gray-800" />
                </button>
                <div className="flex-1 text-center font-bold text-lg">
                    {getDisplayTitle()}
                </div>
                <div className="w-8"></div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="pb-24">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            <p className="mt-4 text-gray-500">載入經文中...</p>
                        </div>
                    ) : allChapters.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <p className="text-gray-500">無法載入經文</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {allChapters.map((chapterData, chapterIndex) => (
                                <div key={chapterData.chapter}>
                                    {/* Chapter Header - only show if multiple chapters */}
                                    {allChapters.length > 1 && (
                                        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 z-10">
                                            <h3 className="font-bold text-center">
                                                {book?.name} 第 {chapterData.chapter} 章
                                            </h3>
                                        </div>
                                    )}

                                    {/* Verses */}
                                    <div className="p-6 space-y-5">
                                        {chapterData.verses.map((v, i) => (
                                            <div key={`${chapterData.chapter}-${v.verse}`} className="flex gap-3 group">
                                                <span className="text-xs font-bold text-gray-400 mt-1 w-6 shrink-0">
                                                    {v.verse}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-lg leading-relaxed text-gray-800 font-serif">
                                                        {v.text}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleFavoriteClick(v)}
                                                    className={`h-8 w-8 flex items-center justify-center rounded-full transition ${isFavorited(v) ? 'bg-red-50' : 'bg-transparent'
                                                        }`}
                                                >
                                                    <Heart
                                                        size={18}
                                                        className={isFavorited(v) ? "fill-red-500 text-red-500" : "text-gray-300"}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Divider between chapters */}
                                    {chapterIndex < allChapters.length - 1 && (
                                        <div className="h-px bg-gray-100 mx-6" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            {isToastVisible && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-full shadow-xl z-50 transition-opacity">
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default ReadingView;
