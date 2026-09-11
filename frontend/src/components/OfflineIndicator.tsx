import { useEffect } from 'react'
import { requestSyncNow } from '../hooks/useOfflineSync'
import { useApp } from '../lib/AppContext'
import { Button } from './Button'

export function OfflineIndicator() {
  const { online, t, pendingSync, syncBanner, setSyncBanner } = useApp()

  // Auto-dismiss complete banner after 3.5s
  useEffect(() => {
    if (syncBanner === 'complete') {
      const id = window.setTimeout(() => setSyncBanner(null), 3500)
      return () => window.clearTimeout(id)
    }
  }, [syncBanner, setSyncBanner])

  // Sync on page focus after being offline
  useEffect(() => {
    function onFocus() {
      if (navigator.onLine) requestSyncNow()
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') onFocus()
    })
    return () => {
      document.removeEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') onFocus()
      })
    }
  }, [])

  if (!online) {
    return (
      <div className="bg-amber-400 text-amber-950 text-center text-sm font-semibold px-3 py-2 space-y-1" role="status" aria-live="polite">
        <div>🟡 {t.offline.offline}</div>
        {pendingSync > 0 && (
          <div className="text-xs font-bold">
            {pendingSync} {t.offline.pendingSync}
          </div>
        )}
      </div>
    )
  }

  if (syncBanner === 'restored') {
    return (
      <div className="bg-eco-600 text-white text-center text-sm font-semibold px-3 py-2" role="status" aria-live="polite">
        ✓ {t.offline.online}
      </div>
    )
  }

  if (syncBanner === 'complete') {
    return (
      <div className="bg-eco-700 text-white text-center text-sm font-semibold px-3 py-2" role="status" aria-live="polite">
        ✓ {t.offline.syncComplete}
      </div>
    )
  }

  if (pendingSync > 0 || syncBanner === 'pending') {
    return (
      <div
        className="bg-sky-600 text-white text-center text-sm font-semibold px-3 py-2 flex items-center justify-center gap-3"
        role="status"
        aria-live="polite"
      >
        <span>
          {pendingSync} {t.offline.pendingSync}
        </span>
        <Button
          size="md"
          variant="secondary"
          className="!py-1 !px-3 !text-xs !min-h-0"
          onClick={() => requestSyncNow()}
        >
          {t.offline.sync}
        </Button>
      </div>
    )
  }

  return null
}
