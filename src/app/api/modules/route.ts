import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

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

    // Get module statuses
    const { data: statuses } = await supabase
      .from('module_status')
      .select('module_id, enabled')

    // Get completions for this user
    const { data: responses } = await supabase
      .from('responses')
      .select('module_id')
      .eq('code', identity.code)

    const statusMap: Record<string, boolean> = {}
    for (const s of statuses || []) {
      statusMap[s.module_id] = s.enabled
    }

    const completedModules = [
      ...new Set((responses || []).map((r: { module_id: string }) => r.module_id)),
    ]

    return NextResponse.json({
      statusMap,
      completedModules,
    })
  } catch {
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
