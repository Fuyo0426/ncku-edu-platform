import { put, list, get } from '@vercel/blob'

// ============================================================
// Types
// ============================================================

export interface ResponseData {
  studentId: string
  moduleId: string
  answers: Record<string, unknown>
  submittedAt: string
  timeTaken?: number // seconds
}

export interface RubricScore {
  studentId: string
  lab: string
  taId: string
  scores: Record<string, number> // dimension -> score (1-4)
  total: number
  notes: string
  scoredAt: string
}

export interface ModuleStatusMap {
  [moduleId: string]: {
    isOpen: boolean
    openAt?: string
    closeAt?: string
  }
}

// ============================================================
// Helpers
// ============================================================

async function readBlobJson<T>(pathname: string): Promise<T | null> {
  try {
    const result = await get(pathname, { access: 'public' })
    if (!result || result.statusCode === 304) return null
    const text = await new Response(result.stream).text()
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

async function writeBlobJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  })
}

async function listAllBlobs(prefix: string) {
  const allBlobs: { pathname: string; url: string }[] = []
  let cursor: string | undefined
  let hasMore = true

  while (hasMore) {
    const result = await list({ prefix, cursor, limit: 1000 })
    allBlobs.push(...result.blobs.map((b) => ({ pathname: b.pathname, url: b.url })))
    cursor = result.cursor
    hasMore = result.hasMore
  }

  return allBlobs
}

// ============================================================
// Responses
// ============================================================

export async function saveResponse(data: ResponseData): Promise<void> {
  const pathname = `responses/${data.studentId}/${data.moduleId}/${Date.now()}.json`
  await writeBlobJson(pathname, data)
}

export async function getAllResponses(): Promise<ResponseData[]> {
  const blobs = await listAllBlobs('responses/')
  const results: ResponseData[] = []

  for (const blob of blobs) {
    const data = await readBlobJson<ResponseData>(blob.pathname)
    if (data) results.push(data)
  }

  return results
}

export async function getStudentResponses(studentId: string): Promise<ResponseData[]> {
  const blobs = await listAllBlobs(`responses/${studentId}/`)
  const results: ResponseData[] = []

  for (const blob of blobs) {
    const data = await readBlobJson<ResponseData>(blob.pathname)
    if (data) results.push(data)
  }

  return results
}

export async function hasSubmitted(studentId: string, moduleId: string): Promise<boolean> {
  const blobs = await listAllBlobs(`responses/${studentId}/${moduleId}/`)
  return blobs.length > 0
}

export async function getStudentCompletedModules(studentId: string): Promise<string[]> {
  const blobs = await listAllBlobs(`responses/${studentId}/`)
  const moduleIds = new Set<string>()

  for (const blob of blobs) {
    // pathname format: responses/{studentId}/{moduleId}/{timestamp}.json
    const parts = blob.pathname.split('/')
    if (parts.length >= 3) {
      moduleIds.add(parts[2])
    }
  }

  return Array.from(moduleIds)
}

// ============================================================
// Rubrics
// ============================================================

export async function saveRubric(data: RubricScore): Promise<void> {
  const pathname = `rubrics/${data.lab}/${data.taId}/${data.studentId}.json`
  await writeBlobJson(pathname, data)
}

export async function getAllRubrics(): Promise<RubricScore[]> {
  const blobs = await listAllBlobs('rubrics/')
  const results: RubricScore[] = []

  for (const blob of blobs) {
    const data = await readBlobJson<RubricScore>(blob.pathname)
    if (data) results.push(data)
  }

  return results
}

export async function getRubricsByLab(lab: string): Promise<RubricScore[]> {
  const blobs = await listAllBlobs(`rubrics/${lab}/`)
  const results: RubricScore[] = []

  for (const blob of blobs) {
    const data = await readBlobJson<RubricScore>(blob.pathname)
    if (data) results.push(data)
  }

  return results
}

// ============================================================
// Module Status Config
// ============================================================

const MODULE_STATUS_PATH = 'config/module-status.json'

export async function getModuleStatus(): Promise<ModuleStatusMap> {
  const data = await readBlobJson<ModuleStatusMap>(MODULE_STATUS_PATH)
  return data ?? {}
}

export async function saveModuleStatus(status: ModuleStatusMap): Promise<void> {
  await writeBlobJson(MODULE_STATUS_PATH, status)
}

// ============================================================
// Observations
// ============================================================

export async function saveObservation(
  lab: string,
  taId: string,
  data: Record<string, unknown>
): Promise<void> {
  const pathname = `observations/${lab}/${Date.now()}.json`
  await writeBlobJson(pathname, { ...data, lab, taId, createdAt: new Date().toISOString() })
}

export async function getAllObservations(): Promise<unknown[]> {
  const blobs = await listAllBlobs('observations/')
  const results: unknown[] = []

  for (const blob of blobs) {
    const data = await readBlobJson<unknown>(blob.pathname)
    if (data) results.push(data)
  }

  return results
}
