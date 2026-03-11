'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getIdentity } from '@/lib/auth'
import { ClipboardList, LogOut, ChevronDown, FileText } from 'lucide-react'

// Rubric 只評實踐組 A01–A05
const RUBRIC_STUDENTS = ['A01', 'A02', 'A03', 'A04', 'A05']

// 設計說明書評分維度（4維度，各 0–4 分，共 16 分）
const DESIGN_DIMENSIONS = [
  { key: 'user_awareness',    label: '使用者意識',    desc: '設計是否考量使用者需求與體驗' },
  { key: 'stem_reasoning',   label: '科學/數學依據', desc: '有具體的技術或數學推導支撐設計' },
  { key: 'design_tradeoff',  label: '設計取捨論述', desc: '能說明為何選擇此方案，放棄哪些替代方案' },
  { key: 'beyond_basic',     label: '超越基本要求', desc: '有創意延伸或超出最低功能要求的設計' },
] as const

type DesignDimensionKey = typeof DESIGN_DIMENSIONS[number]['key']

const LABS = ['lab03', 'lab04', 'lab05']

const DIMENSIONS = [
  { key: 'wiring',    label: '接線正確性', desc: '電路接線正確、無短路、符合規格' },
  { key: 'logic',     label: '程式邏輯',   desc: '邏輯清楚、結構合理、符合需求' },
  { key: 'debugging', label: '除錯能力',   desc: '能獨立找出並修正問題' },
  { key: 'extension', label: '延伸應用',   desc: '有跨域思維或創意延伸設計' },
  { key: 'efficiency',label: '效率表現',   desc: '完成品質與時間掌控' },
] as const

type DimensionKey = typeof DIMENSIONS[number]['key']

// 結構化觀察清單
const OBS_CHECKLIST = [
  { key: 'ask_question',     label: '主動發問' },
  { key: 'help_peer',        label: '協助同學' },
  { key: 'use_ai',           label: '使用 AI 工具' },
  { key: 'hardware_trouble', label: '硬體接線困難' },
  { key: 'code_error',       label: '程式除錯困難' },
  { key: 'off_task',         label: '分心/離題行為' },
  { key: 'creative_idea',    label: '提出創意想法' },
  { key: 'give_up',          label: '有放棄傾向' },
] as const

type ObsCheckKey = typeof OBS_CHECKLIST[number]['key']

interface RubricScore {
  studentId: string
  lab: string
  taId: string
  scores: Record<string, number>
  total: number
  notes: string
  scoredAt: string
}

