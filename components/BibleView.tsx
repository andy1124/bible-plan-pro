import React, { useState, useEffect } from 'react';
import { BIBLE_BOOKS } from '../constants';
import { Book, Verse } from '../types';
import { getVerses } from '../services/bibleService';
import { ChevronDown, ChevronLeft, Heart } from 'lucide-react';

interface BibleViewProps {
  initialBookId?: string;
  initialChapter?: number;
  onAddToFavorites: (verse: Verse) => void;
  favorites: Verse[]; // To check if favorited
}

type Mode = 'BOOK_SELECT' | 'CHAPTER_SELECT' | 'READING';

const BibleView: React.FC<BibleViewProps> = ({ initialBookId, initialChapter, onAddToFavorites, favorites }) => {
  const [mode, setMode] = useState<Mode>('BOOK_SELECT');
  const [testament, setTestament] = useState<'OT' | 'NT'>('OT');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isToastVisible, setIsToastVisible] = useState(false);

  // Handle external navigation (from Plan or Home)
  useEffect(() => {
    if (initialBookId && initialChapter) {
        const book = BIBLE_BOOKS.find(b => b.id === initialBookId);
        if (book) {
            setSelectedBook(book);
            setSelectedChapter(initialChapter);
            setVerses(getVerses(initialBookId, initialChapter));
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
        setVerses(getVerses(selectedBook.id, chapter));
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
    <div className="pb-24">
       <div className="flex justify-center p-2 bg-gray-100 m-4 rounded-lg">
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
       <div className="grid grid-cols-4 gap-4 px-4">
            {BIBLE_BOOKS.filter(b => b.testament === testament).map(book => (
                <button 
                  key={book.id}
                  onClick={() => handleBookSelect(book)}
                  className="bg-white p-3 rounded-xl shadow-sm text-sm font-medium flex flex-col items-center justify-center aspect-square active:bg-gray-100"
                >
                    {book.name}
                </button>
            ))}
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
    <div className="pb-24 bg-white min-h-screen">
        <div className="flex items-center px-4 py-3 sticky top-0 bg-white border-b border-gray-100 z-10">
            <button onClick={handleBack} className="p-2 -ml-2">
                <ChevronLeft size={24} className="text-gray-800" />
            </button>
            <div className="flex-1 text-center font-bold text-lg">
                {selectedBook?.name} {selectedChapter}
            </div>
            <div className="w-8"></div>
        </div>
        
        <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 rounded-2xl shadow-lg mb-8">
                <h3 className="text-lg font-bold mb-2 text-center">
                    {selectedBook?.name} 第 {selectedChapter} 章
                </h3>
            </div>
            
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
    <div className="h-full">
        {mode === 'BOOK_SELECT' && (
            <>
                <h1 className="text-3xl font-bold px-4 py-4">聖經</h1>
                {renderBookSelector()}
            </>
        )}
        {mode === 'CHAPTER_SELECT' && renderChapterSelector()}
        {mode === 'READING' && renderReadingView()}
    </div>
  );
};

export default BibleView;