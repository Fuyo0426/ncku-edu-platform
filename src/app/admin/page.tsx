'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getIdentity } from '@/lib/auth'
import { MODULES, PHASE_LABELS, type Phase, type Module } from '@/lib/modules'
import { Settings, LogOut, RefreshCw, ToggleLeft, ToggleRight, Download } from 'lucide-react'

const ALL_STUDENTS = [
  'A01', 'A02', 'A03', 'A04', 'A05',
  'B01', 'B02', 'B03', 'B04', 'B05',
  'C01', 'C02', 'C03', 'C04', 'C05',
]

interface RubricScore {
  studentId: string
  lab: string
  taId: string
  scores: Record<string, number>
  total: number
  notes: string
  scoredAt: string
}

interface AdminData {
  completionMap: Record<string, string[]>
  statusMap: Record<string, boolean>
  modules: Module[]
}

export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'progress' | 'rubrics' | 'export'>('progress')
  const [rubrics, setRubrics] = useState<RubricScore[]>([])
  const [rubricsLoaded, setRubricsLoaded] = useState(false)

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

  const fetchRubrics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin?action=rubrics')
      if (res.ok) {
        const json = await res.json()
        setRubrics(json.rubrics || [])
        setRubricsLoaded(true)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    const id = getIdentity()
    if (!id || id.role !== 'admin') {
      router.push('/')
      return
    }
    fetchData()
  }, [router, fetchData])

  useEffect(() => {
    if (activeTab === 'rubrics' && !rubricsLoaded) {
      fetchRubrics()
    }
  }, [activeTab, rubricsLoaded, fetchRubrics])

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

  function handleExport(group: string) {
    window.open(`/api/admin?action=export&group=${group}`, '_blank')
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
  const modulesByPhase: Record<Phase, Module[]> = {} as Record<Phase, Module[]>
  for (const mod of MODULES) {
    if (!modulesByPhase[mod.phase]) modulesByPhase[mod.phase] = []
    modulesByPhase[mod.phase].push(mod)
  }

  function getCompletionCount(moduleId: string): number {
    let count = 0
    for (const code of ALL_STUDENTS) {
      if (data!.completionMap[code]?.includes(moduleId)) count++
    }
    return count
  }

  function getApplicableCount(mod: Module): number {
    return ALL_STUDENTS.filter((code) =>
      mod.group.includes(code.charAt(0) as 'A' | 'B' | 'C')
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

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl px-4">
          {[
            { key: 'progress' as const, label: '進度總覽' },
            { key: 'rubrics' as const, label: 'Rubric 評分' },
            { key: 'export' as const, label: '匯出資料' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-8">
        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <>
            {/* Module Controls & Stats */}
            {(Object.entries(modulesByPhase) as [string, Module[]][]).map(
              ([phase, mods]) => (
                <section key={phase}>
                  <h2 className="mb-4 text-base font-bold text-foreground">
                    {PHASE_LABELS[Number(phase) as Phase]}
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
                                {mod.title}
                              </span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-muted">
                                {mod.group.join(', ')} 組
                              </span>
                              {mod.timeLimit && (
                                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-primary">
                                  {mod.timeLimit}min
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3">
                              <span className="text-xs text-muted">
                                完成 {completed}/{applicable} 人
                              </span>
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
                          title={mod.title}
                        >
                          <div className="w-12 truncate text-xs" title={mod.id}>{mod.title.replace('（前測）','前').replace('（後測）','後').replace('設計說明書','說明').replace('任務卡','任務').replace(' 全版','').replace(' 簡版','簡').replace('問題解決測驗','GABER').replace('滿意度問卷','TAM')}</div>
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
                          const isApplicable = mod.group.includes(
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
          </>
        )}

        {/* Rubrics Tab */}
        {activeTab === 'rubrics' && (
          <section>
            <h2 className="mb-4 text-base font-bold text-foreground">
              Rubric 評分記錄
            </h2>
            {rubrics.length === 0 ? (
              <p className="text-sm text-muted">尚無評分記錄</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted">
                      <th className="pb-2 pr-3 text-left">學生</th>
                      <th className="pb-2 pr-3 text-left">Lab</th>
                      <th className="pb-2 pr-3 text-left">助教</th>
                      <th className="pb-2 pr-3 text-center">接線</th>
                      <th className="pb-2 pr-3 text-center">邏輯</th>
                      <th className="pb-2 pr-3 text-center">除錯</th>
                      <th className="pb-2 pr-3 text-center">延伸</th>
                      <th className="pb-2 pr-3 text-center">效率</th>
                      <th className="pb-2 pr-3 text-center">總分</th>
                      <th className="pb-2 pr-3 text-left">備註</th>
                      <th className="pb-2 text-left">時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rubrics.map((r, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 pr-3 font-medium">{r.studentId}</td>
                        <td className="py-2 pr-3">{r.lab}</td>
                        <td className="py-2 pr-3">{r.taId}</td>
                        <td className="py-2 pr-3 text-center">{r.scores?.wiring ?? '-'}</td>
                        <td className="py-2 pr-3 text-center">{r.scores?.logic ?? '-'}</td>
                        <td className="py-2 pr-3 text-center">{r.scores?.debugging ?? '-'}</td>
                        <td className="py-2 pr-3 text-center">{r.scores?.extension ?? '-'}</td>
                        <td className="py-2 pr-3 text-center">{r.scores?.efficiency ?? '-'}</td>
                        <td className="py-2 pr-3 text-center font-bold">{r.total}</td>
                        <td className="py-2 pr-3 max-w-[200px] truncate text-xs text-muted">
                          {r.notes || '-'}
                        </td>
                        <td className="py-2 text-xs text-muted">
                          {new Date(r.scoredAt).toLocaleString('zh-TW')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <section>
            <h2 className="mb-4 text-base font-bold text-foreground">
              匯出資料
            </h2>
            <p className="mb-6 text-sm text-muted">
              按組別匯出所有學生提交的回應資料（CSV 格式）。
            </p>
            <div className="grid grid-cols-3 gap-4">
              {['A', 'B', 'C'].map((group) => (
                <button
                  key={group}
                  onClick={() => handleExport(group)}
                  className="card flex flex-col items-center gap-3 py-6 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                >
                  <Download className="h-8 w-8 text-primary" />
                  <span className="text-sm font-bold text-foreground">
                    {group} 組
                  </span>
                  <span className="text-xs text-muted">
                    {group === 'A' ? '實踐組' : group === 'B' ? '高階組' : '傳統組'}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
