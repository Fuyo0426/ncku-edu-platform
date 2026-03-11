'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getIdentity, type Identity } from '@/lib/auth'
import { getModuleById, type GroupId, type Question } from '@/lib/modules'
import { ArrowLeft, Clock } from 'lucide-react'

// ============================================================
// Question Renderers
// ============================================================

function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: Question
  value: unknown
  onChange: (id: string, val: unknown) => void
}) {
  switch (question.type) {
    case 'info':
      return (
        <div className="rounded-lg bg-accent/50 p-4">
          <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
            {question.label}
          </p>
        </div>
      )

    case 'checkbox':
      return (
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(question.id, e.target.checked)}
            className="mt-0.5 h-5 w-5 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-foreground leading-relaxed">
            {question.label}
          </span>
        </label>
      )

    case 'radio':
      return (
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">
            {question.label}
            {question.required && <span className="text-error ml-1">*</span>}
          </legend>
          <div className="space-y-2">
            {question.options?.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(question.id, opt)}
                  className="h-4 w-4 border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{opt}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )

    case 'likert5':
      return (
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-foreground">
            {question.label}
            {question.required && <span className="text-error ml-1">*</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {question.options?.map((opt, i) => (
              <label
                key={opt}
                className={`flex-1 min-w-[80px] cursor-pointer rounded-lg border-2 px-2 py-2.5 text-center text-xs font-medium transition-all ${
                  value === String(i + 1)
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-white text-foreground hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={String(i + 1)}
                  checked={value === String(i + 1)}
                  onChange={() => onChange(question.id, String(i + 1))}
                  className="sr-only"
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>
      )

    case 'textarea':
      return (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {question.label}
            {question.required && <span className="text-error ml-1">*</span>}
          </label>
          <textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="請在此填寫你的回答..."
          />
          {typeof value === 'string' && value.length > 0 && (
            <p className="mt-1 text-right text-xs text-muted">
              已輸入 {value.length} 字
            </p>
          )}
        </div>
      )

    case 'text':
      return (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {question.label}
            {question.required && <span className="text-error ml-1">*</span>}
          </label>
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )

    case 'file':
      return (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {question.label}
            {question.required && <span className="text-error ml-1">*</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                const reader = new FileReader()
                reader.onload = () => {
                  onChange(question.id, reader.result)
                }
                reader.readAsDataURL(file)
              }
            }}
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-white"
          />
          {value ? (
            <p className="mt-1 text-xs text-success">已選擇檔案</p>
          ) : null}
        </div>
      )

    default:
      return null
  }
}

// ============================================================
// Timer Component
// ============================================================

function Timer({
  remaining,
  isUrgent,
}: {
  remaining: number
  isUrgent: boolean
}) {
  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  const display = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-lg ${
        isUrgent
          ? 'animate-pulse bg-error text-white'
          : 'bg-card text-foreground border border-border'
      }`}
    >
      <Clock className="h-4 w-4" />
      {display}
    </div>
  )
}

// ============================================================
// Main Page
// ============================================================

export default function ModulePage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.moduleId as string
  const moduleDef = getModuleById(moduleId)

  const [identity, setIdentity] = useState<Identity | null>(null)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [error, setError] = useState('')

  // Timer state
  const [timerStarted, setTimerStarted] = useState(false)
  const [remaining, setRemaining] = useState(
    moduleDef?.timeLimit ? moduleDef.timeLimit * 60 : 0
  )
  const startTimeRef = useRef<string>('')
  const submittedRef = useRef(false)

  useEffect(() => {
    const id = getIdentity()
    if (!id || id.role !== 'student') {
      router.push('/')
      return
    }
    if (moduleDef && !moduleDef.group.includes(id.group as GroupId)) {
      router.push('/dashboard')
      return
    }
    setIdentity(id)

    // Check if already submitted
    async function checkSubmission() {
      try {
        const res = await fetch('/api/modules')
        if (res.ok) {
          const json = await res.json()
          if (json.completedModules?.includes(moduleId)) {
            setAlreadySubmitted(true)
          }
        }
      } catch {
        // Ignore errors
      }
    }
    checkSubmission()
  }, [router, moduleDef, moduleId])

  const doSubmit = useCallback(async () => {
    if (submittedRef.current || !identity || !moduleDef) return
    submittedRef.current = true
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          data: answers,
          startTime: startTimeRef.current || new Date().toISOString(),
          endTime: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error || '提交失敗')
        submittedRef.current = false
        return
      }

      setSubmitted(true)
    } catch {
      setError('網路錯誤，請稍後再試')
      submittedRef.current = false
    } finally {
      setSubmitting(false)
    }
  }, [identity, moduleDef, moduleId, answers])

  // Timer effect
  useEffect(() => {
    if (!timerStarted || !moduleDef?.timeLimit) return
    if (remaining <= 0) {
      doSubmit()
      return
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          doSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timerStarted, remaining, moduleDef?.timeLimit, doSubmit])

  function handleAnswerChange(id: string, val: unknown) {
    setAnswers((prev) => ({ ...prev, [id]: val }))
  }

  function handleStartTimer() {
    startTimeRef.current = new Date().toISOString()
    setTimerStarted(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate required fields
    if (moduleDef) {
      for (const q of moduleDef.questions) {
        if (q.required && q.type !== 'info') {
          const val = answers[q.id]
          if (val === undefined || val === null || val === '' || val === false) {
            setError(`請回答：${q.label.slice(0, 30)}...`)
            return
          }
        }
      }
    }

    doSubmit()
  }

  // Not found
  if (!moduleDef) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-error">模組不存在</p>
      </div>
    )
  }

  // Already submitted (from a previous session)
  if (alreadySubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">已完成</h1>
          <p className="mt-2 text-sm text-muted">你已完成此模組</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary mt-6"
          >
            返回待辦清單
          </button>
        </div>
      </div>
    )
  }

  // Just submitted
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">提交成功</h1>
          <p className="mt-2 text-sm text-muted">你的回答已成功儲存</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary mt-6"
          >
            返回待辦清單
          </button>
        </div>
      </div>
    )
  }

  // Timed module: show start screen first
  if (moduleDef.timeLimit && !timerStarted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {moduleDef.title}
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-12">
          <div className="flex flex-col items-center gap-6">
            <Clock className="h-12 w-12 text-primary" />
            <h2 className="text-lg font-bold text-foreground">計時測驗</h2>
            <p className="text-sm text-muted text-center">
              本測驗限時 <strong>{moduleDef.timeLimit} 分鐘</strong>，開始後無法暫停。
              <br />
              時間到會自動提交。
            </p>
            {moduleDef.context && (
              <div className="w-full rounded-lg bg-accent/50 p-4">
                <p className="text-xs font-semibold text-muted mb-2">情境說明</p>
                <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {moduleDef.context}
                </p>
              </div>
            )}
            <button onClick={handleStartTimer} className="btn-primary">
              開始作答
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen bg-background">
      {/* Timer */}
      {moduleDef.timeLimit && timerStarted && (
        <Timer remaining={remaining} isUrgent={remaining <= 60} />
      )}

      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {moduleDef.title}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Context */}
        {moduleDef.context && !moduleDef.timeLimit && (
          <div className="mb-6 rounded-lg bg-accent/50 p-4">
            <p className="text-xs font-semibold text-muted mb-2">情境說明</p>
            <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {moduleDef.context}
            </p>
          </div>
        )}

        {/* Description */}
        {moduleDef.description && (
          <p className="mb-6 text-sm text-muted">{moduleDef.description}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {moduleDef.questions.map((q, idx) => (
              <div key={q.id} className="card">
                {moduleDef.questions.length > 1 && q.type !== 'info' && (
                  <p className="mb-3 text-xs font-semibold text-muted">
                    第 {idx + 1} 題 / 共 {moduleDef.questions.filter((qq) => qq.type !== 'info').length} 題
                  </p>
                )}
                <QuestionRenderer
                  question={q}
                  value={answers[q.id]}
                  onChange={handleAnswerChange}
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-4 text-sm text-error">{error}</p>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? '提交中...' : '提交'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
