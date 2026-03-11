import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { put } from '@vercel/blob'
import { saveRubric } from '@/lib/blob'

interface SubmitPayload {
  moduleId: string
  data: Record<string, unknown>
  startTime?: string
  endTime?: string
  type?: 'response' | 'rubric'
  // Rubric-specific fields
  lab?: string
  scores?: Record<string, number>
  notes?: string
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
    const body: SubmitPayload = await request.json()

    // Handle rubric submission from TA
    if (body.type === 'rubric') {
      if (identity.role !== 'ta' && identity.role !== 'admin') {
        return NextResponse.json(
          { error: '僅限助教或管理員提交評分' },
          { status: 403 }
        )
      }

      if (!body.lab || !body.data || !body.scores) {
        return NextResponse.json(
          { error: '缺少必要欄位' },
          { status: 400 }
        )
      }

      const studentId = body.data.studentId as string
      const total = Object.values(body.scores).reduce((a, b) => a + b, 0)

      await saveRubric({
        studentId,
        lab: body.lab,
        taId: identity.code,
        scores: body.scores,
        total,
        notes: body.notes || '',
        scoredAt: new Date().toISOString(),
      })

      return NextResponse.json({ success: true })
    }

    // Handle student response submission
    if (identity.role !== 'student') {
      return NextResponse.json(
        { error: '僅限學生提交' },
        { status: 403 }
      )
    }

    const { moduleId, data, startTime, endTime } = body

    if (!moduleId || !data) {
      return NextResponse.json(
        { error: '缺少必要欄位' },
        { status: 400 }
      )
    }

    // Calculate time taken in seconds
    let timeTaken: number | undefined
    if (startTime && endTime) {
      timeTaken = Math.round(
        (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
      )
    }

    const responseData = {
      studentId: identity.code,
      moduleId,
      answers: data,
      submittedAt: new Date().toISOString(),
      timeTaken,
      startTime,
      endTime,
      group: identity.group,
    }

    const pathname = `responses/${identity.code}/${moduleId}/${Date.now()}.json`
    await put(pathname, JSON.stringify(responseData), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
