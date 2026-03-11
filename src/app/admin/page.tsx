'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getIdentity } from '@/lib/auth'
import { MODULES, PHASE_LABELS, type Phase, type ModuleDefinition } from '@/lib/modules'
import { Settings, LogOut, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react'

const ALL_STUDENTS = [
  'A01', 'A02', 'A03', 'A04', 'A05',
  'B01', 'B02', 'B03', 'B04', 'B05',
  'C01', 'C02', 'C03', 'C04', 'C05',
]

interface AdminData {
  completionMap: Record<string, string[]>
  statusMap: Record<string, boolean>
  modules: ModuleDefinition[]
}

export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin')
      if (!res.ok) {
        router.push('/')
        return
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const id = getIdentity()
    if (!id || id.role !== 'admin') {
      router.push('/')
      return
    }
    fetchData()
  }, [router, fetchData])

  async function toggleModule(moduleId: string, currentEnabled: boolean) {
    setToggling(moduleId)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-module',
          moduleId,
          enabled: !currentEnabled,
        }),
      })
      if (res.ok) {
        setData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            statusMap: {
              ...prev.statusMap,
              [moduleId]: !currentEnabled,
            },
          }
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(null)
    }
  }

  function handleLogout() {
    document.cookie = 'edu_identity=; path=/; max-age=0'
    router.push('/')
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">載入中...</p>
      </div>
    )
  }

  // Group modules by phase
  const modulesByPhase: Record<Phase, ModuleDefinition[]> = {} as Record<Phase, ModuleDefinition[]>
  for (const mod of MODULES) {
    if (!modulesByPhase[mod.phase]) modulesByPhase[mod.phase] = []
    modulesByPhase[mod.phase].push(mod)
  }

  // Count completions per module
  function getCompletionCount(moduleId: string): number {
    let count = 0
    for (const code of ALL_STUDENTS) {
      if (data!.completionMap[code]?.includes(moduleId)) count++
    }
    return count
  }

  // Get applicable student count for a module
  function getApplicableCount(mod: ModuleDefinition): number {
    return ALL_STUDENTS.filter((code) =>
      mod.groups.includes(code.charAt(0) as 'A' | 'B' | 'C')
    ).length
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">管理員 Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLoading(true)
                fetchData()
              }}
              className="rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-foreground"
              title="重新整理"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-8">
        {/* Module Controls & Stats */}
        {(Object.entries(modulesByPhase) as [Phase, ModuleDefinition[]][]).map(
          ([phase, mods]) => (
            <section key={phase}>
              <h2 className="mb-4 text-base font-bold text-foreground">
                {PHASE_LABELS[phase]}
              </h2>

              <div className="space-y-2">
                {mods.map((mod) => {
                  const enabled = data.statusMap[mod.id] ?? false
                  const completed = getCompletionCount(mod.id)
                  const applicable = getApplicableCount(mod)
                  const isToggling = toggling === mod.id

                  return (
                    <div
                      key={mod.id}
                      className="card flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {mod.name}
                          </span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-muted">
                            {mod.groups.join(', ')} 組
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-xs text-muted">
                            完成 {completed}/{applicable} 人
                          </span>
                          {/* Mini progress bar */}
                          <div className="h-1.5 w-24 rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full bg-primary transition-all"
                              style={{
                                width: `${applicable > 0 ? (completed / applicable) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleModule(mod.id, enabled)}
                        disabled={isToggling}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          enabled
                            ? 'bg-success/10 text-success'
                            : 'bg-slate-100 text-muted'
                        }`}
                      >
                        {enabled ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                        {isToggling ? '...' : enabled ? '已開放' : '未開放'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        )}

        {/* Completion Matrix */}
        <section>
          <h2 className="mb-4 text-base font-bold text-foreground">
            學生完成進度矩陣
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 bg-card px-2 py-2 text-left font-medium text-muted">
                    學生
                  </th>
                  {MODULES.map((mod) => (
                    <th
                      key={mod.id}
                      className="px-1 py-2 text-center font-medium text-muted"
                      title={mod.name}
                    >
                      <div className="w-8 truncate">{mod.id.slice(0, 4)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_STUDENTS.map((code) => (
                  <tr key={code} className="border-b border-border/50">
                    <td className="sticky left-0 bg-card px-2 py-1.5 font-medium text-foreground">
                      {code}
                    </td>
                    {MODULES.map((mod) => {
                      const isApplicable = mod.groups.includes(
                        code.charAt(0) as 'A' | 'B' | 'C'
                      )
                      const isCompleted =
                        data.completionMap[code]?.includes(mod.id) ?? false

                      return (
                        <td key={mod.id} className="px-1 py-1.5 text-center">
                          {!isApplicable ? (
                            <span className="text-slate-200">-</span>
                          ) : isCompleted ? (
                            <span className="text-success">&#10003;</span>
                          ) : (
                            <span className="text-slate-300">&#9744;</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
