import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { MODULES } from '@/lib/modules'

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

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  try {
    // Get all responses grouped by code and module
    const { data: responses, error: respError } = await supabase
      .from('responses')
      .select('code, module_id')

    if (respError) {
      return NextResponse.json({ error: respError.message }, { status: 500 })
    }

    // Get module statuses
    const { data: statuses, error: statusError } = await supabase
      .from('module_status')
      .select('*')

    if (statusError) {
      return NextResponse.json({ error: statusError.message }, { status: 500 })
    }

    // Build completion map: { code: Set<module_id> }
    const completionMap: Record<string, string[]> = {}
    for (const r of responses || []) {
      if (!completionMap[r.code]) completionMap[r.code] = []
      if (!completionMap[r.code].includes(r.module_id)) {
        completionMap[r.code].push(r.module_id)
      }
    }

    // Build status map
    const statusMap: Record<string, boolean> = {}
    for (const s of statuses || []) {
      statusMap[s.module_id] = s.enabled
    }

    return NextResponse.json({
      completionMap,
      statusMap,
      modules: MODULES,
    })
  } catch {
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: '未授權' }, { status: 401 })
  }

  try {
    const { action, moduleId, enabled } = await request.json()

    if (action === 'toggle-module') {
      if (!moduleId || typeof enabled !== 'boolean') {
        return NextResponse.json({ error: '缺少參數' }, { status: 400 })
      }

      // Upsert module status
      const { error } = await supabase
        .from('module_status')
        .upsert(
          {
            module_id: moduleId,
            enabled,
            ...(enabled
              ? { enabled_at: new Date().toISOString() }
              : { disabled_at: new Date().toISOString() }),
          },
          { onConflict: 'module_id' }
        )

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
