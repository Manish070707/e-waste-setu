import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SyncBootstrap } from './hooks/useOfflineSync'
import { InstallBanner } from './components/InstallBanner'
import { AppProvider } from './lib/AppContext'
import { AdminDashboard } from './pages/AdminDashboard'
import { CollectorDashboard } from './pages/CollectorDashboard'
import { CreateLot } from './pages/CreateLot'
import { DemoPage } from './pages/DemoPage'
import { EarningsPage } from './pages/EarningsPage'
import { HandoverPage } from './pages/HandoverPage'
import { Landing } from './pages/Landing'
import { MapDiscoverPage } from './pages/MapDiscoverPage'
import { MyLotsPage } from './pages/MyLotsPage'
import { PriceBoard } from './pages/PriceBoard'
import { RecyclerDashboard } from './pages/RecyclerDashboard'
import { RecyclerMatching } from './pages/RecyclerMatching'
import { SafetyPage } from './pages/SafetyPage'

export default function App() {
  return (
    <AppProvider>
      <SyncBootstrap />
      <InstallBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/collector" element={<CollectorDashboard />} />
          <Route path="/collector/lot/new" element={<CreateLot />} />
          <Route path="/collector/rates" element={<PriceBoard />} />
          <Route path="/collector/match" element={<RecyclerMatching />} />
          <Route path="/collector/match/:lotId" element={<RecyclerMatching />} />
          <Route path="/collector/map" element={<MapDiscoverPage />} />
          <Route path="/collector/handover/:trxId" element={<HandoverPage />} />
          <Route path="/collector/earnings" element={<EarningsPage />} />
          <Route path="/collector/safety" element={<SafetyPage />} />
          <Route path="/collector/lots" element={<MyLotsPage />} />
          <Route path="/recycler/*" element={<RecyclerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
