'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getIdentity, type Identity } from '@/lib/auth'
import { getModuleById, type GroupId } from '@/lib/modules'
import { ArrowLeft } from 'lucide-react'

export default function ModulePage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params.moduleId as string
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [startTime] = useState(() => new Date().toISOString())

  const moduleDef = getModuleById(moduleId)

  useEffect(() => {
    const id = getIdentity()
    if (!id || id.role !== 'student') {
      router.push('/')
      return
    }
    // Verify this student has access to this module
    if (moduleDef && !moduleDef.groups.includes(id.group as GroupId)) {
      router.push('/dashboard')
      return
    }
    setIdentity(id)
  }, [router, moduleDef])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!identity || !moduleDef) return
    setSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data: Record<string, unknown> = {}
    formData.forEach((value, key) => {
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

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          data,
          startTime,
          endTime: new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error || '提交失敗')
        return
      }

      setSubmitted(true)
    } catch {
      setError('網路錯誤，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  if (!moduleDef) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-error">模組不存在</p>
      </div>
    )
  }

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

  return (
    <div className="min-h-screen bg-background">
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
            {moduleDef.name}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Generic placeholder form - will be customized per module later */}
            <div className="rounded-lg bg-accent/50 p-4">
              <p className="text-sm text-primary">
                {moduleDef.name} -- 表單內容待設定
              </p>
              <p className="mt-1 text-xs text-muted">
                模組 ID: {moduleDef.id} | 階段: {moduleDef.phase}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                回應內容
              </label>
              <textarea
                name="response"
                rows={6}
                required
                placeholder="請在此填寫你的回答..."
                className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <div className="flex justify-end gap-3">
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
        </div>
      </main>
    </div>
  )
}
