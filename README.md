# 工業物聯網實驗平台

國立成功大學教育研究實驗平台，用於收集工業物聯網課程的前後測、任務卡、設計說明書等研究資料。

## 系統架構

- **前端**: Next.js 16 (App Router) + Tailwind CSS v4
- **後端**: Next.js API Routes
- **資料庫**: Supabase (PostgreSQL)
- **認證**: Cookie-based，應用層密碼驗證

## 角色與權限

| 角色 | 登入方式 | 可見功能 |
|------|---------|---------|
| 學生 A 組（實踐組） | 共用密碼 + 選代碼 A01-A05 | 前測、任務卡、設計說明書、後測、TAM |
| 學生 B 組（高階組） | 共用密碼 + 選代碼 B01-B05 | 前測、概念圖、HOT O1-O3、GABER、TAM |
| 學生 C 組（傳統組） | 共用密碼 + 選代碼 C01-C05 | 前測、概念圖、HOT O1-O3、GABER |
| 助教 | 獨立密碼 | Rubric 評分系統 |
| 管理員 | 獨立密碼 | 進度總覽、模組開關控制 |

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

編輯 `.env.local` 並填入 Supabase 連線資訊：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
STUDENT_PASSWORD=ncku2026
TA_PASSWORD=ta2026
ADMIN_PASSWORD=admin2026
```

### 3. 建立 Supabase 資料表

在 Supabase Dashboard 的 SQL Editor 中執行 `supabase-schema.sql`。

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟 http://localhost:3000

## 專案結構

```
src/
├── app/
│   ├── page.tsx                    # 登入頁
│   ├── layout.tsx                  # 全站 Layout
│   ├── globals.css                 # Tailwind + 自訂樣式
│   ├── select-identity/page.tsx    # 學生選擇代碼
│   ├── dashboard/page.tsx          # 學生待辦清單
│   ├── modules/[moduleId]/page.tsx # 模組表單頁
│   ├── ta/page.tsx                 # 助教評分頁
│   ├── admin/page.tsx              # 管理員 Dashboard
│   └── api/
│       ├── auth/route.ts           # 密碼驗證
│       ├── auth/select/route.ts    # 選擇學生代碼
│       ├── submit/route.ts         # 表單提交
│       ├── modules/route.ts        # 模組狀態查詢
│       └── admin/route.ts          # 管理員 API
├── components/
│   └── TimedForm.tsx               # 計時表單元件
└── lib/
    ├── supabase.ts                 # Supabase client
    ├── auth.ts                     # 認證工具
    └── modules.ts                  # 模組定義
```

## 資料表

| 表名 | 用途 |
|------|------|
| `responses` | 學生填寫的所有表單資料（JSONB 彈性欄位） |
| `rubric_scores` | 助教 Rubric 五維度評分 |
| `module_status` | 模組開放狀態（管理員控制） |
| `observations` | 觀察員筆記（課堂觀察） |

## 部署

```bash
npm run build
npm run start
```

建議部署至 Vercel，環境變數在 Vercel Dashboard 設定。
