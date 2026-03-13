'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'

const GROUPS = [
  {
    label: 'A 組（實踐組）',
    prefix: 'A',
    codes: ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10'],
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800',
    selectedColor: 'bg-blue-600 border-blue-600 text-white',
  },
  {
    label: 'B 組（高階組）',
    prefix: 'B',
    codes: ['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B09', 'B10'],
    color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-800',
    selectedColor: 'bg-emerald-600 border-emerald-600 text-white',
  },
  {
    label: 'C 組（傳統組）',
    prefix: 'C',
    codes: ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10'],
    color: 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800',
    selectedColor: 'bg-slate-600 border-slate-600 text-white',
  },
]

export default function SelectIdentityPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleConfirm() {
    if (!selected) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: selected }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '選擇失敗')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('網路錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            選擇你的代碼
          </h1>
          <p className="mt-2 text-sm text-muted">
            每次進入都需要選擇，請選擇你被分配的代碼
          </p>
        </div>

        {/* Groups */}
        <div className="space-y-6">
          {GROUPS.map((group) => (
            <div key={group.prefix}>
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                {group.label}
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {group.codes.map((code) => (
                  <button
                    key={code}
                    onClick={() => setSelected(code)}
                    className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                      selected === code
                        ? group.selectedColor
                        : group.color
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-error">{error}</p>
        )}

        {/* Confirm */}
        <div className="mt-8">
          <button
            onClick={handleConfirm}
            disabled={!selected || loading}
            className="btn-primary w-full"
          >
            {loading
              ? '確認中...'
              : selected
                ? `確認選擇 ${selected}`
                : '請先選擇代碼'}
          </button>
        </div>
      </div>
    </div>
  )
}
