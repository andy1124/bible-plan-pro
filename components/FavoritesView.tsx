import React, { useState, useMemo, useRef } from 'react';
import { Verse } from '../types';
import { Trash2, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface FavoritesViewProps {
  favorites: Verse[];
  onRemove: (verse: Verse) => void;
}

const ITEMS_PER_PAGE = 20;

const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, onRemove }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalPages = useMemo(() => Math.ceil(favorites.length / ITEMS_PER_PAGE), [favorites.length]);

  const currentFavorites = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return favorites.slice(startIndex, endIndex);
  }, [favorites, currentPage]);

  // Reset to page 1 if current page exceeds total pages (e.g., after deletion)
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of the container when changing pages
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 py-4 mt-4">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition ${currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
            }`}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first, last, current, and adjacent pages
            const showPage =
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1;

            const showEllipsis =
              (page === 2 && currentPage > 3) ||
              (page === totalPages - 1 && currentPage < totalPages - 2);

            if (showEllipsis && !showPage) {
              return (
                <span key={page} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }

            if (!showPage) return null;

            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-8 h-8 rounded-lg font-medium transition ${currentPage === page
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition ${currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
            }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-4 pt-4 bg-gray-50">
        <div className="flex items-center justify-center py-6">
          <h1 className="text-2xl font-bold">金句收藏</h1>
        </div>

        {/* Page info - also fixed */}
        {favorites.length > 0 && totalPages > 1 && (
          <div className="text-center text-sm text-gray-500 pb-4">
            第 {currentPage} 頁，共 {totalPages} 頁
          </div>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center px-8">
          <Quote size={48} className="mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-gray-600 mb-2">相信禱告的力量</h3>
          <p className="text-sm">記錄下你的感動經文，隨時回味。</p>
          <div className="mt-8 px-6 py-2 border border-red-500 text-red-500 rounded-lg">
            去聖經閱讀加入
          </div>
        </div>
      ) : (
        /* Scrollable Content Area */
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-24">
          <div className="space-y-4">
            {currentFavorites.map((fav, index) => (
              <div key={`${fav.bookId}-${fav.chapter}-${fav.verse}`} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group">
                <div className="mb-3">
                  <Quote className="text-red-100 fill-red-50 mb-2" size={24} />
                  <p className="text-gray-800 text-lg font-serif leading-relaxed">
                    {fav.text}
                  </p>
                </div>
                <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-2">
                  <span className="text-sm font-bold text-gray-500">
                    {fav.bookName} {fav.chapter}:{fav.verse}
                  </span>
                  <button
                    onClick={() => onRemove(fav)}
                    className="p-2 text-gray-300 hover:text-red-500 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - at the bottom of scrollable area */}
          {renderPagination()}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;