import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Wallet from './pages/Wallet.jsx'
import KYC from './pages/KYC.jsx'
import Trading from './pages/Trading.jsx'
import Earn from './pages/Earn.jsx'
import Admin from './pages/Admin.jsx'
import Markets from './pages/Markets.jsx'
import History from './pages/History.jsx'
import Settings from './pages/Settings.jsx'
import Security from './pages/Security.jsx'

const placeholder = (name) => (
  <div style={{ color: 'var(--text1)' }}>{name} page</div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/forgot-password"
          element={
            <div style={{ color: 'var(--text1)', padding: '2rem', textAlign: 'center' }}>
              Forgot password — coming soon
            </div>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/kyc" element={<KYC />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/trade" element={<Trading />} />
        <Route path="/earn" element={<Earn />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/history" element={<History />} />
        <Route path="/security" element={<Security />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}
