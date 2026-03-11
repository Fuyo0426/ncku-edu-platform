export type Phase = 'pre' | 'lab03' | 'lab04' | 'lab05' | 'lab08'
export type GroupId = 'A' | 'B' | 'C'

export interface ModuleDefinition {
  id: string
  name: string
  groups: GroupId[]
  phase: Phase
  timed?: number // seconds, if this module has a time limit
}

export const MODULES: ModuleDefinition[] = [
  { id: 'consent', name: '知情同意書', groups: ['A', 'B', 'C'], phase: 'pre' },
  { id: 'basic-info', name: '基本資料問卷', groups: ['A', 'B', 'C'], phase: 'pre' },
  { id: 'self-efficacy-pre', name: '自我效能量表（前測）', groups: ['A', 'B', 'C'], phase: 'pre' },
  { id: 'hot-o1-short', name: 'HOT O\u2081 簡版（5題）', groups: ['A'], phase: 'pre' },
  { id: 'hot-o1-full', name: 'HOT O\u2081 全版（13題）', groups: ['B', 'C'], phase: 'pre' },
  { id: 'concept-map-pre', name: '概念圖前測', groups: ['B', 'C'], phase: 'pre' },
  { id: 'task-card-lab03', name: '任務卡 Lab03', groups: ['A'], phase: 'lab03' },
  { id: 'design-report-lab03', name: '設計說明書 Lab03', groups: ['A'], phase: 'lab03' },
  { id: 'task-card-lab04', name: '任務卡 Lab04', groups: ['A'], phase: 'lab04' },
  { id: 'design-report-lab04', name: '設計說明書 Lab04', groups: ['A'], phase: 'lab04' },
  { id: 'task-card-lab05', name: '任務卡 Lab05', groups: ['A'], phase: 'lab05' },
  { id: 'hot-o2', name: 'HOT O\u2082（期中測）', groups: ['B', 'C'], phase: 'lab05' },
  { id: 'design-report-lab05', name: '設計說明書 Lab05', groups: ['A'], phase: 'lab05' },
  { id: 'self-efficacy-post', name: '自我效能量表（後測）', groups: ['A', 'B', 'C'], phase: 'lab05' },
  { id: 'hot-o3', name: 'HOT O\u2083（後測）', groups: ['B', 'C'], phase: 'lab08' },
  { id: 'concept-map-post', name: '概念圖後測', groups: ['B', 'C'], phase: 'lab08' },
  { id: 'gaber', name: 'GABER 問題解決測驗', groups: ['B', 'C'], phase: 'lab08' },
  { id: 'tam', name: 'TAM 滿意度問卷', groups: ['A', 'B'], phase: 'lab08' },
]

export const PHASE_LABELS: Record<Phase, string> = {
  pre: '前測階段',
  lab03: 'Lab 03',
  lab04: 'Lab 04',
  lab05: 'Lab 05',
  lab08: 'Lab 08（後測）',
}

export function getModulesForGroup(group: GroupId): ModuleDefinition[] {
  return MODULES.filter(m => m.groups.includes(group))
}

export function getModuleById(id: string): ModuleDefinition | undefined {
  return MODULES.find(m => m.id === id)
}

export function getPhases(): Phase[] {
  return ['pre', 'lab03', 'lab04', 'lab05', 'lab08']
}
