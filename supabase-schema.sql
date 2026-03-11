-- ============================================
-- NCKU 工業物聯網實驗平台 - Supabase Schema
-- ============================================

-- 回應資料（學生填寫的所有表單）
CREATE TABLE IF NOT EXISTS responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code varchar(10) NOT NULL,          -- A01~C05
  group_id varchar(1) NOT NULL,       -- A/B/C
  module_id varchar(50) NOT NULL,
  data jsonb NOT NULL,                -- 彈性儲存各模組資料
  submitted_at timestamptz DEFAULT now(),
  start_time timestamptz,
  end_time timestamptz
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_responses_code ON responses(code);
CREATE INDEX IF NOT EXISTS idx_responses_module ON responses(module_id);
CREATE INDEX IF NOT EXISTS idx_responses_code_module ON responses(code, module_id);

-- Rubric 評分
CREATE TABLE IF NOT EXISTS rubric_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_code varchar(10) NOT NULL,
  lab varchar(10) NOT NULL,           -- lab03/lab04/lab05
  scorer varchar(20) NOT NULL,        -- 助教代碼
  wiring int CHECK (wiring BETWEEN 1 AND 4),
  logic int CHECK (logic BETWEEN 1 AND 4),
  debugging int CHECK (debugging BETWEEN 1 AND 4),
  extension int CHECK (extension BETWEEN 1 AND 4),
  efficiency int CHECK (efficiency BETWEEN 1 AND 4),
  total int GENERATED ALWAYS AS (wiring + logic + debugging + extension + efficiency) STORED,
  notes text,
  scored_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rubric_student ON rubric_scores(student_code);
CREATE INDEX IF NOT EXISTS idx_rubric_lab ON rubric_scores(lab);

-- 模組開關狀態（管理員控制）
CREATE TABLE IF NOT EXISTS module_status (
  module_id varchar(50) PRIMARY KEY,
  enabled boolean DEFAULT false,
  enabled_at timestamptz,
  disabled_at timestamptz
);

-- 觀察員筆記
CREATE TABLE IF NOT EXISTS observations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lab varchar(10) NOT NULL,
  student_code varchar(10) NOT NULL,
  observer varchar(20) NOT NULL,
  help_count int DEFAULT 0,
  extension_count int DEFAULT 0,
  completed boolean DEFAULT false,
  blocked_at int[],                   -- 卡關時間點（分鐘）
  notes text,
  recorded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_observations_student ON observations(student_code);
CREATE INDEX IF NOT EXISTS idx_observations_lab ON observations(lab);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- 注意：因為使用 anon key + 應用層認證（非 Supabase Auth），
-- 建議在 Supabase Dashboard 中為這些表設定適當的 RLS policy，
-- 或在開發階段暫時關閉 RLS。

-- 開發階段：允許所有操作
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for responses" ON responses FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE rubric_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for rubric_scores" ON rubric_scores FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE module_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for module_status" ON module_status FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for observations" ON observations FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 初始化模組狀態（全部預設關閉）
-- ============================================
INSERT INTO module_status (module_id, enabled) VALUES
  ('consent', false),
  ('basic-info', false),
  ('self-efficacy-pre', false),
  ('hot-o1-short', false),
  ('hot-o1-full', false),
  ('concept-map-pre', false),
  ('task-card-lab03', false),
  ('design-report-lab03', false),
  ('task-card-lab04', false),
  ('design-report-lab04', false),
  ('task-card-lab05', false),
  ('hot-o2', false),
  ('design-report-lab05', false),
  ('self-efficacy-post', false),
  ('hot-o3', false),
  ('concept-map-post', false),
  ('gaber', false),
  ('tam', false)
ON CONFLICT (module_id) DO NOTHING;
