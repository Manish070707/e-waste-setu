const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    let message = 'Request failed'
    try {
      const data = await res.json()
      message = data.detail || message
    } catch {
      /* ignore */
    }
    throw new Error(typeof message === 'string' ? message : 'Request failed')
  }
  return res.json() as Promise<T>
}

export type Lot = {
  lot_id: string
  collector_id: string
  material: string
  weight_kg: number
  condition: string
  photo_data_url?: string | null
  location: string
  latitude?: number | null
  longitude?: number | null
  est_low: number
  est_high: number
  ai_prediction?: string | null
  ai_confidence?: number | null
  status: string
  created_at: string
  is_demo: boolean
}

export type Recycler = {
  recycler_id: string
  facility_name: string
  location: string
  latitude?: number
  longitude?: number
  materials_accepted: string[]
  authorization_number: string
  authorization_status: string
  contact_masked: string
  offered_rate: number
  pickup_available: boolean
  service_area: string
  rating: number
  distance_km: number
  estimated_total?: number | null
  score?: number | null
  reasons: string[]
  is_demo: boolean
}

export type Transaction = {
  transaction_id: string
  lot_id: string
  collector_id: string
  recycler_id: string
  material: string
  weight_kg: number
  quoted_price_per_kg: number
  final_weight?: number | null
  final_price?: number | null
  collection_location: string
  handover_location?: string | null
  payment_status: string
  payment_method?: string | null
  transaction_status: string
  anomaly_flag: boolean
  anomaly_message?: string | null
  created_at: string
  updated_at: string
  recycler_name?: string | null
  collector_name?: string | null
  photo_data_url?: string | null
  is_demo: boolean
}

export type PriceToday = {
  material: string
  icon: string
  low: number
  high: number
  unit: string
  trend_pct: number
  location: string
  last_updated: string
  history: number[]
}

export type Handover = {
  transaction: Transaction
  timeline: {
    event_key: string
    label_en: string
    label_hi: string
    completed: boolean
    timestamp?: string | null
    sort_order: number
  }[]
  lot: Lot
  recycler: Recycler
}

export type Earnings = {
  total_earnings: number
  pending: number
  transactions_count: number
  material_sold_kg: number
  items: Transaction[]
}

export const api = {
  health: () => request<{ status: string }>('/health'),
  demoLogin: (role: string, user_id?: string) =>
    request<{ role: string; user_id: string; display_name: string; location?: string }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role, user_id }),
    }),
  createLot: (body: Record<string, unknown>) =>
    request<Lot>('/lots/', { method: 'POST', body: JSON.stringify(body) }),
  getLot: (id: string) => request<Lot>(`/lots/${id}`),
  collectorLots: (id: string) => request<Lot[]>(`/lots/collector/${id}`),
  todayPrices: (location = 'Gurugram', days = 30) =>
    request<PriceToday[]>(`/prices/today?location=${encodeURIComponent(location)}&days=${days}`),
  recommend: (lot_id: string) =>
    request<{ recyclers: Recycler[] }>('/recommendations/', {
      method: 'POST',
      body: JSON.stringify({ lot_id }),
    }),
  createTransaction: (lot_id: string, recycler_id: string, quoted_price_per_kg: number) =>
    request<Transaction>('/transactions/', {
      method: 'POST',
      body: JSON.stringify({ lot_id, recycler_id, quoted_price_per_kg }),
    }),
  getHandover: (trxId: string) => request<Handover>(`/handovers/${trxId}`),
  confirmHandover: (trxId: string, body: Record<string, unknown>) =>
    request<Handover>(`/handovers/${trxId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  earnings: (collectorId: string) => request<Earnings>(`/collectors/${collectorId}/earnings`),
  materials: () => request<{ material_id: string; category: string; icon: string; description: string }[]>('/materials/'),
  safety: () => request<{ cards: SafetyCard[] }>('/safety/'),
  classify: (hint: string) =>
    request<{ predicted_category: string; confidence: number; is_demo_mock: boolean }>(
      `/ai/classify?hint=${encodeURIComponent(hint)}`,
      { method: 'POST' },
    ),
  estimate: (material: string, weight_kg: number, condition: string, location: string) =>
    request<{
      low: number
      high: number
      rate_low: number
      rate_high: number
      disclaimer_hi: string
      disclaimer_en: string
      is_demo_mock: boolean
    }>(
      `/ai/estimate?material=${encodeURIComponent(material)}&weight_kg=${weight_kg}&condition=${encodeURIComponent(condition)}&location=${encodeURIComponent(location)}`,
      { method: 'POST' },
    ),
  recyclerIncoming: (recyclerId: string) =>
    request<Transaction[]>(`/transactions/?recycler_id=${encodeURIComponent(recyclerId)}`),
  listRecyclers: () => request<Recycler[]>('/recyclers/'),
  createPrice: (body: Record<string, unknown>) =>
    request<{ price_id: string }>('/prices/', { method: 'POST', body: JSON.stringify(body) }),
  adminMetrics: () =>
    request<{
      total_ewaste_kg: number
      formal_recycling_pct: number
      active_collectors: number
      authorized_recyclers: number
      total_collector_earnings: number
      avg_price_improvement_pct: number
      transactions: number
      pending_handovers: number
      hazardous_material_count: number
      is_demo: boolean
    }>('/admin/metrics'),
  runDemoScenario: () =>
    request<{ lot: Lot; transaction: Transaction; message: string }>('/demo/scenario', { method: 'POST' }),
}

export type SafetyCard = {
  id: string
  title_en: string
  title_hi: string
  icon: string
  dont: { en: string; hi: string }[]
  do: { en: string; hi: string }[]
  audio_en: string
  audio_hi: string
}

export { API_URL }
