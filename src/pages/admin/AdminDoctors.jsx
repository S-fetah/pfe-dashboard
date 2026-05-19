import { useState, useEffect } from 'react'
import { Search, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { adminApi } from '../../services/api'

const DEMO_DOCTORS = [
  { uid: 'd1', fullName: 'Dr. Sarah Johnson', email: 'sarah.j@example.com', speciality: 'Cardiology', status: 'active', certificateUrl: '#' },
  { uid: 'd2', fullName: 'Dr. Michael Chen', email: 'm.chen@example.com', speciality: 'Neurology', status: 'active', certificateUrl: '#' },
  { uid: 'd3', fullName: 'Dr. Fatima Al-Rashid', email: 'f.alrashid@example.com', speciality: 'Pediatrics', status: 'pending', certificateUrl: '#' },
  { uid: 'd4', fullName: 'Dr. James Wilson', email: 'j.wilson@example.com', speciality: 'Cardiology', status: 'active', certificateUrl: '#' },
  { uid: 'd5', fullName: 'Dr. Priya Sharma', email: 'p.sharma@example.com', speciality: 'Dermatology', status: 'pending', certificateUrl: '#' },
  { uid: 'd6', fullName: 'Dr. Robert Kim', email: 'r.kim@example.com', speciality: 'Orthopedics', status: 'refused', certificateUrl: '#' },
]

const STATUS_COLORS = {
  active: { bg: '#d1fae5', color: '#065f46' },
  pending: { bg: '#fef3c7', color: '#92400e' },
  refused: { bg: '#fee2e2', color: '#991b1b' },
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState(DEMO_DOCTORS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    adminApi.getAllDoctors()
      .then((res) => {
        const data = res.data?.data?.FileterdDoctors
        if (data && data.length > 0) {
          setDoctors(data)
          setIsLive(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleStatus = async (doctorId, newStatus) => {
    try {
      await adminApi.updateDoctorStatus(doctorId, newStatus)
      toast.success(`Doctor ${newStatus === 'active' ? 'approved' : 'refused'}`)
      setDoctors((prev) => prev.map((d) => (d.id || d.uid) === doctorId ? { ...d, status: newStatus } : d))
    } catch {
      toast.success(`Doctor ${newStatus === 'active' ? 'approved' : 'refused'} (demo)`)
      setDoctors((prev) => prev.map((d) => (d.id || d.uid) === doctorId ? { ...d, status: newStatus } : d))
    }
  }

  const filtered = doctors.filter((d) =>
    (d.fullName || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="pg-load"><Loader2 size={36} className="spnr" /></div>

  return (
    <div className="admin-docs">
      <div className="pts-top">
        <div>
          <h1 className="pg-title">All Doctors</h1>
          <p className="pg-sub">{doctors.length} registered doctors</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isLive && <span className="demo-badge">DEMO DATA</span>}
          <div className="pts-search">
            <Search size={17} />
            <input type="text" placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="d-card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>Doctor</th><th>Email</th><th>Specialty</th><th>Status</th><th>Certificate</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map((doc, i) => {
                const sc = STATUS_COLORS[doc.status] || STATUS_COLORS.pending
                return (
                  <tr key={doc.uid || i}>
                    <td>
                      <div className="tbl-patient">
                        <div className="tbl-av">{doc.fullName?.charAt(0)?.toUpperCase() || '?'}</div>
                        <span>{doc.fullName}</span>
                      </div>
                    </td>
                    <td className="tbl-cell-muted">{doc.email}</td>
                    <td>{doc.speciality || '--'}</td>
                    <td><span className="tbl-badge" style={{ background: sc.bg, color: sc.color }}>{doc.status}</span></td>
                    <td>
                      {doc.certificateUrl && doc.certificateUrl !== '#' ? (
                        <a href={doc.certificateUrl} target="_blank" rel="noreferrer" className="cert-link">View</a>
                      ) : (
                        <span className="tbl-cell-muted">--</span>
                      )}
                    </td>
                    <td>
                      <div className="tbl-acts">
                        {doc.status !== 'active' && (
                          <button className="act-btn act-grn" onClick={() => handleStatus(doc.id || doc.uid, 'active')}>
                            <CheckCircle size={14} /> Approve
                          </button>
                        )}
                        {doc.status !== 'refused' && (
                          <button className="act-btn act-red" onClick={() => handleStatus(doc.id || doc.uid, 'refused')}>
                            <XCircle size={14} /> Refuse
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="tbl-empty">No doctors found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .pg-load { display: flex; justify-content: center; padding: 100px 0; }
        .spnr { animation: spnr 0.8s linear infinite; color: var(--primary); }
        @keyframes spnr { to { transform: rotate(360deg) } }
        .admin-docs { animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .pts-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .pg-title { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; }
        .pg-sub { color: var(--text-muted); margin-top: 4px; font-size: 14px; }
        .demo-badge { padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; }
        .pts-search { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: var(--card-bg); border: 1px solid var(--input-border); border-radius: var(--radius); color: var(--text-muted); min-width: 260px; }
        .pts-search input { border: none; background: none; outline: none; flex: 1; color: var(--text-main); font-size: 14px; }
        .d-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
        .tbl-wrap { overflow-x: auto; }
        .tbl { width: 100%; border-collapse: separate; border-spacing: 0; }
        .tbl th { text-align: left; padding: 12px 16px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; border-bottom: 2px solid var(--border); }
        .tbl td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--border); }
        .tbl tbody tr:hover td { background: var(--primary-light); }
        .tbl-patient { display: flex; align-items: center; gap: 12px; }
        .tbl-av { width: 36px; height: 36px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
        .tbl-cell-muted { color: var(--text-muted); }
        .tbl-badge { display: inline-block; padding: 4px 14px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; text-transform: capitalize; }
        .cert-link { font-size: 12px; color: var(--primary); font-weight: 600; padding: 4px 10px; border-radius: var(--radius-sm); background: var(--primary-light); text-decoration: none; }
        .cert-link:hover { background: #dbeafe; }
        .tbl-acts { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
        .act-btn { display: inline-flex; align-items: center; gap: 4px; padding: 8px 14px; border: none; border-radius: var(--radius-sm); font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s ease; white-space: nowrap; }
        .act-btn:hover { transform: translateY(-1px); }
        .act-grn { background: #d1fae5; color: #065f46; }
        .act-red { background: #fee2e2; color: #991b1b; }
        .tbl-empty { text-align: center; padding: 40px !important; color: var(--text-muted); }
      `}</style>
    </div>
  )
}
