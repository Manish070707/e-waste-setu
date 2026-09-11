import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export type DraftLot = {
  id: string
  collector_id: string
  material: string
  weight_kg: number
  condition: string
  photo_data_url?: string | null
  location: string
  latitude?: number | null
  longitude?: number | null
  ai_prediction?: string | null
  ai_confidence?: number | null
  updated_at: string
}

export type SyncQueueItem = {
  id: string
  type: 'create_lot' | 'create_transaction' | 'confirm_handover'
  payload: Record<string, unknown>
  created_at: string
  attempts: number
  last_error?: string
}

export type CachedPrices = {
  key: string
  location: string
  days: number
  data: unknown
  updated_at: string
}

interface EwasteDB extends DBSchema {
  drafts: {
    key: string
    value: DraftLot
  }
  syncQueue: {
    key: string
    value: SyncQueueItem
  }
  priceCache: {
    key: string
    value: CachedPrices
  }
  meta: {
    key: string
    value: { key: string; value: string }
  }
}

let dbPromise: Promise<IDBPDatabase<EwasteDB>> | null = null

export function getOfflineDb() {
  if (!dbPromise) {
    dbPromise = openDB<EwasteDB>('ewaste-setu', 1, {
      upgrade(db) {
        db.createObjectStore('drafts', { keyPath: 'id' })
        db.createObjectStore('syncQueue', { keyPath: 'id' })
        db.createObjectStore('priceCache', { keyPath: 'key' })
        db.createObjectStore('meta', { keyPath: 'key' })
      },
    })
  }
  return dbPromise
}

export async function saveDraft(draft: DraftLot) {
  const db = await getOfflineDb()
  await db.put('drafts', draft)
}

export async function getDraft(id: string) {
  const db = await getOfflineDb()
  return db.get('drafts', id)
}

export async function listDrafts() {
  const db = await getOfflineDb()
  return db.getAll('drafts')
}

export async function deleteDraft(id: string) {
  const db = await getOfflineDb()
  await db.delete('drafts', id)
}

export async function enqueueSync(item: Omit<SyncQueueItem, 'attempts'> & { attempts?: number }) {
  const db = await getOfflineDb()
  const full: SyncQueueItem = { attempts: 0, ...item }
  await db.put('syncQueue', full)
  return full
}

export async function listSyncQueue() {
  const db = await getOfflineDb()
  return db.getAll('syncQueue')
}

export async function removeSyncItem(id: string) {
  const db = await getOfflineDb()
  await db.delete('syncQueue', id)
}

export async function updateSyncItem(item: SyncQueueItem) {
  const db = await getOfflineDb()
  await db.put('syncQueue', item)
}

export async function cachePrices(location: string, days: number, data: unknown) {
  const db = await getOfflineDb()
  const key = `${location}:${days}`
  await db.put('priceCache', { key, location, days, data, updated_at: new Date().toISOString() })
}

export async function getCachedPrices(location: string, days: number) {
  const db = await getOfflineDb()
  return db.get('priceCache', `${location}:${days}`)
}

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export async function setMetaValue(key: string, value: string) {
  const db = await getOfflineDb()
  await db.put('meta', { key, value })
}

export async function getMetaValue(key: string): Promise<string | undefined> {
  const db = await getOfflineDb()
  const entry = await db.get('meta', key)
  return entry?.value
}
