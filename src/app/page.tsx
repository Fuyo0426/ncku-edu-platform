'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '登入失敗')
        return
      }

      switch (data.role) {
        case 'student':
          router.push('/select-identity')
          break
        case 'ta':
          router.push('/ta')
          break
        case 'admin':
          router.push('/admin')
          break
        default:
          setError('未知角色')
      }
    } catch {
      setError('網路錯誤，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            工業物聯網實驗平台
          </h1>
          <p className="mt-1 text-sm text-muted">
            國立成功大學
          </p>
        </div>

        {/* Login Card */}
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                課程密碼
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="請輸入課程密碼"
                  required
                  className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="btn-primary w-full"
            >
              {loading ? '登入中...' : '登入'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          如忘記密碼，請聯繫授課教師
        </p>
      </div>
    </div>
  )
}
