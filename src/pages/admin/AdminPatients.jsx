import { useState, useEffect } from 'react'
import { Search, Loader2, Mail, Calendar } from 'lucide-react'

const DEMO_PATIENTS = [
  { uid: 'p1', fullName: 'John Doe', email: 'john.doe@example.com', bookings: 3, lastVisit: '2026-05-15', status: 'active' },
  { uid: 'p2', fullName: 'Jane Smith', email: 'jane.smith@example.com', bookings: 1, lastVisit: '2026-05-10', status: 'active' },
  { uid: 'p3', fullName: 'Ahmed Ali', email: 'ahmed.ali@example.com', bookings: 2, lastVisit: '2026-05-08', status: 'active' },
  { uid: 'p4', fullName: 'Maria Gonzales', email: 'maria.g@example.com', bookings: 5, lastVisit: '2026-05-01', status: 'active' },
  { uid: 'p5', fullName: 'David Kim', email: 'david.kim@example.com', bookings: 0, lastVisit: '--', status: 'inactive' },
]

export default function AdminPatients() {
  const [patients, setPatients] = useState(DEMO_PATIENTS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [])

  const filtered = patients.filter((p) =>
    (p.fullName || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="pg-load"><Loader2 size={36} className="spnr" /></div>

  return (
    <div className="admin-docs">
      <div className="pts-top">
        <div>
          <h1 className="pg-title">All Patients</h1>
          <p className="pg-sub">{patients.length} registered patients</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isLive && <span className="demo-badge">DEMO DATA</span>}
          <div className="pts-search">
            <Search size={17} />
            <input type="text" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="d-card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>Patient</th><th>Email</th><th>Bookings</th><th>Last Visit</th><th>Status</th>
            </tr></thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.uid || i}>
                  <td>
                    <div className="tbl-patient">
                      <div className="tbl-av">{p.fullName?.charAt(0)?.toUpperCase() || '?'}</div>
                      <span>{p.fullName}</span>
                    </div>
                  </td>
                  <td className="tbl-cell-muted"><Mail size={13} style={{ marginRight: 4, display: 'inline' }} />{p.email}</td>
                  <td><span className="booking-count">{p.bookings}</span></td>
                  <td className="tbl-cell-muted"><Calendar size={13} style={{ marginRight: 4, display: 'inline' }} />{p.lastVisit}</td>
                  <td>
                    <span className="tbl-badge" style={{
                      background: p.status === 'active' ? '#d1fae5' : '#fef3c7',
                      color: p.status === 'active' ? '#065f46' : '#92400e',
                    }}>{p.status}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="tbl-empty">No patients found</td></tr>}
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
        .tbl-cell-muted { color: var(--text-muted); font-size: 13px; }
        .booking-count { font-weight: 700; padding: 2px 10px; background: var(--primary-light); color: var(--primary); border-radius: var(--radius-full); font-size: 13px; }
        .tbl-badge { display: inline-block; padding: 4px 14px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; text-transform: capitalize; }
        .tbl-empty { text-align: center; padding: 40px !important; color: var(--text-muted); }
      `}</style>
    </div>
  )
}
