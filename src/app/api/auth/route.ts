import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: '請輸入密碼' },
        { status: 400 }
      )
    }

    const studentPwd = process.env.STUDENT_PASSWORD
    const taPwd = process.env.TA_PASSWORD
    const adminPwd = process.env.ADMIN_PASSWORD

    if (password === adminPwd) {
      const identity = { code: 'ADMIN', group: 'ADMIN', role: 'admin' }
      const cookieStore = await cookies()
      cookieStore.set('edu_identity', JSON.stringify(identity), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      })
      return NextResponse.json({ role: 'admin' })
    }

    if (password === taPwd) {
      const identity = { code: 'TA', group: 'TA', role: 'ta' }
      const cookieStore = await cookies()
      cookieStore.set('edu_identity', JSON.stringify(identity), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      return NextResponse.json({ role: 'ta' })
    }

    if (password === studentPwd) {
      // Student needs to select identity next
      const cookieStore = await cookies()
      cookieStore.set('edu_role', 'student', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      return NextResponse.json({ role: 'student' })
    }

    return NextResponse.json(
      { error: '密碼錯誤' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
