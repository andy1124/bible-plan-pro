import { Book, Verse } from './types';

// Mock Data: In a real app, this would be the full zh_cuv.json content
// We provide a few sample chapters for demonstration.

export const BIBLE_BOOKS: Book[] = [
  // Old Testament
  { id: 'Gen', name: '創世記', testament: 'OT', chapters: 50 },
  { id: 'Exo', name: '出埃及記', testament: 'OT', chapters: 40 },
  { id: 'Lev', name: '利未記', testament: 'OT', chapters: 27 },
  { id: 'Num', name: '民數記', testament: 'OT', chapters: 36 },
  { id: 'Deu', name: '申命記', testament: 'OT', chapters: 34 },
  { id: 'Jos', name: '約書亞記', testament: 'OT', chapters: 24 },
  { id: 'Psa', name: '詩篇', testament: 'OT', chapters: 150 },
  { id: 'Pro', name: '箴言', testament: 'OT', chapters: 31 },
  // ... (In a real app, list all 39 OT books)
  
  // New Testament
  { id: 'Mat', name: '馬太福音', testament: 'NT', chapters: 28 },
  { id: 'Mar', name: '馬可福音', testament: 'NT', chapters: 16 },
  { id: 'Luk', name: '路加福音', testament: 'NT', chapters: 24 },
  { id: 'Joh', name: '約翰福音', testament: 'NT', chapters: 21 },
  { id: 'Act', name: '使徒行傳', testament: 'NT', chapters: 28 },
  { id: 'Rom', name: '羅馬書', testament: 'NT', chapters: 16 },
  { id: 'Rev', name: '啟示錄', testament: 'NT', chapters: 22 },
  // ... (In a real app, list all 27 NT books)
];

// Sample Verses for Demo
export const MOCK_BIBLE_CONTENT: Record<string, Verse[]> = {
  'Gen-1': [
    { bookId: 'Gen', bookName: '創世記', chapter: 1, verse: 1, text: '起初，神創造天地。' },
    { bookId: 'Gen', bookName: '創世記', chapter: 1, verse: 2, text: '地是空虛混沌，淵面黑暗；神的靈運行在水面上。' },
    { bookId: 'Gen', bookName: '創世記', chapter: 1, verse: 3, text: '神說：「要有光」，就有了光。' },
    { bookId: 'Gen', bookName: '創世記', chapter: 1, verse: 4, text: '神看光是好的，就把光暗分開了。' },
  ],
  'Psa-23': [
    { bookId: 'Psa', bookName: '詩篇', chapter: 23, verse: 1, text: '耶和華是我的牧者，我必不致缺乏。' },
    { bookId: 'Psa', bookName: '詩篇', chapter: 23, verse: 2, text: '他使我躺臥在青草地上，領我在可安歇的水邊。' },
  ],
  'Mat-1': [
    { bookId: 'Mat', bookName: '馬太福音', chapter: 1, verse: 1, text: '亞伯拉罕的後裔，大衛的子孫，耶穌基督的家譜：' },
    { bookId: 'Mat', bookName: '馬太福音', chapter: 1, verse: 2, text: '亞伯拉罕生以撒；以撒生雅各；雅各生猶大和他的弟兄；' },
  ],
  'Rev-22': [
    { bookId: 'Rev', bookName: '啟示錄', chapter: 22, verse: 20, text: '證明這事的說：「是了，我必快來！」阿們！主耶穌啊，我願你來！' },
    { bookId: 'Rev', bookName: '啟示錄', chapter: 22, verse: 21, text: '願主耶穌的恩惠常與眾聖徒同在。阿們！' },
  ]
};

export const GOLDEN_VERSES = [
  { bookName: '啟示錄', reference: '22:20', text: '證明這事的說：是了，我必快來！阿們！主耶穌阿，我願你來！' },
  { bookName: '詩篇', reference: '119:105', text: '你的話是我腳前的燈，是我路上的光。' },
  { bookName: '腓立比書', reference: '4:13', text: '我靠著那加給我力量的，凡事都能做。' },
  { bookName: '約翰福音', reference: '3:16', text: '神愛世人，甚至將他的獨生子賜給他們，叫一切信他的，不至滅亡，反得永生。' },
];