'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getIdentity } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
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
  id: string
  student_code: string
  lab: string
  wiring: number
  logic: number
  debugging: number
  extension: number
  efficiency: number
  total: number
  notes: string
  scored_at: string
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

  useEffect(() => {
    const id = getIdentity()
    if (!id || id.role !== 'ta') {
      router.push('/')
    }
  }, [router])

  const fetchScores = useCallback(async () => {
    const { data } = await supabase
      .from('rubric_scores')
      .select('*')
      .eq('lab', selectedLab)
      .order('scored_at', { ascending: false })

    if (data) {
      setExistingScores(data as RubricScore[])
    }
  }, [selectedLab])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    // Validate all dimensions scored
    const allScored = DIMENSIONS.every((d) => scores[d.key] > 0)
    if (!allScored) {
      setMessage('請為所有維度評分')
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('rubric_scores').insert({
      student_code: selectedStudent,
      lab: selectedLab,
      scorer: 'TA',
      wiring: scores.wiring,
      logic: scores.logic,
      debugging: scores.debugging,
      extension: scores.extension,
      efficiency: scores.efficiency,
      notes: notes || null,
    })

    if (error) {
      setMessage('儲存失敗: ' + error.message)
    } else {
      setMessage('評分已儲存')
      setScores({ wiring: 0, logic: 0, debugging: 0, extension: 0, efficiency: 0 })
      setNotes('')
      fetchScores()
    }
    setSubmitting(false)
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
                message.includes('失敗') ? 'text-error' : 'text-success'
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
                  {existingScores.map((s) => (
                    <tr key={s.id} className="border-b border-border/50">
                      <td className="py-2 pr-3 font-medium">{s.student_code}</td>
                      <td className="py-2 pr-3">{s.wiring}</td>
                      <td className="py-2 pr-3">{s.logic}</td>
                      <td className="py-2 pr-3">{s.debugging}</td>
                      <td className="py-2 pr-3">{s.extension}</td>
                      <td className="py-2 pr-3">{s.efficiency}</td>
                      <td className="py-2 pr-3 font-bold">{s.total}</td>
                      <td className="py-2 text-xs text-muted">
                        {new Date(s.scored_at).toLocaleString('zh-TW')}
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
