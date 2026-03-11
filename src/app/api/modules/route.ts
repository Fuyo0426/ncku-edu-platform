import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getModuleStatus, getStudentCompletedModules } from '@/lib/blob'
import { MODULES } from '@/lib/modules'

/**
 * 判斷某個模組是否根據日期自動開放
 * 台灣時間 UTC+8
 */
function isAutoOpen(moduleId: string): boolean {
  const mod = MODULES.find((m) => m.id === moduleId)
  if (!mod) return false

  // 若沒有設定 autoOpenDate，預設關閉（等管理員手動開）
  if (!mod.autoOpenDate) return false

  // 取台灣時區今日日期字串 YYYY-MM-DD
  const nowTW = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const todayStr = nowTW.toISOString().slice(0, 10)

  const isAfterOpen = todayStr >= mod.autoOpenDate
  const isBeforeClose = !mod.autoCloseDate || todayStr <= mod.autoCloseDate

  return isAfterOpen && isBeforeClose
}

/**
 * GET /api/modules
 * Returns module open status and completion for the current user.
 *
 * Priority: admin manual toggle > date-based auto logic
 * If admin has explicitly set isOpen (true or false), that wins.
 * Otherwise fall back to date logic.
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const identityRaw = cookieStore.get('edu_identity')?.value
    if (!identityRaw) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const identity = JSON.parse(identityRaw)

    const [adminStatus, completedModules] = await Promise.all([
      getModuleStatus(),
      identity.role === 'student'
        ? getStudentCompletedModules(identity.code)
        : Promise.resolve([]),
    ])

    // Merge admin override with date-based auto logic
    const boolStatusMap: Record<string, boolean> = {}
    for (const mod of MODULES) {
      const adminEntry = adminStatus[mod.id]
      if (adminEntry !== undefined) {
        // Admin has explicitly set this module → respect it
        boolStatusMap[mod.id] = adminEntry.isOpen
      } else {
        // No admin override → use date logic
        boolStatusMap[mod.id] = isAutoOpen(mod.id)
      }
    }

    return NextResponse.json({
      statusMap: boolStatusMap,
      completedModules,
    })
  } catch {
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