export default function TAPage() {
  const router = useRouter()
  const [selectedLab, setSelectedLab] = useState('lab03')
  const [selectedStudent, setSelectedStudent] = useState('A01')
  const [scores, setScores] = useState<Record<DimensionKey, number>>({
    wiring: 0, logic: 0, debugging: 0, extension: 0, efficiency: 0,
  })
  const [rubricNotes, setRubricNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [existingScores, setExistingScores] = useState<RubricScore[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState<'lab' | 'design' | 'observation'>('lab')

  // 設計說明書評分
  const [designScores, setDesignScores] = useState<Record<DesignDimensionKey, number>>({
    user_awareness: -1, stem_reasoning: -1, design_tradeoff: -1, beyond_basic: -1,
  })
  const [designStudent, setDesignStudent] = useState('A01')
  const [designNotes, setDesignNotes] = useState('')
  const [designMessage, setDesignMessage] = useState('')
  const [submittingDesign, setSubmittingDesign] = useState(false)

  // 結構化觀察筆記
  const [obsChecks, setObsChecks] = useState<Record<ObsCheckKey, boolean>>(
    Object.fromEntries(OBS_CHECKLIST.map((o) => [o.key, false])) as Record<ObsCheckKey, boolean>
  )
  const [obsCounters, setObsCounters] = useState<Record<string, number>>({
    ask_question: 0,
    use_ai: 0,
    creative_idea: 0,
  })
  const [obsNotes, setObsNotes] = useState('')
  const [obsMessage, setObsMessage] = useState('')

  useEffect(() => {
    const id = getIdentity()
    if (!id || id.role !== 'ta') router.push('/')
  }, [router])

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/admin?action=rubrics')
      if (res.ok) {
        const json = await res.json()
        setExistingScores(
          (json.rubrics || []).filter((r: RubricScore) => r.lab === selectedLab)
        )
      }
    } catch { /* ignore */ }
  }, [selectedLab])

  useEffect(() => { fetchScores() }, [fetchScores])

  async function handleRubricSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    if (DIMENSIONS.some((d) => scores[d.key] === 0)) {
      setMessage('請為所有維度評分')
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rubric',
          lab: selectedLab,
          data: { studentId: selectedStudent },
          scores: Object.fromEntries(DIMENSIONS.map((d) => [d.key, scores[d.key]])),
          notes: rubricNotes || '',
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setMessage('儲存失敗: ' + (json.error || ''))
      } else {
        setMessage('評分已儲存 ✓')
        setScores({ wiring: 0, logic: 0, debugging: 0, extension: 0, efficiency: 0 })
        setRubricNotes('')
        fetchScores()
      }
    } catch { setMessage('網路錯誤') }
    setSubmitting(false)
  }

  async function handleDesignSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmittingDesign(true)
    setDesignMessage('')
    if (DESIGN_DIMENSIONS.some((d) => designScores[d.key] === -1)) {
      setDesignMessage('請為所有維度評分')
      setSubmittingDesign(false)
      return
    }
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'rubric',
          lab: `design_${selectedLab}`,
          data: { studentId: designStudent },
          scores: Object.fromEntries(DESIGN_DIMENSIONS.map((d) => [d.key, designScores[d.key]])),
          notes: designNotes || '',
        }),
      })
      if (!res.ok) { setDesignMessage('儲存失敗') }
      else {
        setDesignMessage('設計評分已儲存 ✓')
        setDesignScores({ user_awareness: -1, stem_reasoning: -1, design_tradeoff: -1, beyond_basic: -1 })
        setDesignNotes('')
      }
    } catch { setDesignMessage('網路錯誤') }
    setSubmittingDesign(false)
  }

  async function handleObservationSubmit() {
    setObsMessage('')
    const checkedItems = OBS_CHECKLIST.filter((o) => obsChecks[o.key]).map((o) => o.label)

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-observation',
          lab: selectedLab,
          taId: 'TA',
          data: {
            lab: selectedLab,
            checkedBehaviors: checkedItems,
            counters: obsCounters,
            notes: obsNotes,
          },
        }),
      })

      if (res.ok) {
        setObsMessage('觀察紀錄已儲存 ✓')
        setObsChecks(Object.fromEntries(OBS_CHECKLIST.map((o) => [o.key, false])) as Record<ObsCheckKey, boolean>)
        setObsCounters({ ask_question: 0, use_ai: 0, creative_idea: 0 })
        setObsNotes('')
      } else {
        setObsMessage('儲存失敗')
      }
    } catch { setObsMessage('網路錯誤') }
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">助教評分系統</h1>
          </div>
          <button
            onClick={() => { document.cookie = 'edu_identity=; path=/; max-age=0'; router.push('/') }}
            className="rounded-lg p-2 text-muted hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-6">

        {/* Tab 切換 */}
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {([
            { key: 'lab',         icon: <ClipboardList className="h-4 w-4" />, label: 'Lab Rubric（實作）' },
            { key: 'design',      icon: <FileText className="h-4 w-4" />,      label: '設計說明書評分' },
            { key: 'observation', icon: <ChevronDown className="h-4 w-4" />,   label: '觀察員筆記' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white shadow text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 選擇 Lab / 學生 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">實驗週次</label>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              {LABS.map((lab) => (
                <option key={lab} value={lab}>{lab.toUpperCase().replace('LAB', 'Lab ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              學生代碼
              <span className="ml-1 text-xs font-normal text-muted">（僅實踐組 A 組）</span>
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              {RUBRIC_STUDENTS.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Lab Rubric 評分 ── */}
        {activeTab === 'lab' && <section className="card space-y-5">
          <h2 className="text-base font-bold text-foreground">Rubric 五維度評分</h2>
          <p className="text-xs text-muted">每個維度 1–4 分，總分 20 分</p>

          <form onSubmit={handleRubricSubmit} className="space-y-5">
            {DIMENSIONS.map((dim) => (
              <div key={dim.key}>
                <div className="mb-1.5 flex items-baseline gap-2">
                  <span className="text-sm font-medium text-foreground">{dim.label}</span>
                  <span className="text-xs text-muted">{dim.desc}</span>
                </div>
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((val) => (
                    <label
                      key={val}
                      className={`flex h-10 w-14 cursor-pointer items-center justify-center rounded-lg border-2 text-sm font-medium transition-all ${
                        scores[dim.key] === val
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-white text-foreground hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={dim.key}
                        value={val}
                        checked={scores[dim.key] === val}
                        onChange={() => setScores((prev) => ({ ...prev, [dim.key]: val }))}
                        className="sr-only"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted">
                總分：
                <span className="ml-1 text-lg font-bold text-foreground">{total}</span>
                <span className="text-muted"> / 20</span>
                {total > 0 && (
                  <span className={`ml-3 text-xs ${total >= 16 ? 'text-success' : total >= 12 ? 'text-primary' : 'text-error'}`}>
                    {total >= 16 ? '優秀' : total >= 12 ? '良好' : total >= 8 ? '尚可' : '需加強'}
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">備註（選填）</label>
              <textarea
                value={rubricNotes}
                onChange={(e) => setRubricNotes(e.target.value)}
                rows={2}
                placeholder="特殊表現、需關注事項..."
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-muted focus:border-primary focus:outline-none"
              />
            </div>

            {message && (
              <p className={`text-sm ${message.includes('失敗') || message.includes('錯誤') ? 'text-error' : 'text-success'}`}>
                {message}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? '儲存中...' : '提交評分'}
            </button>
          </form>
        </section>}

        {/* ── 設計說明書評分 ── */}
        {activeTab === 'design' && (
          <section className="card space-y-5">
            <h2 className="text-base font-bold text-foreground">設計說明書評分（Group A 實踐組）</h2>
            <p className="text-xs text-muted">對應 Lab03/04/05 的設計說明書，每個維度 0–4 分，總分 16 分</p>

            <form onSubmit={handleDesignSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">學生代碼</label>
                <select
                  value={designStudent}
                  onChange={(e) => setDesignStudent(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  {RUBRIC_STUDENTS.map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>

              {DESIGN_DIMENSIONS.map((dim) => (
                <div key={dim.key}>
                  <div className="mb-1.5 flex items-baseline gap-2">
                    <span className="text-sm font-medium text-foreground">{dim.label}</span>
                    <span className="text-xs text-muted">{dim.desc}</span>
                  </div>
                  <div className="flex gap-3">
                    {[0, 1, 2, 3, 4].map((val) => (
                      <label
                        key={val}
                        className={`flex h-10 w-12 cursor-pointer items-center justify-center rounded-lg border-2 text-sm font-medium transition-all ${
                          designScores[dim.key] === val
                            ? 'border-primary bg-primary text-white'
                            : 'border-border bg-white text-foreground hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`design_${dim.key}`}
                          value={val}
                          checked={designScores[dim.key] === val}
                          onChange={() => setDesignScores((prev) => ({ ...prev, [dim.key]: val }))}
                          className="sr-only"
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted">
                  設計總分：
                  <span className="ml-1 text-lg font-bold text-foreground">
                    {Object.values(designScores).reduce((a, b) => a + b, 0)}
                  </span>
                  <span className="text-muted"> / 16</span>
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">評分備注（選填）</label>
                <textarea
                  value={designNotes}
                  onChange={(e) => setDesignNotes(e.target.value)}
                  rows={2}
                  placeholder="設計亮點、需改進之處..."
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>

              {designMessage && (
                <p className={`text-sm ${designMessage.includes('失敗') || designMessage.includes('錯誤') ? 'text-error' : 'text-success'}`}>
                  {designMessage}
                </p>
              )}
              <button type="submit" disabled={submittingDesign} className="btn-primary w-full">
                {submittingDesign ? '儲存中...' : '提交設計評分'}
              </button>
            </form>
          </section>
        )}

        {/* ── 結構化觀察員筆記 ── */}
        {activeTab === 'observation' && <section className="card space-y-5">
          <h2 className="text-base font-bold text-foreground">課堂觀察紀錄</h2>
          <p className="text-xs text-muted">本次 Lab 整體觀察，不限特定學生</p>

          {/* 勾選行為 */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">觀察到的行為（可複選）</p>
            <div className="grid grid-cols-2 gap-2">
              {OBS_CHECKLIST.map((item) => (
                <label key={item.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm hover:border-primary/50">
                  <input
                    type="checkbox"
                    checked={obsChecks[item.key]}
                    onChange={(e) =>
                      setObsChecks((prev) => ({ ...prev, [item.key]: e.target.checked }))
                    }
                    className="h-4 w-4 rounded accent-primary"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* 計次欄位 */}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">行為計次</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'ask_question', label: '發問次數' },
                { key: 'use_ai',       label: 'AI 使用次數' },
                { key: 'creative_idea',label: '創意提案次數' },
              ].map((counter) => (
                <div key={counter.key} className="text-center">
                  <p className="mb-1 text-xs text-muted">{counter.label}</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setObsCounters((p) => ({ ...p, [counter.key]: Math.max(0, p[counter.key] - 1) }))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-lg hover:bg-slate-100"
                    >−</button>
                    <span className="w-8 text-center text-lg font-bold">{obsCounters[counter.key]}</span>
                    <button
                      type="button"
                      onClick={() => setObsCounters((p) => ({ ...p, [counter.key]: p[counter.key] + 1 }))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-lg hover:bg-slate-100"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 開放備注 */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">開放備注（質性觀察）</label>
            <textarea
              value={obsNotes}
              onChange={(e) => setObsNotes(e.target.value)}
              rows={4}
              placeholder="課堂氛圍、學生互動品質、特殊事件、需要追蹤的問題..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {obsMessage && (
            <p className={`text-sm ${obsMessage.includes('失敗') ? 'text-error' : 'text-success'}`}>
              {obsMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleObservationSubmit}
            className="btn-primary"
          >
            儲存觀察紀錄
          </button>
        </section>}  {/* end observation */}

        {/* ── 已評分記錄 ── */}
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            已評分記錄（{existingScores.length}）
          </button>

          {showHistory && existingScores.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="pb-2 pr-3">學生</th>
                    <th className="pb-2 pr-3">接線</th>
                    <th className="pb-2 pr-3">邏輯</th>
                    <th className="pb-2 pr-3">除錯</th>
                    <th className="pb-2 pr-3">延伸</th>
                    <th className="pb-2 pr-3">效率</th>
                    <th className="pb-2 pr-3 font-bold">總分</th>
                    <th className="pb-2">時間</th>
                  </tr>
                </thead>
                <tbody>
                  {existingScores.map((s, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 pr-3 font-medium">{s.studentId}</td>
                      <td className="py-2 pr-3">{s.scores?.wiring ?? '-'}</td>
                      <td className="py-2 pr-3">{s.scores?.logic ?? '-'}</td>
                      <td className="py-2 pr-3">{s.scores?.debugging ?? '-'}</td>
                      <td className="py-2 pr-3">{s.scores?.extension ?? '-'}</td>
                      <td className="py-2 pr-3">{s.scores?.efficiency ?? '-'}</td>
                      <td className="py-2 pr-3 font-bold text-primary">{s.total}</td>
                      <td className="py-2 text-xs text-muted">
                        {new Date(s.scoredAt).toLocaleString('zh-TW')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
