import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const VALID_CODES = [
  'A01', 'A02', 'A03', 'A04', 'A05',
  'B01', 'B02', 'B03', 'B04', 'B05',
  'C01', 'C02', 'C03', 'C04', 'C05',
]

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || !VALID_CODES.includes(code)) {
      return NextResponse.json(
        { error: '無效的學生代碼' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const role = cookieStore.get('edu_role')?.value
    if (role !== 'student') {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      )
    }

    const group = code.charAt(0) as 'A' | 'B' | 'C'
    const identity = { code, group, role: 'student' }

    cookieStore.set('edu_identity', JSON.stringify(identity), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    cookieStore.delete('edu_role')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
