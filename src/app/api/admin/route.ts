import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  getAllResponses,
  getAllRubrics,
  getModuleStatus,
  saveModuleStatus,
  saveObservation,
  getAllObservations,
  type ResponseData,
} from '@/lib/blob'
import { MODULES } from '@/lib/modules'

const ALL_STUDENTS = [
  'A01', 'A02', 'A03', 'A04', 'A05',
  'B01', 'B02', 'B03', 'B04', 'B05',
  'C01', 'C02', 'C03', 'C04', 'C05',
]

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const identityRaw = cookieStore.get('edu_identity')?.value
  if (!identityRaw) return false
  try {
    const identity = JSON.parse(identityRaw)
    return identity.role === 'admin'
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    // Default: return progress data (completion map + status map)
    if (!action || action === 'progress') {
      const [responses, statusMap] = await Promise.all([
        getAllResponses(),
        getModuleStatus(),
      ])

      // Build completion map: { code: [moduleId, ...] }
      const completionMap: Record<string, string[]> = {}
      for (const r of responses) {
        const code = r.studentId
        if (!completionMap[code]) completionMap[code] = []
        if (!completionMap[code].includes(r.moduleId)) {
          completionMap[code].push(r.moduleId)
        }
      }

      // Build status map as { moduleId: boolean }
      const boolStatusMap: Record<string, boolean> = {}
      for (const mod of MODULES) {
        boolStatusMap[mod.id] = statusMap[mod.id]?.isOpen ?? false
      }

      return NextResponse.json({
        completionMap,
        statusMap: boolStatusMap,
        modules: MODULES,
      })
    }

    // Export CSV for a group
    if (action === 'export') {
      const group = searchParams.get('group') || 'A'
      const responses = await getAllResponses()

      const groupResponses = responses.filter((r) =>
        r.studentId.startsWith(group)
      )

      // Build CSV
      const rows: string[] = []
      rows.push('studentId,moduleId,submittedAt,timeTaken,answers')

      for (const r of groupResponses) {
        const answersStr = JSON.stringify(r.answers).replace(/"/g, '""')
        rows.push(
          `${r.studentId},${r.moduleId},${r.submittedAt},${r.timeTaken ?? ''},\"${answersStr}\"`
        )
      }

      return new NextResponse(rows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=export_group_${group}_${Date.now()}.csv`,
        },
      })
    }

    // Return all rubric scores
    if (action === 'rubrics') {
      const rubrics = await getAllRubrics()
      return NextResponse.json({ rubrics })
    }

    // Return module status config
    if (action === 'config') {
      const status = await getModuleStatus()
      return NextResponse.json({ status })
    }

    // Return all observations
    if (action === 'observations') {
      const observations = await getAllObservations()
      return NextResponse.json({ observations })
    }

    // Return all raw responses
    if (action === 'responses') {
      const responses = await getAllResponses()
      return NextResponse.json({ responses })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (err) {
    console.error('Admin API error:', err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'toggle-module') {
      const { moduleId, enabled } = body
      if (!moduleId || typeof enabled !== 'boolean') {
        return NextResponse.json({ error: '缺少參數' }, { status: 400 })
      }

      const status = await getModuleStatus()
      status[moduleId] = {
        isOpen: enabled,
        ...(enabled
          ? { openAt: new Date().toISOString() }
          : { closeAt: new Date().toISOString() }),
      }
      await saveModuleStatus(status)

      return NextResponse.json({ success: true })
    }

    if (action === 'save-observation') {
      const { lab, taId, data } = body
      if (!lab || !data) {
        return NextResponse.json({ error: '缺少參數' }, { status: 400 })
      }
      await saveObservation(lab, taId || 'ADMIN', data)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (err) {
    console.error('Admin POST error:', err)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
