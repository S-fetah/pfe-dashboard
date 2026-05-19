import { useState, useEffect } from 'react'
import { UserCheck, UserX, Clock, Loader2, Stethoscope } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { adminApi } from '../../services/api'

const DEMO_PENDING = [
  { id: 'd1', uid: 'd1', fullName: 'Dr. Sarah Johnson', email: 'sarah.j@example.com', speciality: 'Cardiology', certificateUrl: '#' },
  { id: 'd2', uid: 'd2', fullName: 'Dr. Michael Chen', email: 'm.chen@example.com', speciality: 'Neurology', certificateUrl: '#' },
  { id: 'd3', uid: 'd3', fullName: 'Dr. Fatima Al-Rashid', email: 'f.alrashid@example.com', speciality: 'Pediatrics', certificateUrl: '#' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 12, pending: 3, active: 8, refused: 1 })
  const [pending, setPending] = useState(DEMO_PENDING)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  const fetchData = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([
        adminApi.getPendingDoctors(),
        adminApi.getAllDoctors().catch(() => ({ data: { data: { FileterdDoctors: [] } } })),
      ])
      const pendingDocs = pendingRes.data?.data || []
      const allDocs = allRes.data?.data?.FileterdDoctors || []
      if (pendingDocs.length > 0 || allDocs.length > 0) {
        setPending(pendingDocs)
        setStats({
          total: allDocs.length,
          pending: pendingDocs.length,
          active: allDocs.filter((d) => d.status === 'active').length,
          refused: allDocs.filter((d) => d.status === 'refused').length,
        })
        setIsLive(true)
      }
    } catch {
      // Backend unavailable — using demo data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleStatus = async (doctorId, status) => {
    try {
      await adminApi.updateDoctorStatus(doctorId, status)
      toast.success(`Doctor ${status === 'active' ? 'approved' : 'refused'}`)
      setPending((prev) => prev.filter((d) => (d.id || d.uid) !== doctorId))
      setStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        [status === 'active' ? 'active' : 'refused']: prev[status === 'active' ? 'active' : 'refused'] + 1,
      }))
    } catch {
      // Demo mode — update locally
      toast.success(`Doctor ${status === 'active' ? 'approved' : 'refused'} (demo)`)
      setPending((prev) => prev.filter((d) => (d.id || d.uid) !== doctorId))
      setStats((prev) => ({
        ...prev,
        pending: prev.pending - 1,
        [status === 'active' ? 'active' : 'refused']: prev[status === 'active' ? 'active' : 'refused'] + 1,
      }))
    }
  }

  const cards = [
    { label: 'Total Doctors', value: stats.total, icon: Stethoscope, color: '#1552C1' },
    { label: 'Active', value: stats.active, icon: UserCheck, color: '#059669' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: '#F59E0B' },
    { label: 'Refused', value: stats.refused, icon: UserX, color: '#EF4444' },
  ]

  if (loading) return <div className="pg-load"><Loader2 size={36} className="spnr" /></div>

  return (
    <div className="admin-dash">
      <div className="dash-top">
        <div>
          <h1 className="pg-title">Admin Dashboard</h1>
          <p className="pg-sub">Manage doctors and platform overview</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isLive && <span className="demo-badge">DEMO DATA</span>}
          <div className="dash-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <div className="d-stats">
        {cards.map((c) => (
          <div key={c.label} className="d-stat" style={{ '--clr': c.color }}>
            <div className="d-stat-top">
              <div className="d-stat-icon" style={{ background: `${c.color}15`, color: c.color }}><c.icon size={22} /></div>
            </div>
            <div className="d-stat-val">{c.value}</div>
            <div className="d-stat-lbl">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="d-card" style={{ marginTop: 24 }}>
        <div className="d-card-hdr">
          <h3>Pending Approvals</h3>
          <span className="pending-count">{pending.length}</span>
        </div>
        {pending.length === 0 ? (
          <p className="d-empty">No pending doctor approvals</p>
        ) : (
          <div className="admin-pending-list">
            {pending.map((doc) => (
              <div key={doc.id || doc.uid} className="admin-pending-card">
                <div className="admin-pending-info">
                  <div className="admin-pending-av">{doc.fullName?.charAt(0)?.toUpperCase() || '?'}</div>
                  <div>
                    <strong>{doc.fullName}</strong>
                    <span>{doc.email} — {doc.speciality || 'No specialty'}</span>
                  </div>
                </div>
                {doc.certificateUrl && (
                  <a href={doc.certificateUrl} target="_blank" rel="noreferrer" className="admin-cert-link">
                    View Certificate
                  </a>
                )}
                <div className="admin-pending-acts">
                  <button className="act-btn act-grn" onClick={() => handleStatus(doc.id || doc.uid, 'active')}>Approve</button>
                  <button className="act-btn act-red" onClick={() => handleStatus(doc.id || doc.uid, 'refused')}>Refuse</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .pg-load { display: flex; justify-content: center; padding: 100px 0; }
        .spnr { animation: spnr 0.8s linear infinite; color: var(--primary); }
        @keyframes spnr { to { transform: rotate(360deg) } }
        .admin-dash { animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .dash-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 12px; }
        .pg-title { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; }
        .pg-sub { color: var(--text-muted); margin-top: 4px; font-size: 14px; }
        .demo-badge { padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
        .dash-date { padding: 8px 16px; background: var(--primary-light); color: var(--primary); border-radius: var(--radius-full); font-size: 13px; font-weight: 600; }
        .d-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 28px; }
        .d-stat { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; position: relative; overflow: hidden; }
        .d-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--clr); }
        .d-stat-top { margin-bottom: 14px; }
        .d-stat-icon { width: 48px; height: 48px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; }
        .d-stat-val { font-size: 30px; font-weight: 800; margin-bottom: 4px; }
        .d-stat-lbl { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .d-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
        .d-card-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
        .d-card-hdr h3 { font-size: 18px; font-weight: 700; }
        .pending-count { background: var(--error); color: white; padding: 2px 10px; border-radius: var(--radius-full); font-size: 12px; font-weight: 700; }
        .d-empty { color: var(--text-muted); text-align: center; padding: 40px; }
        .admin-pending-list { display: flex; flex-direction: column; gap: 12px; }
        .admin-pending-card {
          display: flex; align-items: center; gap: 16px; padding: 18px;
          background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius);
          flex-wrap: wrap;
        }
        .admin-pending-info { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 200px; }
        .admin-pending-av { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), #6366f1); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
        .admin-pending-info strong { display: block; font-size: 14px; }
        .admin-pending-info span { font-size: 12px; color: var(--text-muted); }
        .admin-cert-link { font-size: 12px; color: var(--primary); font-weight: 600; padding: 6px 12px; border-radius: var(--radius-sm); background: var(--primary-light); text-decoration: none; }
        .admin-cert-link:hover { background: #dbeafe; }
        .admin-pending-acts { display: flex; gap: 8px; }
        .act-btn { padding: 8px 16px; border: none; border-radius: var(--radius-sm); font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
        .act-btn:hover { transform: translateY(-1px); }
        .act-grn { background: #d1fae5; color: #065f46; }
        .act-red { background: #fee2e2; color: #991b1b; }
      `}</style>
    </div>
  )
}
