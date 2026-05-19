import { useState, useEffect } from 'react'
import { Search, Loader2, Clock, CalendarDays, DollarSign } from 'lucide-react'

const DEMO_APPOINTMENTS = [
  { id: 'a1', doctor: 'Dr. Sarah Johnson', patient: 'John Doe', date: '2026-05-20', time: '10:00 AM', fee: 150, status: 'booked' },
  { id: 'a2', doctor: 'Dr. Michael Chen', patient: 'Jane Smith', date: '2026-05-20', time: '11:30 AM', fee: 200, status: 'completed' },
  { id: 'a3', doctor: 'Dr. Sarah Johnson', patient: 'Ahmed Ali', date: '2026-05-21', time: '09:00 AM', fee: 150, status: 'available' },
  { id: 'a4', doctor: 'Dr. Fatima Al-Rashid', patient: 'Maria Gonzales', date: '2026-05-21', time: '02:00 PM', fee: 120, status: 'booked' },
  { id: 'a5', doctor: 'Dr. Robert Kim', patient: 'David Kim', date: '2026-05-22', time: '10:30 AM', fee: 180, status: 'cancelled' },
  { id: 'a6', doctor: 'Dr. Priya Sharma', patient: 'Emily Chen', date: '2026-05-22', time: '03:00 PM', fee: 160, status: 'completed' },
]

const STATUS = {
  available: { bg: '#dbeafe', color: '#1e40af' },
  booked: { bg: '#fef3c7', color: '#92400e' },
  completed: { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
}

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState(DEMO_APPOINTMENTS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = appointments.filter((a) =>
    (a.doctor || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.patient || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="pg-load"><Loader2 size={36} className="spnr" /></div>

  return (
    <div className="admin-docs">
      <div className="pts-top">
        <div>
          <h1 className="pg-title">All Appointments</h1>
          <p className="pg-sub">{appointments.length} total appointments</p>
        </div>
        <div className="pts-search">
          <Search size={17} />
          <input type="text" placeholder="Search by doctor or patient..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="d-card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>Doctor</th><th>Patient</th><th>Date</th><th>Time</th><th>Fee</th><th>Status</th>
            </tr></thead>
            <tbody>
              {filtered.map((a, i) => {
                const sc = STATUS[a.status] || STATUS.available
                return (
                  <tr key={a.id || i}>
                    <td><strong>{a.doctor}</strong></td>
                    <td>{a.patient}</td>
                    <td><CalendarDays size={13} style={{ marginRight: 4, display: 'inline' }} />{a.date}</td>
                    <td><span className="time-pill"><Clock size={12} style={{ marginRight: 4, display: 'inline' }} />{a.time}</span></td>
                    <td className="tbl-fee">${a.fee}</td>
                    <td><span className="tbl-badge" style={{ background: sc.bg, color: sc.color }}>{a.status}</span></td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="tbl-empty">No appointments found</td></tr>}
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
        .pts-search { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: var(--card-bg); border: 1px solid var(--input-border); border-radius: var(--radius); color: var(--text-muted); min-width: 300px; }
        .pts-search input { border: none; background: none; outline: none; flex: 1; color: var(--text-main); font-size: 14px; }
        .d-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
        .tbl-wrap { overflow-x: auto; }
        .tbl { width: 100%; border-collapse: separate; border-spacing: 0; }
        .tbl th { text-align: left; padding: 12px 16px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; border-bottom: 2px solid var(--border); }
        .tbl td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--border); }
        .tbl tbody tr:hover td { background: var(--primary-light); }
        .tbl-fee { font-weight: 700; }
        .time-pill { display: inline-flex; align-items: center; padding: 4px 10px; background: var(--primary-light); color: var(--primary); border-radius: var(--radius-full); font-size: 12px; font-weight: 700; }
        .tbl-badge { display: inline-block; padding: 4px 14px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; text-transform: capitalize; }
        .tbl-empty { text-align: center; padding: 40px !important; color: var(--text-muted); }
      `}</style>
    </div>
  )
}
