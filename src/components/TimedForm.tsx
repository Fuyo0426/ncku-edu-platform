'use client'

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { Clock } from 'lucide-react'

interface TimedFormProps {
  duration: number // seconds
  onSubmit: (payload: {
    data: Record<string, unknown>
    startTime: string
    endTime: string
  }) => void | Promise<void>
  children: ReactNode
  submitLabel?: string
}

export default function TimedForm({
  duration,
  onSubmit,
  children,
  submitLabel = '提交',
}: TimedFormProps) {
  const [remaining, setRemaining] = useState(duration)
  const [started, setStarted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const startTimeRef = useRef<string>('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = useCallback(async () => {
    if (submitted) return
    setSubmitted(true)

    const endTime = new Date().toISOString()
    const formData = new FormData(formRef.current || undefined)
    const data: Record<string, unknown> = {}
    formData.forEach((value, key) => {
      // Handle multiple values for same key (checkboxes, etc.)
      if (data[key]) {
        if (Array.isArray(data[key])) {
          (data[key] as unknown[]).push(value)
        } else {
          data[key] = [data[key], value]
        }
      } else {
        data[key] = value
      }
    })

    await onSubmit({
      data,
      startTime: startTimeRef.current,
      endTime,
    })
  }, [submitted, onSubmit])

  useEffect(() => {
    if (!started || submitted) return

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [started, submitted, handleSubmit])

  function handleStart() {
    startTimeRef.current = new Date().toISOString()
    setStarted(true)
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const isUrgent = remaining <= 60

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="text-center">
          <Clock className="mx-auto mb-3 h-12 w-12 text-primary" />
          <h2 className="text-lg font-bold text-foreground">計時測驗</h2>
          <p className="mt-2 text-sm text-muted">
            本測驗限時 {Math.floor(duration / 60)} 分鐘，開始後無法暫停
          </p>
        </div>
        <button onClick={handleStart} className="btn-primary">
          開始作答
        </button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-foreground">已提交</h2>
        <p className="text-sm text-muted">你的回答已成功送出</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Timer badge */}
      <div
        className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-lg ${
          isUrgent
            ? 'animate-pulse bg-error text-white'
            : 'bg-card text-foreground border border-border'
        }`}
      >
        <Clock className="h-4 w-4" />
        {formatTime(remaining)}
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        {children}

        <div className="mt-8 flex justify-center">
          <button type="submit" className="btn-primary">
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
