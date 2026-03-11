import Cookies from 'js-cookie'

export type Identity = {
  code: string       // 'A01'~'C05' | 'TA' | 'ADMIN'
  group: 'A' | 'B' | 'C' | 'TA' | 'ADMIN'
  role: 'student' | 'ta' | 'admin'
}

const COOKIE_KEY = 'edu_identity'

export function setIdentity(identity: Identity): void {
  Cookies.set(COOKIE_KEY, JSON.stringify(identity), {
    expires: 1, // 1 day
    sameSite: 'lax',
  })
}

export function getIdentity(): Identity | null {
  const raw = Cookies.get(COOKIE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Identity
  } catch {
    return null
  }
}

export function clearIdentity(): void {
  Cookies.remove(COOKIE_KEY)
}

export function getGroupFromCode(code: string): 'A' | 'B' | 'C' {
  const prefix = code.charAt(0).toUpperCase()
  if (prefix === 'A') return 'A'
  if (prefix === 'B') return 'B'
  return 'C'
}

/** All valid student codes */
export const STUDENT_CODES = [
  'A01', 'A02', 'A03', 'A04', 'A05',
  'B01', 'B02', 'B03', 'B04', 'B05',
  'C01', 'C02', 'C03', 'C04', 'C05',
] as const

export type StudentCode = typeof STUDENT_CODES[number]

export const GROUP_LABELS: Record<string, string> = {
  A: '實踐組',
  B: '高階組',
  C: '傳統組',
}
