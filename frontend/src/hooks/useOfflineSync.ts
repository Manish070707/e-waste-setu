import { useCallback, useEffect, useRef, useState } from 'react'
import { pendingSyncCount, processSyncQueue, type SyncResult } from '../lib/syncQueue'
import { useApp } from '../lib/AppContext'

/** Mount once near app root to drive offline→online sync. */
export function SyncBootstrap() {
  const { online, setPendingSync, setSyncBanner } = useApp()
  const wasOffline = useRef(!online)
  const [syncing, setSyncing] = useState(false)

  const refreshPending = useCallback(async () => {
    const n = await pendingSyncCount()
    setPendingSync(n)
    return n
  }, [setPendingSync])

  const syncNow = useCallback(async (): Promise<SyncResult | null> => {
    if (!navigator.onLine) {
      await refreshPending()
      return null
    }
    setSyncing(true)
    try {
      const result = await processSyncQueue()
      setPendingSync(result.pending)
      if (result.synced > 0 && result.pending === 0) {
        setSyncBanner('complete')
      } else if (result.pending > 0) {
        setSyncBanner('pending')
      }
      return result
    } finally {
      setSyncing(false)
    }
  }, [refreshPending, setPendingSync, setSyncBanner])

  useEffect(() => {
    void refreshPending()
  }, [refreshPending])

  useEffect(() => {
    if (!online) {
      wasOffline.current = true
      setSyncBanner('offline')
      void refreshPending()
      return
    }
    if (wasOffline.current) {
      wasOffline.current = false
      setSyncBanner('restored')
      void syncNow().then(() => {
        window.setTimeout(() => setSyncBanner((b) => (b === 'restored' ? null : b)), 3500)
      })
    }
  }, [online, refreshPending, setSyncBanner, syncNow])

  // expose sync via custom event for OfflineIndicator button
  useEffect(() => {
    const handler = () => {
      void syncNow()
    }
    window.addEventListener('ews-sync-now', handler)
    return () => window.removeEventListener('ews-sync-now', handler)
  }, [syncNow])

  useEffect(() => {
    ;(window as unknown as { __ewsSyncing?: boolean }).__ewsSyncing = syncing
  }, [syncing])

  return null
}

export function requestSyncNow() {
  window.dispatchEvent(new Event('ews-sync-now'))
}
