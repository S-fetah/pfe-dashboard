import { useState, useEffect, useCallback } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { authApi } from './services/api'
import Login from './pages/Login'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Patients from './pages/Patients'
import Profile from './pages/Profile'
import Payments from './pages/Payments'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDoctors from './pages/admin/AdminDoctors'
import AdminPatients from './pages/admin/AdminPatients'
import AdminAppointments from './pages/admin/AdminAppointments'

const DOCTOR_PAGES = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'appointments', label: 'Appointments', icon: 'Calendar' },
  { key: 'patients', label: 'Patients', icon: 'Users' },
  { key: 'payments', label: 'Payments', icon: 'CreditCard' },
  { key: 'profile', label: 'Profile', icon: 'UserCircle' },
]

const ADMIN_PAGES = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'appointments', label: 'Appointments', icon: 'Calendar' },
  { key: 'doctors', label: 'Doctors', icon: 'Stethoscope' },
  { key: 'patients', label: 'Patients', icon: 'Users' },
  { key: 'profile', label: 'Profile', icon: 'UserCircle' },
]

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner" />
    <style>{`
      .loading-screen { display: flex; justify-content: center; align-items: center; height: 100vh; background: var(--bg); }
      .loading-spinner { width: 44px; height: 44px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: lspin 0.8s linear infinite; }
      @keyframes lspin { to { transform: rotate(360deg) } }
    `}</style>
  </div>
)

function App() {
  const [user, setUser] = useState(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  const fetchUserByToken = async () => {
    const res = await authApi.getProtected()
    const userData = res.data?.user
    if (!userData) throw new Error('No user data')
    if (userData.userType !== 'doctor' && userData.userType !== 'admin') throw new Error('Unauthorized role')
    return userData
  }

  const fetchUserFallback = async () => {
    const res = await authApi.getProfile()
    const userData = res.data?.data
    if (!userData) throw new Error('No user data')
    if (userData.userType !== 'doctor' && userData.userType !== 'admin') throw new Error('Unauthorized role')
    return userData
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const saved = localStorage.getItem('doctorUser')
    if (!token) { setLoading(false); return }

    fetchUserByToken()
      .catch(() => fetchUserFallback())
      .then((userData) => {
        localStorage.setItem('doctorUser', JSON.stringify(userData))
        setUser(userData)
      })
      .catch(() => {
        if (saved) {
          setUser(JSON.parse(saved))
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('doctorUser')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogin = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    const { accessToken, userId } = res.data
    if (!accessToken) throw new Error('No access token received')
    localStorage.setItem('accessToken', accessToken)

    let userData
    try {
      userData = await fetchUserByToken()
    } catch {
      try {
        userData = await fetchUserFallback()
      } catch {
        userData = {
          uid: userId,
          email,
          fullName: email.split('@')[0].replace(/[.-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          userType: 'admin',
        }
      }
    }

    localStorage.setItem('doctorUser', JSON.stringify(userData))
    setUser(userData)
    toast.success(`Welcome, ${userData.fullName || 'User'}!`)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('doctorUser')
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  if (loading) return <LoadingScreen />
  if (!user) return <Login onLogin={handleLogin} />

  const isAdmin = user.userType === 'admin'
  const pages = isAdmin ? ADMIN_PAGES : DOCTOR_PAGES
  const roleLabel = isAdmin ? 'Administrator' : 'Medical Professional'

  const renderPage = () => {
    if (isAdmin) {
      switch (activePage) {
        case 'dashboard': return <AdminDashboard />
        case 'appointments': return <AdminAppointments />
        case 'doctors': return <AdminDoctors />
        case 'patients': return <AdminPatients />
        case 'profile': return <Profile />
        default: return <AdminDashboard />
      }
    }
    switch (activePage) {
      case 'dashboard': return <Dashboard />
      case 'appointments': return <Appointments />
      case 'patients': return <Patients />
      case 'payments': return <Payments />
      case 'profile': return <Profile />
      default: return <Dashboard />
    }
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { borderRadius: '14px', background: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' },
      }} />
      <Layout user={user} pages={pages} activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} roleLabel={roleLabel}>
        {renderPage()}
      </Layout>
    </>
  )
}

export default App
