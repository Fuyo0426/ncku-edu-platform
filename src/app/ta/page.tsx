'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getIdentity } from '@/lib/auth'
import { ClipboardList, LogOut, ChevronDown } from 'lucide-react'

const STUDENTS = [
  'A01', 'A02', 'A03', 'A04', 'A05',
  'B01', 'B02', 'B03', 'B04', 'B05',
  'C01', 'C02', 'C03', 'C04', 'C05',
]

const LABS = ['lab03', 'lab04', 'lab05']

const DIMENSIONS = [
  { key: 'wiring', label: '接線正確性' },
  { key: 'logic', label: '程式邏輯' },
  { key: 'debugging', label: '除錯能力' },
  { key: 'extension', label: '延伸應用' },
  { key: 'efficiency', label: '效率表現' },
] as const

type DimensionKey = typeof DIMENSIONS[number]['key']

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
    wiring: 0,
    logic: 0,
    debugging: 0,
    extension: 0,
    efficiency: 0,
  })
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [existingScores, setExistingScores] = useState<RubricScore[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Observation form
  const [obsContent, setObsContent] = useState('')
  const [obsMessage, setObsMessage] = useState('')

  useEffect(() => {
    const id = getIdentity()
    if (!id || id.role !== 'ta') {
      router.push('/')
    }
  }, [router])

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/admin?action=rubrics')
      if (res.ok) {
        const json = await res.json()
        const filtered = (json.rubrics || []).filter(
          (r: RubricScore) => r.lab === selectedLab
        )
        setExistingScores(filtered)
      }
    } catch (err) {
      console.error('Failed to fetch scores:', err)
    }
  }, [selectedLab])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    const allScored = DIMENSIONS.every((d) => scores[d.key] > 0)
    if (!allScored) {
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
          scores: Object.fromEntries(
            DIMENSIONS.map((d) => [d.key, scores[d.key]])
          ),
          notes: notes || '',
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setMessage('儲存失敗: ' + (json.error || ''))
      } else {
        setMessage('評分已儲存')
        setScores({ wiring: 0, logic: 0, debugging: 0, extension: 0, efficiency: 0 })
        setNotes('')
        fetchScores()
      }
    } catch {
      setMessage('網路錯誤')
    }
    setSubmitting(false)
  }

  async function handleObservation() {
    if (!obsContent.trim()) return
    setObsMessage('')

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-observation',
          lab: selectedLab,
          taId: 'TA',
          data: { content: obsContent, lab: selectedLab },
        }),
      })

      if (res.ok) {
        setObsMessage('觀察紀錄已儲存')
        setObsContent('')
      } else {
        setObsMessage('儲存失敗')
      }
    } catch {
      setObsMessage('網路錯誤')
    }
  }

  function handleLogout() {
    document.cookie = 'edu_identity=; path=/; max-age=0'
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">助教評分系統</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                實驗週次
              </label>
              <select
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {LABS.map((lab) => (
                  <option key={lab} value={lab}>
                    {lab.toUpperCase().replace('LAB', 'Lab ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                學生代碼
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {STUDENTS.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rubric */}
          <div className="card space-y-5">
            <h2 className="text-base font-bold text-foreground">
              Rubric 五維度評分
            </h2>

            {DIMENSIONS.map((dim) => (
              <div key={dim.key}>
                <p className="mb-2 text-sm font-medium text-foreground">
                  {dim.label}
                </p>
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
                        onChange={() =>
                          setScores((prev) => ({ ...prev, [dim.key]: val }))
                        }
                        className="sr-only"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted">
                總分：
                <span className="ml-1 text-lg font-bold text-foreground">
                  {Object.values(scores).reduce((a, b) => a + b, 0)}
                </span>
                <span className="text-muted"> / 20</span>
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              備註
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="觀察紀錄、特殊狀況..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes('失敗') || message.includes('錯誤')
                  ? 'text-error'
                  : 'text-success'
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? '儲存中...' : '提交評分'}
          </button>
        </form>

        {/* Observation Form */}
        <div className="mt-8 card">
          <h2 className="text-base font-bold text-foreground mb-4">
            課堂觀察紀錄
          </h2>
          <textarea
            value={obsContent}
            onChange={(e) => setObsContent(e.target.value)}
            rows={4}
            placeholder="記錄課堂觀察（學生互動、提問、遇到的困難等）..."
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
          {obsMessage && (
            <p
              className={`mt-2 text-sm ${
                obsMessage.includes('失敗') ? 'text-error' : 'text-success'
              }`}
            >
              {obsMessage}
            </p>
          )}
          <button
            type="button"
            onClick={handleObservation}
            disabled={!obsContent.trim()}
            className="btn-primary mt-3"
          >
            儲存觀察紀錄
          </button>
        </div>

        {/* History */}
        <div className="mt-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-sm font-medium text-primary"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`}
            />
            已評分記錄 ({existingScores.length})
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
                    <th className="pb-2 pr-3">總分</th>
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
                      <td className="py-2 pr-3 font-bold">{s.total}</td>
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
