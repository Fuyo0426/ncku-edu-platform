'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getIdentity, GROUP_LABELS, type Identity } from '@/lib/auth'
import { getModulesForGroup, PHASE_LABELS, type GroupId, type Module, type Phase } from '@/lib/modules'
import { CheckCircle, Lock, ChevronRight, LogOut, User } from 'lucide-react'

export default function DashboardPage() {
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())
  const [enabledModules, setEnabledModules] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/modules')
      if (!res.ok) return
      const json = await res.json()

      if (json.completedModules) {
        setCompletedModules(new Set(json.completedModules))
      }

      if (json.statusMap) {
        const enabled = new Set<string>()
        for (const [moduleId, isOpen] of Object.entries(json.statusMap)) {
          if (isOpen) enabled.add(moduleId)
        }
        setEnabledModules(enabled)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const id = getIdentity()
    if (!id || id.role !== 'student') {
      router.push('/')
      return
    }
    setIdentity(id)
    fetchData()
  }, [router, fetchData])

  function handleLogout() {
    document.cookie = 'edu_identity=; path=/; max-age=0'
    document.cookie = 'edu_role=; path=/; max-age=0'
    router.push('/')
  }

  if (loading || !identity) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">載入中...</p>
      </div>
    )
  }

  const modules = getModulesForGroup(identity.group as GroupId)

  // Group modules by phase
  const modulesByPhase = modules.reduce<Record<Phase, Module[]>>(
    (acc, mod) => {
      if (!acc[mod.phase]) acc[mod.phase] = []
      acc[mod.phase].push(mod)
      return acc
    },
    {} as Record<Phase, Module[]>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              工業物聯網實驗平台
            </h1>
            <p className="text-xs text-muted">國立成功大學</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {identity.code}
              </span>
              <span className="text-xs text-primary/70">
                {GROUP_LABELS[identity.group]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-foreground"
              title="登出"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h2 className="mb-6 text-xl font-bold text-foreground">我的待辦項目</h2>

        <div className="space-y-8">
          {(Object.entries(modulesByPhase) as [string, Module[]][]).map(
            ([phase, mods]) => (
              <section key={phase}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
                  {PHASE_LABELS[Number(phase) as Phase]}
                </h3>
                <div className="space-y-2">
                  {mods.map((mod) => {
                    const completed = completedModules.has(mod.id)
                    const enabled = enabledModules.has(mod.id)

                    return (
                      <div
                        key={mod.id}
                        className={`card flex items-center justify-between transition-all ${
                          completed
                            ? 'border-success/30 bg-green-50/50'
                            : enabled
                              ? 'cursor-pointer hover:border-primary/30 hover:shadow-md'
                              : 'opacity-60'
                        }`}
                        onClick={() => {
                          if (enabled && !completed) {
                            router.push(`/modules/${mod.id}`)
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {completed ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : enabled ? (
                            <ChevronRight className="h-5 w-5 text-primary" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted" />
                          )}
                          <div>
                            <span
                              className={`text-sm font-medium ${
                                completed
                                  ? 'text-success'
                                  : enabled
                                    ? 'text-foreground'
                                    : 'text-muted'
                              }`}
                            >
                              {mod.title}
                            </span>
                            {mod.timeLimit && (
                              <span className="ml-2 text-xs text-muted">
                                ({mod.timeLimit} 分鐘)
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted">
                          {completed
                            ? '已完成'
                            : enabled
                              ? '進入'
                              : '未開放'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          )}
        </div>
      </main>
    </div>
  )
}
