import { api } from './api'
import {
  listSyncQueue,
  removeSyncItem,
  updateSyncItem,
  type SyncQueueItem,
} from './offlineDb'

export type SyncResult = {
  pending: number
  synced: number
  failed: number
  errors: string[]
}

export async function processSyncQueue(): Promise<SyncResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const q = await listSyncQueue()
    return { pending: q.length, synced: 0, failed: 0, errors: ['offline'] }
  }

  const queue = await listSyncQueue()
  let synced = 0
  let failed = 0
  const errors: string[] = []

  for (const item of queue) {
    try {
      await runItem(item)
      await removeSyncItem(item.id)
      synced += 1
    } catch (e) {
      failed += 1
      const message = e instanceof Error ? e.message : 'sync failed'
      errors.push(message)
      await updateSyncItem({
        ...item,
        attempts: item.attempts + 1,
        last_error: message,
      })
    }
  }

  const remaining = await listSyncQueue()
  return { pending: remaining.length, synced, failed, errors }
}

async function runItem(item: SyncQueueItem) {
  if (item.type === 'create_lot') {
    await api.createLot(item.payload)
    return
  }
  if (item.type === 'create_transaction') {
    const { lot_id, recycler_id, quoted_price_per_kg } = item.payload as {
      lot_id: string
      recycler_id: string
      quoted_price_per_kg: number
    }
    await api.createTransaction(lot_id, recycler_id, quoted_price_per_kg)
    return
  }
  if (item.type === 'confirm_handover') {
    const { trx_id, ...body } = item.payload as { trx_id: string } & Record<string, unknown>
    await api.confirmHandover(trx_id, body)
  }
}

export async function pendingSyncCount() {
  const q = await listSyncQueue()
  return q.length
}
