import React, { useState, useEffect } from 'react';
import { BIBLE_BOOKS } from '../constants';
import { Book, Verse, UserSettings } from '../types';
import { getVersesAsync } from '../services/bibleService';
import { ChevronDown, ChevronLeft, Heart, Loader2 } from 'lucide-react';

interface BibleViewProps {
  initialBookId?: string;
  initialChapter?: number;
  onAddToFavorites: (verse: Verse) => void;
  favorites: Verse[]; // To check if favorited
  settings?: UserSettings; // Add settings prop
}

type Mode = 'BOOK_SELECT' | 'CHAPTER_SELECT' | 'READING';

const BibleView: React.FC<BibleViewProps> = ({ initialBookId, initialChapter, onAddToFavorites, favorites, settings }) => {
  const [mode, setMode] = useState<Mode>('BOOK_SELECT');
  const [testament, setTestament] = useState<'OT' | 'NT'>('OT');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load verses asynchronously
  const loadVerses = async (bookId: string, chapter: number) => {
    setIsLoading(true);
    try {
      const loadedVerses = await getVersesAsync(bookId, chapter, settings?.bibleVersion);
      setVerses(loadedVerses);
    } catch (error) {
      console.error('Error loading verses:', error);
      setVerses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle external navigation (from Plan or Home)
  useEffect(() => {
    if (initialBookId && initialChapter) {
      const book = BIBLE_BOOKS.find(b => b.id === initialBookId);
      if (book) {
        setSelectedBook(book);
        setSelectedChapter(initialChapter);
        loadVerses(initialBookId, initialChapter);
        setMode('READING');
      }
    }
  }, [initialBookId, initialChapter]);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setMode('CHAPTER_SELECT');
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    if (selectedBook) {
      loadVerses(selectedBook.id, chapter);
      setMode('READING');
    }
  };

  const handleBack = () => {
    if (mode === 'READING') setMode('CHAPTER_SELECT');
    else if (mode === 'CHAPTER_SELECT') setMode('BOOK_SELECT');
  };

  const isFavorited = (v: Verse) => {
    return favorites.some(fav => fav.bookId === v.bookId && fav.chapter === v.chapter && fav.verse === v.verse);
  };

  const handleFavoriteClick = (v: Verse) => {
    onAddToFavorites(v);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 2000);
  };

  // --- Render Functions ---

  const renderBookSelector = () => (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-4 pt-2 pb-4 bg-gray-50">
        <div className="flex justify-center p-2 bg-gray-100 rounded-lg">
          <button
            className={`flex-1 py-1 rounded-md text-sm font-bold transition ${testament === 'OT' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
            onClick={() => setTestament('OT')}
          >
            舊約全書
          </button>
          <button
            className={`flex-1 py-1 rounded-md text-sm font-bold transition ${testament === 'NT' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
            onClick={() => setTestament('NT')}
          >
            新約全書
          </button>
        </div>
      </div>

      {/* Scrollable Book List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="space-y-2">
          {BIBLE_BOOKS.filter(b => b.testament === testament).map(book => (
            <button
              key={book.id}
              onClick={() => handleBookSelect(book)}
              className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between active:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-800">{book.name}</span>
              </div>
              <span className="text-sm text-gray-400">{book.chapters} 章</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChapterSelector = () => (
    <div className="pb-24">
      <div className="flex items-center px-4 py-4 sticky top-0 bg-gray-50 z-10">
        <button onClick={handleBack} className="flex items-center text-blue-600 font-medium">
          <ChevronLeft size={24} /> 聖經
        </button>
        <h2 className="flex-1 text-center text-xl font-bold mr-8">{selectedBook?.name}</h2>
      </div>
      <div className="grid grid-cols-5 gap-3 px-4">
        {Array.from({ length: selectedBook?.chapters || 0 }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleChapterSelect(i + 1)}
            className="bg-white py-3 rounded-lg shadow-sm font-semibold text-gray-700 active:bg-gray-100"
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );

  const renderReadingView = () => (
    <div className="h-full flex flex-col bg-white">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center px-4 py-3 bg-white border-b border-gray-100">
        <button onClick={handleBack} className="p-2 -ml-2">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <div className="flex-1 text-center font-bold text-lg">
          {selectedBook?.name} 第 {selectedChapter} 章
        </div>
        <div className="w-8"></div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 pb-24 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="mt-4 text-gray-500">載入經文中...</p>
            </div>
          ) : verses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-gray-500">無法載入此章節經文</p>
            </div>
          ) : (
            <div className="space-y-6">
              {verses.map((v, i) => (
                <div key={i} className="flex gap-3 group">
                  <span className="text-xs font-bold text-gray-400 mt-1 w-6 shrink-0">{v.verse}</span>
                  <div className="flex-1">
                    <p className="text-lg leading-relaxed text-gray-800 font-serif">
                      {v.text}
                    </p>
                  </div>
                  <button
                    onClick={() => handleFavoriteClick(v)}
                    className={`h-8 w-8 flex items-center justify-center rounded-full transition ${isFavorited(v) ? 'bg-red-50' : 'bg-transparent'}`}
                  >
                    <Heart
                      size={18}
                      className={isFavorited(v) ? "fill-red-500 text-red-500" : "text-gray-300"}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {isToastVisible && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-full shadow-xl z-50 transition-opacity">
          已加入金句
        </div>
      )}
    </div>
  );


  return (
    <div className="h-full flex flex-col">
      {mode === 'BOOK_SELECT' && (
        <>
          <h1 className="text-3xl font-bold px-4 py-4 flex-shrink-0">聖經</h1>
          <div className="flex-1 overflow-hidden">
            {renderBookSelector()}
          </div>
        </>
      )}
      {mode === 'CHAPTER_SELECT' && renderChapterSelector()}
      {mode === 'READING' && renderReadingView()}
    </div>
  );
};

export default BibleView;