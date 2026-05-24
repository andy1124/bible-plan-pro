# Bible Plan Pro 📖

一個手機風格的聖經讀經計畫 Progressive Web App，幫助你完成 365 天讀完整本聖經的計畫。使用 React + TypeScript + Vite 開發，部署於 GitHub Pages。

**線上體驗：** https://andy1124.github.io/bible-plan-pro/

---

## 功能介紹

| 頁面 | 說明 |
|------|------|
| **首頁（Home）** | 顯示今日讀經進度、勾選完成狀態、金句卡片 |
| **計畫（Plan）** | 瀏覽全年 365 天讀經安排 |
| **聖經（Bible）** | 按書卷、章節瀏覽聖經全文，支援收藏金句 |
| **金句（Favorites）** | 管理已收藏的金句 |
| **設定（Settings）** | 設定讀經起始日期、聖經版本 |

### 支援的聖經版本

- 和合本（CUV）— 預設
- 新譯本（NCV）
- King James Version（KJV）

---

## 本地開發

### 環境需求

- Node.js 18+
- npm 9+

### 安裝與啟動

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發伺服器（http://localhost:3000）
npm run dev
```

### 常用指令

```bash
# 啟動開發模式（熱更新）
npm run dev

# 建置 production 版本（輸出至 dist/）
npm run build

# 預覽 production 建置結果（本地確認 build 是否正確）
npm run preview

# 部署至 GitHub Pages
npm run deploy
```

---

## 部署到 GitHub Pages

本專案使用 `gh-pages` 套件自動部署。

### 一鍵部署

```bash
npm run deploy
```

這個指令會自動執行：
1. `npm run build` — 建置 production 版本到 `dist/`
2. `gh-pages -d dist` — 將 `dist/` 的內容推送到 GitHub `gh-pages` 分支

### 首次設定（如果你是 fork 或在新 repo）

**第 1 步：確認 `vite.config.ts` 的 `base` 路徑正確**

```ts
// vite.config.ts
base: mode === 'production' ? '/bible-plan-pro/' : '/',
```

> ⚠️ 如果你的 GitHub repo 名稱不是 `bible-plan-pro`，請修改這裡的路徑，否則靜態資源（聖經 JSON、讀經計畫）會 404。

**第 2 步：確認 GitHub Pages 設定**

進入 GitHub repo → Settings → Pages → Source 選擇 `gh-pages` 分支。

**第 3 步：部署**

```bash
npm run deploy
```

部署完成後，約等 1-2 分鐘即可在 `https://<你的帳號>.github.io/<repo名稱>/` 看到結果。

---

## 專案結構

```
bible-plan-pro/
├── public/
│   ├── bible/
│   │   ├── zh_cuv.json        # 和合本聖經全文
│   │   ├── zh_ncv.json        # 新譯本聖經全文
│   │   └── en_kjv.json        # KJV 英文聖經全文
│   ├── bible_plan/
│   │   └── plan               # 365 天讀經計畫（純文字格式）
│   └── golden_verses/
│       └── verses.txt         # 金句清單
├── components/
│   ├── HomeView.tsx           # 首頁
│   ├── PlanView.tsx           # 計畫頁
│   ├── BibleView.tsx          # 聖經瀏覽頁
│   ├── ReadingView.tsx        # 讀經閱讀頁（全章節）
│   ├── FavoritesView.tsx      # 收藏金句頁
│   ├── SettingsView.tsx       # 設定頁
│   └── TabBar.tsx             # 底部 Tab 導航
├── services/
│   ├── bibleService.ts        # 主要 Bible 服務（整合各子服務）
│   ├── bibleContentService.ts # 聖經 JSON 載入與查詢
│   └── planParser.ts          # 讀經計畫解析（parse plan 文字檔）
├── constants.ts               # 66 卷書清單（書卷 id、中文名、章數）
├── types.ts                   # TypeScript 型別定義
├── App.tsx                    # 主 App，狀態管理與 Tab 路由
├── index.tsx                  # 入口點
├── index.html                 # HTML 模板
└── vite.config.ts             # Vite 設定（含 base path）
```

---

## 資料格式說明

### 聖經 JSON（`public/bible/*.json`）

```json
[
  {
    "abbrev": "gn",
    "chapters": [
      ["起初，神創造天地。", "地是空虛混沌...", ...],
      [...]
    ]
  },
  ...
]
```

- 陣列順序：創世記 → 啟示錄，共 66 卷
- `chapters` 是二維陣列：`chapters[章數-1][節數-1]`

### 讀經計畫（`public/bible_plan/plan`）

```
January (一月)
1 Genesis(創)1-3;Matthew(太)1
2 Genesis(創)4-6;Matthew(太)2
...
```

- 每行格式：`日期 書卷名(中文縮寫)章數範圍;...`
- 跨章以 `-` 表示，特定節次以 `:` 表示（如 `Matthew(太)5:1-26`）

---

## 資料持久化

所有使用者資料存放在瀏覽器的 **localStorage**：

| Key | 說明 |
|-----|------|
| `bible_settings` | 設定（起始日期、聖經版本等） |
| `bible_checks` | 每日讀經的勾選狀態 |
| `bible_favorites` | 收藏的金句 |

---

## 已知問題與修復記錄

### 士師記（Judges）與約伯記（Job）無法顯示

**原因：** `services/bibleContentService.ts` 的書卷縮寫對照表 `BOOK_ID_TO_ABBREV` 有 typo：
- `'Jdg': 'jg'` 應為 `'Jdg': 'jud'`
- `'Job': 'jb'` 應為 `'Job': 'job'`

**修復：** 已於 2026-05-24 修正上述兩處錯誤，修正後需重新 build 並部署。

---

## 開發備註

- 本 App 設計為行動裝置優先，最大寬度 448px（`max-w-md`）
- 聖經 JSON 檔案較大（各約 3-5MB），會在首次載入時 fetch 並快取在記憶體中；切換版本時才重新載入
- `vite.config.ts` 中的 `base` 路徑在 production 模式下會設為 `/bible-plan-pro/`，本地開發時為 `/`，這確保資源路徑在 GitHub Pages 和本地都正確
