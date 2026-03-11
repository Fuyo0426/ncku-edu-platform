import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

interface SubmitPayload {
  moduleId: string
  data: Record<string, unknown>
  startTime?: string
  endTime?: string
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const identityRaw = cookieStore.get('edu_identity')?.value
    if (!identityRaw) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      )
    }

    const identity = JSON.parse(identityRaw)
    if (identity.role !== 'student') {
      return NextResponse.json(
        { error: '僅限學生提交' },
        { status: 403 }
      )
    }

    const body: SubmitPayload = await request.json()
    const { moduleId, data, startTime, endTime } = body

    if (!moduleId || !data) {
      return NextResponse.json(
        { error: '缺少必要欄位' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('responses').insert({
      code: identity.code,
      group_id: identity.group,
      module_id: moduleId,
      data,
      start_time: startTime || null,
      end_time: endTime || null,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: '儲存失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
