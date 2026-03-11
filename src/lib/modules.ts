// ============================================================
// Module & Question Types
// ============================================================

export type GroupId = 'A' | 'B' | 'C'
export type Phase = 1 | 2 | 3

export interface Question {
  id: string
  type: 'text' | 'textarea' | 'radio' | 'likert5' | 'checkbox' | 'file' | 'info'
  label: string
  options?: string[]
  required?: boolean
  maxWords?: number
}

export interface Module {
  id: string
  title: string
  description?: string
  group: GroupId[]
  phase: Phase
  timeLimit?: number // minutes
  questions: Question[]
  context?: string
  autoOpenDate?: string  // YYYY-MM-DD，到此日期自動開放（台灣時間）
  autoCloseDate?: string // YYYY-MM-DD，到此日期自動關閉
}

// ============================================================
// Likert scale labels (reused)
// ============================================================

const LIKERT5_OPTIONS = ['完全不同意', '不同意', '普通', '同意', '完全同意']

// ============================================================
// Phase labels
// ============================================================

export const PHASE_LABELS: Record<Phase, string> = {
  1: '前測階段',
  2: '實驗階段',
  3: '後測階段',
}

// ============================================================
// All 18 Modules
// ============================================================

export const MODULES: Module[] = [
  // ----------------------------------------------------------
  // M01: consent
  // ----------------------------------------------------------
  {
    id: 'consent',
    title: '知情同意書',
    description: '參與研究前，請閱讀以下研究說明並表示同意。',
    group: ['A', 'B', 'C'],
    phase: 1,
    autoOpenDate: '2026-03-10',
    autoCloseDate: '2026-03-16',
    context: `本研究旨在探討不同教學輔助策略對工業物聯網課程學習成效之影響。研究過程中，您將依照分組完成不同的學習活動與測驗。所有資料僅供學術研究使用，以匿名方式處理與呈現。您可以隨時退出研究，且不會影響您的學業成績。

研究主持人：國立成功大學
聯絡方式：請洽授課教師`,
    questions: [
      {
        id: 'agree',
        type: 'checkbox',
        label: '我已閱讀並同意以上研究說明，自願參與本研究。本研究結果將以匿名方式呈現，我可以隨時退出且不影響學業成績。',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M02: demographic
  // ----------------------------------------------------------
  {
    id: 'demographic',
    title: '基本資料',
    group: ['A', 'B', 'C'],
    phase: 1,
    autoOpenDate: '2026-03-10',
    autoCloseDate: '2026-03-16',
    questions: [
      {
        id: 'gender',
        type: 'radio',
        label: '性別',
        options: ['男', '女', '其他', '不願透露'],
        required: true,
      },
      {
        id: 'age',
        type: 'radio',
        label: '年齡',
        options: ['17-19', '20-22', '23-25', '26歲以上'],
        required: true,
      },
      {
        id: 'grade',
        type: 'radio',
        label: '就讀年級',
        options: ['大一', '大二', '大三', '大四以上'],
        required: true,
      },
      {
        id: 'programming_exp',
        type: 'radio',
        label: '程式設計經驗',
        options: ['無', '少於1年', '1-2年', '2年以上'],
        required: true,
      },
      {
        id: 'iot_exp',
        type: 'radio',
        label: 'IoT/嵌入式系統相關經驗',
        options: ['無', '了解基礎概念', '有實作經驗', '有專案開發經驗'],
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M03: self_efficacy_pre
  // ----------------------------------------------------------
  {
    id: 'self_efficacy_pre',
    title: '自我效能量表（前測）',
    group: ['A', 'B', 'C'],
    phase: 1,
    autoOpenDate: '2026-03-10',
    autoCloseDate: '2026-03-16',
    questions: [
      { id: 'se1', type: 'likert5', label: '我有信心完成這門課的實作任務', options: LIKERT5_OPTIONS, required: true },
      { id: 'se2', type: 'likert5', label: '面對新的技術挑戰，我相信自己能找到解決方法', options: LIKERT5_OPTIONS, required: true },
      { id: 'se3', type: 'likert5', label: '即使遇到困難，我仍然能夠堅持完成任務', options: LIKERT5_OPTIONS, required: true },
      { id: 'se4', type: 'likert5', label: '我能夠有效地運用課堂所學解決實際問題', options: LIKERT5_OPTIONS, required: true },
      { id: 'se5', type: 'likert5', label: '當程式出現錯誤時，我有能力找出並修正問題', options: LIKERT5_OPTIONS, required: true },
      { id: 'se6', type: 'likert5', label: '我對自己完成硬體與軟體整合任務有信心', options: LIKERT5_OPTIONS, required: true },
      { id: 'se7', type: 'likert5', label: '我相信透過努力，我可以掌握IoT相關技術', options: LIKERT5_OPTIONS, required: true },
      { id: 'se8', type: 'likert5', label: '與同學合作討論技術問題時，我能有效地表達自己的想法', options: LIKERT5_OPTIONS, required: true },
      { id: 'se9', type: 'likert5', label: '面對複雜的系統設計問題，我有信心提出可行方案', options: LIKERT5_OPTIONS, required: true },
      { id: 'se10', type: 'likert5', label: '整體而言，我對自己在這門課的學習表現有信心', options: LIKERT5_OPTIONS, required: true },
    ],
  },

  // ----------------------------------------------------------
  // M04: hot_o1_full (HOT O1 全版, groups B+C)
  // ----------------------------------------------------------
  {
    id: 'hot_o1_full',
    title: 'HOT O₁ 全版',
    group: ['B', 'C'],
    phase: 1,
    timeLimit: 20,
    autoOpenDate: '2026-03-10',
    autoCloseDate: '2026-03-16',
    context: '你是一家中型電子零件組裝工廠的工程師，負責評估與維護廠內的設備監控系統。工廠有50台生產機台，部分已安裝感測器，部分仍依賴人工巡檢。',
    questions: [
      // A 組 分析層 (5 題)
      {
        id: 'A1',
        type: 'textarea',
        label: '【分析題 A1】工廠的無線溫度監控系統在週一至週五的下午2\u20134點，某生產區的感測器讀值會規律性偏高（顯示38\u201342\u00b0C），但工程師現場測量實際溫度正常（約28\u00b0C）。此現象在三週前更換為Wi-Fi無線感測模組後開始出現。從以下三個角度，各提出一個最可能的原因，並說明你會優先排查哪一個，依據是什麼？\n（感測器硬體本身／訊號傳輸與通訊／電磁環境干擾）',
        required: true,
      },
      {
        id: 'A2',
        type: 'textarea',
        label: '【分析題 A2】工廠需要監控機台油壓，評估兩種方案：方案甲（類比0\u201310V，精度\u00b10.1bar，成本高）vs 方案乙（數位I\u00b2C，精度\u00b10.5bar，成本低）。比較在兩種場景下的適用性：\n（1）精密液壓成形機（偏差超過\u00b10.3bar造成瑕疵）\n（2）一般冷卻水循環泵（只需監控是否正常運作）',
        required: true,
      },
      {
        id: 'A3',
        type: 'textarea',
        label: '【分析題 A3】工廠品管系統過去一個月的5000筆警報記錄：甲類（讀值瞬間超閾值1秒內恢復，40%）、乙類（讀值持續偏高超過10分鐘，35%）、丙類（讀值突然歸零，25%）。分析每類警報最可能的系統原因，並說明哪一類對生產危害最大，為什麼？',
        required: true,
      },
      {
        id: 'A4',
        type: 'textarea',
        label: '【分析題 A4】工廠的溫濕度監控系統每15分鐘記錄一次，過去30天數據分析後發現，週末（無生產）的溫度標準差（\u03c3=0.3\u00b0C）遠小於工作日（\u03c3=2.8\u00b0C）。推斷造成工作日高溫度變異的可能因素（至少3個），並說明哪些是你能透過感測器系統改善的，哪些需要其他介入手段？',
        required: true,
      },
      {
        id: 'A5',
        type: 'textarea',
        label: '【分析題 A5】工廠評估導入預測性維護系統，工程師提出兩種資料策略：策略X（每台機台安裝5種感測器，每秒採樣，雲端即時分析）vs 策略Y（選定關鍵機台安裝2種感測器，每分鐘採樣，本地端分析）。從資料量、延遲、成本、維護複雜度四個面向，分析兩種策略的取捨，並說明你認為哪種更適合規模為50台機台的中型工廠。',
        required: true,
      },
      // B 組 評鑑層 (5 題)
      {
        id: 'B1',
        type: 'textarea',
        label: '【評鑑題 B1】工廠採購部門提出3個感測器節點方案：方案A（Arduino Uno + 以太網模組，成本低，需工程師熟悉程式碼），方案B（樹莓派4，功能強大，功耗高），方案C（ESP32，Wi-Fi/BLE雙模，低功耗）。假設你是顧問，需評估哪個方案最適合「長期部署在機台旁、需要每30秒上傳一次溫濕度資料到工廠伺服器、整體預算限制低」的場景。請列出你的評估標準、各方案的優缺點，並給出明確建議與理由。',
        required: true,
      },
      {
        id: 'B2',
        type: 'textarea',
        label: '【評鑑題 B2】工廠IT部門提議將現有的感測器資料從區域網路遷移到公有雲平台，同時有工廠工程師反對，認為「生產數據不能外傳」。從資料安全性、生產連續性（斷網風險）、成本、延展性四個面向，評估這兩種立場的合理性，並提出你認為最平衡的解決方案。',
        required: true,
      },
      {
        id: 'B3',
        type: 'textarea',
        label: '【評鑑題 B3】工廠監控系統目前的警報觸發邏輯是「讀值超過固定閾值即警報」。資深工程師建議改為「基於過去30天均值+2個標準差的動態閾值」，但工廠品管主任反對說「固定閾值才能保證法規合規」。評估兩種方案各自的優點與潛在缺陷，並提出你認為在工廠實際生產環境中更合適的做法，需考量技術可行性與法規需求。',
        required: true,
      },
      {
        id: 'B4',
        type: 'textarea',
        label: '【評鑑題 B4】工廠生產線新增了機器視覺系統（攝影機+邊緣運算）用於瑕疵品辨識，辨識準確率92%。有人建議讓視覺系統直接控制機台自動停機，另有人建議改為「輔助人工判斷」。從生產效率、誤判風險（型I/II誤差）、工人接受度、維護責任五個面向，評估兩種部署策略，並給出你的建議。',
        required: true,
      },
      {
        id: 'B5',
        type: 'textarea',
        label: '【評鑑題 B5】工廠考慮在所有生產機台安裝振動感測器以提前預測機械故障，預估安裝成本每台NT$15,000，預計可降低非計畫性停機時間60%。目前每次非計畫停機平均損失NT$50,000，年均停機次數8次。請評估這個投資案的財務合理性（計算ROI），並點出這個評估中有哪些假設是你認為最不確定、需要進一步驗證的？',
        required: true,
      },
      // C 組 創造層 (3 題)
      {
        id: 'C1',
        type: 'textarea',
        label: '【創造題 C1】（10分）工廠希望為50台機台設計一個低成本的「智慧預警系統」，需求如下：\n（1）即時監控溫度、電流、振動三種參數\n（2）異常時在30秒內通知現場工程師\n（3）預算限制：每台硬體成本不超過NT$2,000\n（4）工廠現有Wi-Fi基礎建設，但覆蓋不穩定\n\n請設計一個完整的系統架構，包含：硬體選型（說明理由）、通訊方案設計（含斷網備援機制）、警報邏輯設計、資料儲存方案。並指出你認為設計中最大的技術風險是什麼，如何降低？',
        required: true,
      },
      {
        id: 'C2',
        type: 'textarea',
        label: '【創造題 C2】（10分）工廠想建立一套「設備健康指數（EHI）」儀表板，讓廠長能在手機上即時掌握全廠50台機台的健康狀態。請設計這個EHI的計算邏輯（使用哪些感測數據？如何加權？如何定義「健康」vs「警戒」vs「危險」閾值？），以及儀表板的核心功能（顯示什麼資訊？支援哪些操作？）和資料流架構（感測器\u2192邊緣\u2192雲端\u2192前端的完整路徑）。',
        required: true,
      },
      {
        id: 'C3',
        type: 'textarea',
        label: '【創造題 C3】（10分）工廠目前的生產數據（感測器log、品檢記錄、維修記錄）分散在三個不連通的系統。你的任務是設計一個「工廠數據整合平台」的MVP（最小可行產品），在預算NT$100,000以內實現：跨系統數據整合、即時異常警報、基本的預測性維護功能。請說明你的技術選型（含理由）、系統架構圖（文字描述）、MVP功能範圍取捨，以及3個月內的實施路線圖。',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M05: hot_o1_simple (HOT O1 簡版, group A only)
  // ----------------------------------------------------------
  {
    id: 'hot_o1_simple',
    title: 'HOT O₁ 簡版',
    group: ['A'],
    phase: 1,
    timeLimit: 15,
    autoOpenDate: '2026-03-10',
    autoCloseDate: '2026-03-16',
    context: '你是一家中型電子零件組裝工廠的工程師，負責評估與維護廠內的設備監控系統。工廠有50台生產機台，部分已安裝感測器，部分仍依賴人工巡檢。',
    questions: [
      {
        id: 'A1',
        type: 'textarea',
        label: '【分析題 A1】工廠的無線溫度監控系統在週一至週五的下午2\u20134點，某生產區的感測器讀值會規律性偏高（顯示38\u201342\u00b0C），但工程師現場測量實際溫度正常（約28\u00b0C）。此現象在三週前更換為Wi-Fi無線感測模組後開始出現。從以下三個角度，各提出一個最可能的原因，並說明你會優先排查哪一個，依據是什麼？\n（感測器硬體本身／訊號傳輸與通訊／電磁環境干擾）',
        required: true,
      },
      {
        id: 'A2',
        type: 'textarea',
        label: '【分析題 A2】工廠需要監控機台油壓，評估兩種方案：方案甲（類比0\u201310V，精度\u00b10.1bar，成本高）vs 方案乙（數位I\u00b2C，精度\u00b10.5bar，成本低）。比較在兩種場景下的適用性：\n（1）精密液壓成形機（偏差超過\u00b10.3bar造成瑕疵）\n（2）一般冷卻水循環泵（只需監控是否正常運作）',
        required: true,
      },
      {
        id: 'A3',
        type: 'textarea',
        label: '【分析題 A3】工廠品管系統過去一個月的5000筆警報記錄：甲類（讀值瞬間超閾值1秒內恢復，40%）、乙類（讀值持續偏高超過10分鐘，35%）、丙類（讀值突然歸零，25%）。分析每類警報最可能的系統原因，並說明哪一類對生產危害最大，為什麼？',
        required: true,
      },
      {
        id: 'A4',
        type: 'textarea',
        label: '【分析題 A4】工廠的溫濕度監控系統每15分鐘記錄一次，過去30天數據分析後發現，週末（無生產）的溫度標準差（\u03c3=0.3\u00b0C）遠小於工作日（\u03c3=2.8\u00b0C）。推斷造成工作日高溫度變異的可能因素（至少3個），並說明哪些是你能透過感測器系統改善的，哪些需要其他介入手段？',
        required: true,
      },
      {
        id: 'A5',
        type: 'textarea',
        label: '【分析題 A5】工廠評估導入預測性維護系統，工程師提出兩種資料策略：策略X（每台機台安裝5種感測器，每秒採樣，雲端即時分析）vs 策略Y（選定關鍵機台安裝2種感測器，每分鐘採樣，本地端分析）。從資料量、延遲、成本、維護複雜度四個面向，分析兩種策略的取捨，並說明你認為哪種更適合規模為50台機台的中型工廠。',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M06: concept_map_pre
  // ----------------------------------------------------------
  {
    id: 'concept_map_pre',
    title: '概念圖前測',
    group: ['B', 'C'],
    phase: 1,
    autoOpenDate: '2026-03-10',
    autoCloseDate: '2026-03-16',
    questions: [
      {
        id: 'info',
        type: 'info',
        label: '請手繪或使用CmapTools製作你對「嵌入式系統/IoT」的理解概念圖，不限主題，自由發揮。完成後拍照或截圖上傳。',
      },
      {
        id: 'concept_map_file',
        type: 'file',
        label: '上傳概念圖（圖片檔）',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M07: task_lab03 (INFO only)
  // ----------------------------------------------------------
  {
    id: 'task_lab03',
    title: '任務卡 Lab03',
    group: ['A'],
    phase: 2,
    autoOpenDate: '2026-03-17',
    context: `Lab03 任務情境：LED 燈光控制系統設計

【情境】你是一位受委託的工程師，需要為一家小型辦公室設計一套基於Arduino的LED燈光控制系統，要求：
1. 根據環境亮度自動調節LED亮度（使用光敏電阻）
2. 支援手動模式覆蓋（按鈕切換）
3. 當LED持續發光超過2小時，自動降低亮度至60%（節能模式）
4. 系統狀態（自動/手動/節能）需透過蜂鳴器短聲提示

【STEAM連結】
- Science: 光感測原理、PWM調光
- Technology: Arduino程式設計、感測器整合
- Engineering: 系統可靠性、狀態機設計
- Arts: 使用者體驗、燈光美感
- Mathematics: 亮度百分比計算、時間計數

【可用材料】Arduino Uno \u00d7 1、LED \u00d7 3、光敏電阻 \u00d7 1、蜂鳴器 \u00d7 1、按鈕 \u00d7 1、麵包板、杜邦線若干`,
    questions: [
      {
        id: 'ack',
        type: 'checkbox',
        label: '我已閱讀任務卡內容',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M08: design_lab03
  // ----------------------------------------------------------
  {
    id: 'design_lab03',
    title: '設計說明書 Lab03',
    group: ['A'],
    phase: 2,
    timeLimit: 20,
    autoOpenDate: '2026-03-17',
    autoCloseDate: '2026-03-23',
    questions: [
      {
        id: 'design',
        type: 'textarea',
        label: '系統設計說明：請描述你的整體系統設計邏輯，包含各元件如何協作、狀態機設計，以及你如何實現三種模式之間的切換。',
        required: true,
      },
      {
        id: 'problem',
        type: 'textarea',
        label: '問題解決過程：在實作過程中，你遇到了哪些技術挑戰？你是如何分析問題並找到解決方案的？請具體描述至少一個問題的排查過程。',
        required: true,
      },
      {
        id: 'steam',
        type: 'textarea',
        label: 'STEAM元素整合：在這個任務中，你如何整合科學、技術、工程、藝術、數學等元素？請舉例說明你的設計決策如何體現跨領域思維。',
        required: true,
      },
      {
        id: 'improve',
        type: 'textarea',
        label: '改進方向：如果有更多時間或資源，你會如何改進這個系統？請提出至少兩個具體的改進方向並說明理由。',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M09: task_lab04 (INFO only)
  // ----------------------------------------------------------
  {
    id: 'task_lab04',
    title: '任務卡 Lab04',
    group: ['A'],
    phase: 2,
    autoOpenDate: '2026-03-24',
    context: `Lab04 任務情境：環境監控與警報系統設計

【情境】你被委託設計一套工廠環境監控警報系統，需要：
1. 同時監控溫度（DHT22）和超音波距離感測器（HC-SR04）
2. 溫度超過32\u00b0C或距離小於20cm時啟動警報（蜂鳴器）
3. 七段顯示器顯示當前溫度值（整數）
4. 透過序列埠每5秒輸出一筆「溫度、距離、警報狀態」的格式化資料
5. 設計「靜音模式」：按下按鈕後關閉蜂鳴器，但繼續記錄資料

【STEAM連結】
- Science: 溫濕度感測原理、超音波測距原理
- Technology: I\u00b2C/DHT協定、多感測器整合
- Engineering: 中斷處理、去抖動設計
- Arts: 顯示介面設計、使用者操作邏輯
- Mathematics: 溫度換算、距離計算公式

【可用材料】Arduino Uno、DHT22感測器、HC-SR04超音波模組、7段顯示器（共陰）、蜂鳴器、按鈕、麵包板`,
    questions: [
      {
        id: 'ack',
        type: 'checkbox',
        label: '我已閱讀任務卡內容',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M10: design_lab04
  // ----------------------------------------------------------
  {
    id: 'design_lab04',
    title: '設計說明書 Lab04',
    group: ['A'],
    phase: 2,
    timeLimit: 20,
    autoOpenDate: '2026-03-24',
    autoCloseDate: '2026-03-30',
    questions: [
      {
        id: 'design',
        type: 'textarea',
        label: '系統設計說明：請描述你的整體系統設計邏輯，包含各元件如何協作、狀態機設計，以及你如何實現各項功能需求。',
        required: true,
      },
      {
        id: 'problem',
        type: 'textarea',
        label: '問題解決過程：在實作過程中，你遇到了哪些技術挑戰？你是如何分析問題並找到解決方案的？請具體描述至少一個問題的排查過程。',
        required: true,
      },
      {
        id: 'steam',
        type: 'textarea',
        label: 'STEAM元素整合：在這個任務中，你如何整合科學、技術、工程、藝術、數學等元素？請舉例說明你的設計決策如何體現跨領域思維。',
        required: true,
      },
      {
        id: 'improve',
        type: 'textarea',
        label: '改進方向：如果有更多時間或資源，你會如何改進這個系統？請提出至少兩個具體的改進方向並說明理由。',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M11: task_lab05 (INFO only)
  // ----------------------------------------------------------
  {
    id: 'task_lab05',
    title: '任務卡 Lab05',
    group: ['A'],
    phase: 2,
    autoOpenDate: '2026-03-31',
    context: `Lab05 任務情境：智慧計數顯示系統設計

【情境】你需要為生產線設計一套零件計數顯示系統：
1. 使用四位元七段顯示器（74HC595驅動）顯示0000\u20139999的計數值
2. 按鈕A：增加計數（需防止按鈕抖動）
3. 按鈕B：重置計數至0000
4. 計數達到設定目標值時（如0100），蜂鳴器發出三聲提示，顯示器閃爍3次
5. 目標值可透過序列埠指令設定（格式：SET:XXXX）
6. 每次計數變化均記錄時間戳，透過序列埠輸出

【STEAM連結】
- Science: 數位邏輯、BCD碼解析
- Technology: 移位暫存器（74HC595）、序列通訊
- Engineering: 狀態機設計、記憶體管理
- Arts: 數字顯示美感、使用者回饋設計
- Mathematics: 進位制換算、四位數分解

【可用材料】Arduino Uno、四位元七段顯示器模組、74HC595移位暫存器、蜂鳴器、按鈕\u00d72、麵包板`,
    questions: [
      {
        id: 'ack',
        type: 'checkbox',
        label: '我已閱讀任務卡內容',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M12: design_lab05
  // ----------------------------------------------------------
  {
    id: 'design_lab05',
    title: '設計說明書 Lab05',
    group: ['A'],
    phase: 2,
    timeLimit: 20,
    autoOpenDate: '2026-03-31',
    questions: [
      {
        id: 'design',
        type: 'textarea',
        label: '系統設計說明：請描述你的整體系統設計邏輯，包含各元件如何協作、狀態機設計，以及你如何實現各項功能需求。',
        required: true,
      },
      {
        id: 'problem',
        type: 'textarea',
        label: '問題解決過程：在實作過程中，你遇到了哪些技術挑戰？你是如何分析問題並找到解決方案的？請具體描述至少一個問題的排查過程。',
        required: true,
      },
      {
        id: 'steam',
        type: 'textarea',
        label: 'STEAM元素整合：在這個任務中，你如何整合科學、技術、工程、藝術、數學等元素？請舉例說明你的設計決策如何體現跨領域思維。',
        required: true,
      },
      {
        id: 'improve',
        type: 'textarea',
        label: '改進方向：如果有更多時間或資源，你會如何改進這個系統？請提出至少兩個具體的改進方向並說明理由。',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M13: hot_o2
  // ----------------------------------------------------------
  {
    id: 'hot_o2',
    title: 'HOT O₂',
    group: ['B', 'C'],
    phase: 2,
    timeLimit: 12,
    autoOpenDate: '2026-03-31',
    autoCloseDate: '2026-03-31',
    context: '以下題目情境為感測器整合應用，對應你在Lab03\u201305的學習內容。',
    questions: [
      {
        id: 'Q1',
        type: 'textarea',
        label: '【分析 Q1】你的Lab03系統在自動模式下，發現光敏電阻讀值在穩定環境下每5分鐘出現一次異常低值（約比正常低40%），持續約3秒後恢復正常。請分析三個最可能的原因，並說明你會如何驗證這個假設。',
        required: true,
      },
      {
        id: 'Q2',
        type: 'textarea',
        label: '【分析 Q2】比較DHT22和DS18B20兩種溫度感測器在以下三個場景的適用性：\n（1）需要同時測量溫濕度\n（2）需要在-55\u00b0C環境運作\n（3）需要在同一條訊號線連接12個感測器\n請針對每個場景說明你的選擇與理由。',
        required: true,
      },
      {
        id: 'Q3',
        type: 'textarea',
        label: '【分析 Q3】Lab04的系統需要同時處理超音波感測（觸發+接收）和七段顯示器掃描，工程師發現超音波測距不穩定。請分析可能是什麼程式設計問題導致的（從任務排程、計時精度、阻塞式vs非阻塞式設計的角度分析）。',
        required: true,
      },
      {
        id: 'Q4',
        type: 'textarea',
        label: '【評鑑 Q4】你的實驗室同學設計了兩套計數系統：同學A使用硬體中斷偵測按鈕，同學B使用主迴圈輪詢（polling）偵測按鈕。評估這兩種方法在以下條件下的優劣：\n（1）需要快速響應（<50ms）\n（2）系統同時執行顯示掃描任務\n（3）需要精確計數（不能漏計）\n給出你的最終建議。',
        required: true,
      },
      {
        id: 'Q5',
        type: 'textarea',
        label: '【評鑑 Q5】工廠考慮將你的計數系統從Arduino升級到ESP32，並新增Wi-Fi資料上傳功能。評估這個升級在技術層面（硬體相容性、程式碼移植難度）和系統層面（可靠性、功耗、成本）的影響，並說明你認為升級最大的風險是什麼。',
        required: true,
      },
      {
        id: 'Q6',
        type: 'textarea',
        label: '【評鑑 Q6】你的Lab05系統使用74HC595移位暫存器驅動七段顯示器。有同學提議改用TM1637模組替代74HC595方案。評估兩種方案在開發效率、學習價值、成本、可擴展性四個維度的優劣，並說明在課程教育目標（理解底層原理）和實際產品開發目標下，各自應選哪種方案。',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M14: self_efficacy_post
  // ----------------------------------------------------------
  {
    id: 'self_efficacy_post',
    title: '自我效能量表（後測）',
    group: ['A', 'B', 'C'],
    phase: 2,
    autoOpenDate: '2026-03-31',
    questions: [
      { id: 'se1', type: 'likert5', label: '我有信心完成這門課的實作任務', options: LIKERT5_OPTIONS, required: true },
      { id: 'se2', type: 'likert5', label: '面對新的技術挑戰，我相信自己能找到解決方法', options: LIKERT5_OPTIONS, required: true },
      { id: 'se3', type: 'likert5', label: '即使遇到困難，我仍然能夠堅持完成任務', options: LIKERT5_OPTIONS, required: true },
      { id: 'se4', type: 'likert5', label: '我能夠有效地運用課堂所學解決實際問題', options: LIKERT5_OPTIONS, required: true },
      { id: 'se5', type: 'likert5', label: '當程式出現錯誤時，我有能力找出並修正問題', options: LIKERT5_OPTIONS, required: true },
      { id: 'se6', type: 'likert5', label: '我對自己完成硬體與軟體整合任務有信心', options: LIKERT5_OPTIONS, required: true },
      { id: 'se7', type: 'likert5', label: '我相信透過努力，我可以掌握IoT相關技術', options: LIKERT5_OPTIONS, required: true },
      { id: 'se8', type: 'likert5', label: '與同學合作討論技術問題時，我能有效地表達自己的想法', options: LIKERT5_OPTIONS, required: true },
      { id: 'se9', type: 'likert5', label: '面對複雜的系統設計問題，我有信心提出可行方案', options: LIKERT5_OPTIONS, required: true },
      { id: 'se10', type: 'likert5', label: '整體而言，我對自己在這門課的學習表現有信心', options: LIKERT5_OPTIONS, required: true },
    ],
  },

  // ----------------------------------------------------------
  // M15: hot_o3
  // ----------------------------------------------------------
  {
    id: 'hot_o3',
    title: 'HOT O₃',
    group: ['B', 'C'],
    phase: 3,
    timeLimit: 20,
    autoOpenDate: '2026-04-28',
    autoCloseDate: '2026-04-28',
    context: '以下題目情境為完整IoT系統設計，整合Lab03\u201308所有學習內容（包含感測器、通訊、雲端、系統整合）。',
    questions: [
      // A 組 分析層 (5 題)
      {
        id: 'A1',
        type: 'textarea',
        label: '【分析 A1】一個部署在工廠的IoT監控節點（ESP32+多感測器）定期向雲端伺服器上傳資料，但工廠IT記錄顯示每天都有2\u20133個節點出現「資料中斷10\u201330分鐘」的現象。從感測器層、通訊層、雲端接收層三個層次，各提出一個最可能的原因，並說明你會如何透過Log分析縮小問題範圍。',
        required: true,
      },
      {
        id: 'A2',
        type: 'textarea',
        label: '【分析 A2】比較MQTT、HTTP REST、WebSocket三種通訊協定在以下IoT場景的適用性：\n（1）需要即時雙向控制的工廠機台\n（2）定期上傳批次數據的環境監控節點\n（3）需要同時接收100個節點資料更新的儀表板\n請針對每個場景分析協定選擇的關鍵因素。',
        required: true,
      },
      {
        id: 'A3',
        type: 'textarea',
        label: '【分析 A3】一個智慧農業IoT系統部署了50個土壤感測器節點，每5分鐘上傳一次資料。資料工程師發現過去3個月的資料中，有15%的資料點有缺失，且缺失分布不均勻（某些節點缺失率高達40%，某些接近0%）。分析可能導致資料缺失分布不均的系統性原因（至少4個），並提出資料品質監控機制。',
        required: true,
      },
      {
        id: 'A4',
        type: 'textarea',
        label: '【分析 A4】FastAPI後端收到的感測器資料格式如下：{"node_id": "F3A2", "temp": 28.5, "humidity": 65.2, "timestamp": 1709123456, "battery": 87}。假設你需要設計一個資料驗證函數，分析這筆資料中哪些欄位需要驗證哪些條件（值域、格式、邏輯關係），並說明如果不做驗證，各種異常資料會對下游分析造成什麼影響。',
        required: true,
      },
      {
        id: 'A5',
        type: 'textarea',
        label: '【分析 A5】一個工廠邊緣運算節點（樹莓派）同時處理：影像辨識（每幀約200ms）、感測器資料採集（每秒10次）、MQTT訊息發布（每秒5次）、本地資料庫寫入（每分鐘一次批次寫入）。分析這四個任務在以下情況下的執行衝突：CPU密集vs I/O密集任務的排程問題、記憶體競爭問題。並提出任務優化架構（使用多執行緒/多進程/非同步的建議）。',
        required: true,
      },
      // B 組 評鑑層 (5 題)
      {
        id: 'B1',
        type: 'textarea',
        label: '【評鑑 B1】你的團隊開發了一個IoT資料平台，有成員提議使用TimescaleDB（時序資料庫），另有成員堅持用MySQL。從查詢效能（時序資料的範圍查詢）、資料壓縮、開發複雜度、運維成本、社群支援五個維度，評估兩種方案的優劣，並給出你在以下兩個場景的選擇：\n（1）N=15的研究實驗數據收集\n（2）日均百萬筆的工廠生產監控',
        required: true,
      },
      {
        id: 'B2',
        type: 'textarea',
        label: '【評鑑 B2】工廠IoT系統目前採用集中式架構（所有節點數據\u2192中央雲端伺服器\u2192分析\u2192結果回傳）。工程師提議改為邊緣計算架構（部分分析在節點本地執行）。評估這個架構轉變在延遲（控制響應速度）、頻寬成本、系統複雜度、故障點、資安風險五個維度的影響，並說明哪些應用場景適合混合架構。',
        required: true,
      },
      {
        id: 'B3',
        type: 'textarea',
        label: '【評鑑 B3】安全研究員發現工廠IoT系統存在以下問題：\n（1）MQTT broker沒有認證\n（2）所有節點共用同一個API金鑰\n（3）感測器韌體3年未更新\n（4）管理介面使用HTTP而非HTTPS\n請評估每個問題的嚴重性（從攻擊者的角度分析可能的利用方式），並按優先順序排列修復建議，說明你的評估邏輯。',
        required: true,
      },
      {
        id: 'B4',
        type: 'textarea',
        label: '【評鑑 B4】你的IoT平台需要支援「遠端韌體更新（OTA）」功能。評估以下三種OTA策略：策略A（直接覆蓋更新，速度快，失敗則磚化）、策略B（雙分區備份，失敗自動回滾，儲存空間需求翻倍）、策略C（差分更新，傳輸量小，實現複雜）。從可靠性、儲存需求、網路頻寬、開發複雜度評估三種策略，並說明你對工廠生產環境的建議。',
        required: true,
      },
      {
        id: 'B5',
        type: 'textarea',
        label: '【評鑑 B5】一個智慧建築IoT系統已穩定運行2年，業主希望新增AI預測能耗功能。系統架構師提出「完全重構」vs「漸進式整合」兩種方案。從技術債、風險、成本、時間、對現有用戶影響五個維度，評估兩種策略，並描述你認為最佳的整合路徑（包含具體的技術決策點）。',
        required: true,
      },
      // C 組 創造層 (3 題)
      {
        id: 'C1',
        type: 'textarea',
        label: '【創造 C1】（10分）設計一個「工廠能源效率優化系統」的完整架構。需求：\n（1）整合電力計、溫濕度、CO\u2082感測器\n（2）AI模型根據生產排程預測能源需求\n（3）自動調節空調、照明、設備待機策略\n（4）向廠長提供每日能源報告\n（5）系統需在斷網時仍能自主運作\n\n請設計：硬體層架構（感測器選型+佈建策略）、軟體層架構（邊緣+雲端分工）、AI模型設計思路（輸入特徵、輸出決策、訓練資料來源）、使用者介面核心功能，以及你認為最難實現的部分與解決思路。',
        required: true,
      },
      {
        id: 'C2',
        type: 'textarea',
        label: '【創造 C2】（10分）你被要求設計一個「工廠工人健康安全監控系統（WHSM）」，可穿戴裝置（手環）整合心率、體表溫度、加速度感測器，搭配廠區定位系統。需求：\n（1）即時偵測異常（如中暑風險、跌倒）\n（2）個人化健康基線（每位工人個別校準）\n（3）隱私保護（工人有權控制哪些資料上傳）\n（4）緊急事件30秒內通知最近的急救人員\n\n請設計完整的系統（可穿戴設備規格、通訊架構、異常偵測演算法邏輯、隱私保護機制、緊急響應流程），並討論這個系統在倫理層面需要考量什麼。',
        required: true,
      },
      {
        id: 'C3',
        type: 'textarea',
        label: '【創造 C3】（10分）設計一個「開源IoT教育套件」，讓沒有程式背景的高中生能在3小時內完成一個有意義的IoT專題。套件需要：\n（1）包含3\u20135個感測器和執行元件\n（2）提供一個Web介面讓學生不需要寫程式就能設置邏輯\n（3）支援至少3個預設應用場景（學生可以選一個快速完成，也可以自訂）\n（4）成本控制在NT$800以內\n\n請設計：硬體清單與理由、Web介面核心功能與操作流程、3個預設應用場景（各描述功能、學習目標、預期挑戰）、如何在保持易用性的同時讓有基礎的學生能進一步探索底層程式碼。',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M16: concept_map_post
  // ----------------------------------------------------------
  {
    id: 'concept_map_post',
    title: '概念圖後測',
    group: ['B', 'C'],
    phase: 3,
    timeLimit: 10,
    autoOpenDate: '2026-04-28',
    autoCloseDate: '2026-04-28',
    context: '請以「IoT系統」為根節點，畫出你在這門課學到的所有相關概念及其關係。工具：紙本手繪\u2192拍照，或CmapTools截圖。時間限制：10分鐘。',
    questions: [
      {
        id: 'concept_map_file',
        type: 'file',
        label: '上傳概念圖（圖片檔）',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M17: gaber
  // ----------------------------------------------------------
  {
    id: 'gaber',
    title: 'GABER 問題解決測驗',
    group: ['B', 'C'],
    phase: 3,
    timeLimit: 15,
    autoOpenDate: '2026-04-28',
    autoCloseDate: '2026-04-28',
    context: '以下為三個工程問題解決情境。請針對每題，依照 G-A-B-E-R 框架作答：G（目標識別）、A（假設識別）、B（方案發想，至少2個）、E（方案評估）、R（最終解決方案）。',
    questions: [
      {
        id: 'P1',
        type: 'textarea',
        label: '【問題 P1】你維護的辦公室IoT節能系統（8個CO\u2082感測器 + 空調控制）今早收到警報：2號會議室CO\u2082讀值持續顯示5000ppm（正常辦公環境約800\u20131200ppm），但現場人員反映空氣品質正常。系統已自動開啟最大換氣量，導致辦公室過冷，員工抱怨不斷。你需要在30分鐘內解決問題（重要會議即將開始）。請用GABER框架描述你的問題解決過程。',
        required: true,
      },
      {
        id: 'P2',
        type: 'textarea',
        label: '【問題 P2】你負責為一棟8層樓的智慧建築選擇室內環境監控感測器。需求：每層樓8個點位，共64個感測器。需監控溫度（\u00b10.5\u00b0C精度）、濕度（\u00b13%精度）、CO\u2082（\u00b150ppm精度）、PM2.5。預算限制：每個節點不超過NT$3,000。三個方案可選：\n方案A（多功能整合感測器，每個NT$2,800，精度全部達標，但供應商僅有海外進貨）\n方案B（分離式感測器組合，各項精度達標，每節點NT$2,200，但需自行組裝）\n方案C（較低精度整合感測器，溫度\u00b11\u00b0C、CO\u2082\u00b1100ppm，每個NT$1,500）\n請用GABER框架說明你的選型決策過程。',
        required: true,
      },
      {
        id: 'P3',
        type: 'textarea',
        label: '【問題 P3】你的FastAPI後端最近接到資安審計報告，指出以下端點存在安全問題：\n\n@app.get("/sensor-data/{node_id}")\nasync def get_sensor_data(node_id: str):\n    query = f"SELECT * FROM sensors WHERE node_id = \'{node_id}\'"\n    result = await db.fetch(query)\n    return result\n\n審計員指出這個端點有SQL injection漏洞，且沒有身份驗證。你的任務是修復這個端點，同時確保不破壞現有已部署的15個感測器節點的正常運作（這些節點目前直接呼叫此API）。請用GABER框架說明你的修復策略，包含如何在保持向下相容性的前提下提升安全性。',
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------
  // M18: tam
  // ----------------------------------------------------------
  {
    id: 'tam',
    title: 'TAM 滿意度問卷',
    description: '請針對你在本課程中使用的學習輔助系統，回答以下問題。',
    group: ['A', 'B'],
    phase: 3,
    autoOpenDate: '2026-04-28',
    questions: [
      { id: 'tam1', type: 'likert5', label: '使用這個系統讓我更深入理解課程內容', options: LIKERT5_OPTIONS, required: true },
      { id: 'tam2', type: 'likert5', label: '系統中的真實情境讓我更能思考技術的應用', options: LIKERT5_OPTIONS, required: true },
      { id: 'tam3', type: 'likert5', label: '系統的高階題目（評鑑/創造/設計層）對我的思維發展有幫助', options: LIKERT5_OPTIONS, required: true },
      { id: 'tam4', type: 'likert5', label: '整體而言，這個系統對我的學習有幫助', options: LIKERT5_OPTIONS, required: true },
      { id: 'tam5', type: 'likert5', label: '系統的情境描述清楚，我能理解要做什麼', options: LIKERT5_OPTIONS, required: true },
      { id: 'tam6', type: 'likert5', label: '系統操作簡單，不影響我的學習進行', options: LIKERT5_OPTIONS, required: true },
      { id: 'tam7', type: 'likert5', label: '每次使用所需時間在我可接受範圍內', options: LIKERT5_OPTIONS, required: true },
      { id: 'tam8', type: 'likert5', label: '任務難度循序漸進，不會突然太難', options: LIKERT5_OPTIONS, required: true },
      { id: 'tam9', type: 'likert5', label: '未來我願意使用類似的學習輔助系統', options: LIKERT5_OPTIONS, required: true },
      { id: 'tam10', type: 'likert5', label: '我會推薦同學嘗試這種學習方式', options: LIKERT5_OPTIONS, required: true },
      { id: 'tam11', type: 'likert5', label: '如果可以選擇，我希望其他課程也採用此形式', options: LIKERT5_OPTIONS, required: true },
    ],
  },
]

// ============================================================
// Helper functions
// ============================================================

export function getModulesForGroup(group: GroupId): Module[] {
  return MODULES.filter((m) => m.group.includes(group))
}

export function getModuleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id)
}

export function getPhases(): Phase[] {
  return [1, 2, 3]
}

export const GROUP_LABELS: Record<string, string> = {
  A: '實踐組',
  B: '高階組',
  C: '傳統組',
}
