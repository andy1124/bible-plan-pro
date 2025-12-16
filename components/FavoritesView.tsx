import React from 'react';
import { Verse } from '../types';
import { Trash2, Quote } from 'lucide-react';

interface FavoritesViewProps {
  favorites: Verse[];
  onRemove: (verse: Verse) => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, onRemove }) => {
  return (
    <div className="p-4 pb-24 min-h-screen bg-gray-50">
      <div className="flex items-center justify-center py-6 mb-4">
        <h1 className="text-2xl font-bold">金句收藏</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 text-center px-8">
            <Quote size={48} className="mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-gray-600 mb-2">相信禱告的力量</h3>
            <p className="text-sm">記錄下你的感動經文，隨時回味。</p>
            <div className="mt-8 px-6 py-2 border border-red-500 text-red-500 rounded-lg">
                去聖經閱讀加入
            </div>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((fav, index) => (
            <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group">
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
      )}
    </div>
  );
};

export default FavoritesView;