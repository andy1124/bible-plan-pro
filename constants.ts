import { Book, Verse } from './types';

// Mock Data: In a real app, this would be the full zh_cuv.json content
// We provide a few sample chapters for demonstration.

export const BIBLE_BOOKS: Book[] = [
  // Old Testament (39 books)
  { id: 'Gen', name: '創世記', testament: 'OT', chapters: 50 },
  { id: 'Exo', name: '出埃及記', testament: 'OT', chapters: 40 },
  { id: 'Lev', name: '利未記', testament: 'OT', chapters: 27 },
  { id: 'Num', name: '民數記', testament: 'OT', chapters: 36 },
  { id: 'Deu', name: '申命記', testament: 'OT', chapters: 34 },
  { id: 'Jos', name: '約書亞記', testament: 'OT', chapters: 24 },
  { id: 'Jdg', name: '士師記', testament: 'OT', chapters: 21 },
  { id: 'Rut', name: '路得記', testament: 'OT', chapters: 4 },
  { id: '1Sa', name: '撒母耳記上', testament: 'OT', chapters: 31 },
  { id: '2Sa', name: '撒母耳記下', testament: 'OT', chapters: 24 },
  { id: '1Ki', name: '列王紀上', testament: 'OT', chapters: 22 },
  { id: '2Ki', name: '列王紀下', testament: 'OT', chapters: 25 },
  { id: '1Ch', name: '歷代志上', testament: 'OT', chapters: 29 },
  { id: '2Ch', name: '歷代志下', testament: 'OT', chapters: 36 },
  { id: 'Ezr', name: '以斯拉記', testament: 'OT', chapters: 10 },
  { id: 'Neh', name: '尼希米記', testament: 'OT', chapters: 13 },
  { id: 'Est', name: '以斯帖記', testament: 'OT', chapters: 10 },
  { id: 'Job', name: '約伯記', testament: 'OT', chapters: 42 },
  { id: 'Psa', name: '詩篇', testament: 'OT', chapters: 150 },
  { id: 'Pro', name: '箴言', testament: 'OT', chapters: 31 },
  { id: 'Ecc', name: '傳道書', testament: 'OT', chapters: 12 },
  { id: 'Sng', name: '雅歌', testament: 'OT', chapters: 8 },
  { id: 'Isa', name: '以賽亞書', testament: 'OT', chapters: 66 },
  { id: 'Jer', name: '耶利米書', testament: 'OT', chapters: 52 },
  { id: 'Lam', name: '耶利米哀歌', testament: 'OT', chapters: 5 },
  { id: 'Ezk', name: '以西結書', testament: 'OT', chapters: 48 },
  { id: 'Dan', name: '但以理書', testament: 'OT', chapters: 12 },
  { id: 'Hos', name: '何西阿書', testament: 'OT', chapters: 14 },
  { id: 'Jol', name: '約珥書', testament: 'OT', chapters: 3 },
  { id: 'Amo', name: '阿摩司書', testament: 'OT', chapters: 9 },
  { id: 'Oba', name: '俄巴底亞書', testament: 'OT', chapters: 1 },
  { id: 'Jon', name: '約拿書', testament: 'OT', chapters: 4 },
  { id: 'Mic', name: '彌迦書', testament: 'OT', chapters: 7 },
  { id: 'Nam', name: '那鴻書', testament: 'OT', chapters: 3 },
  { id: 'Hab', name: '哈巴谷書', testament: 'OT', chapters: 3 },
  { id: 'Zep', name: '西番雅書', testament: 'OT', chapters: 3 },
  { id: 'Hag', name: '哈該書', testament: 'OT', chapters: 2 },
  { id: 'Zec', name: '撒迦利亞書', testament: 'OT', chapters: 14 },
  { id: 'Mal', name: '瑪拉基書', testament: 'OT', chapters: 4 },

  // New Testament (27 books)
  { id: 'Mat', name: '馬太福音', testament: 'NT', chapters: 28 },
  { id: 'Mar', name: '馬可福音', testament: 'NT', chapters: 16 },
  { id: 'Luk', name: '路加福音', testament: 'NT', chapters: 24 },
  { id: 'Joh', name: '約翰福音', testament: 'NT', chapters: 21 },
  { id: 'Act', name: '使徒行傳', testament: 'NT', chapters: 28 },
  { id: 'Rom', name: '羅馬書', testament: 'NT', chapters: 16 },
  { id: '1Co', name: '哥林多前書', testament: 'NT', chapters: 16 },
  { id: '2Co', name: '哥林多後書', testament: 'NT', chapters: 13 },
  { id: 'Gal', name: '加拉太書', testament: 'NT', chapters: 6 },
  { id: 'Eph', name: '以弗所書', testament: 'NT', chapters: 6 },
  { id: 'Php', name: '腓立比書', testament: 'NT', chapters: 4 },
  { id: 'Col', name: '歌羅西書', testament: 'NT', chapters: 4 },
  { id: '1Th', name: '帖撒羅尼迦前書', testament: 'NT', chapters: 5 },
  { id: '2Th', name: '帖撒羅尼迦後書', testament: 'NT', chapters: 3 },
  { id: '1Ti', name: '提摩太前書', testament: 'NT', chapters: 6 },
  { id: '2Ti', name: '提摩太後書', testament: 'NT', chapters: 4 },
  { id: 'Tit', name: '提多書', testament: 'NT', chapters: 3 },
  { id: 'Phm', name: '腓利門書', testament: 'NT', chapters: 1 },
  { id: 'Heb', name: '希伯來書', testament: 'NT', chapters: 13 },
  { id: 'Jas', name: '雅各書', testament: 'NT', chapters: 5 },
  { id: '1Pe', name: '彼得前書', testament: 'NT', chapters: 5 },
  { id: '2Pe', name: '彼得後書', testament: 'NT', chapters: 3 },
  { id: '1Jn', name: '約翰一書', testament: 'NT', chapters: 5 },
  { id: '2Jn', name: '約翰二書', testament: 'NT', chapters: 1 },
  { id: '3Jn', name: '約翰三書', testament: 'NT', chapters: 1 },
  { id: 'Jud', name: '猶大書', testament: 'NT', chapters: 1 },
  { id: 'Rev', name: '啟示錄', testament: 'NT', chapters: 22 },
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