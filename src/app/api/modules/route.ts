import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getModuleStatus, getStudentCompletedModules } from '@/lib/blob'

/**
 * GET /api/modules
 * Returns module status and completion for the current user.
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const identityRaw = cookieStore.get('edu_identity')?.value
    if (!identityRaw) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const identity = JSON.parse(identityRaw)

    const [statusMap, completedModules] = await Promise.all([
      getModuleStatus(),
      identity.role === 'student'
        ? getStudentCompletedModules(identity.code)
        : Promise.resolve([]),
    ])

    // Convert status map to simple boolean map
    const boolStatusMap: Record<string, boolean> = {}
    for (const [moduleId, status] of Object.entries(statusMap)) {
      boolStatusMap[moduleId] = status.isOpen
    }

    return NextResponse.json({
      statusMap: boolStatusMap,
      completedModules,
    })
  } catch {
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
