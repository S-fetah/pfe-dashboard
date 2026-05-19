import { useState, useEffect } from 'react'
import { Search, Loader2, Mail, Calendar as CalIcon, ChevronRight, X as XIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { doctorApi } from '../services/api'

const BC = {
  'pending acceptence': { bg: '#fef3c7', color: '#92400e' },
  accepted: { bg: '#d1fae5', color: '#065f46' },
  completed: { bg: '#dbeafe', color: '#1e40af' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
}

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    doctorApi.getPatients()
      .then((res) => setPatients(res.data?.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter((p) =>
    (p.user?.fullName || '').toLowerCase().includes(search.toLowerCase())
  )

  const getSC = (s) => BC[s] || BC['pending acceptence']

  if (loading) return <div className="pg-load"><Loader2 size={36} className="spnr" /></div>

  return (
    <div className="pts">
      <div className="pts-top">
        <div>
          <h1 className="pg-title">Patients</h1>
          <p className="pg-sub">{patients.length} registered patients</p>
        </div>
        <div className="pts-search">
          <Search size={17} />
          <input type="text" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="pts-grid">
        {filtered.map((p, i) => {
          const sc = getSC(p.bookingStatus)
          return (
            <div key={p.userId || i} className="pt-card" onClick={() => setSelected(p)}>
              <div className="pt-av" style={{ background: sc.bg, color: sc.color }}>
                {p.user?.fullName?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="pt-info">
                <strong>{p.user?.fullName || 'Unknown'}</strong>
                <span><Mail size={12} /> {p.user?.email || '--'}</span>
              </div>
              <span className="pt-status" style={{ background: sc.bg, color: sc.color }}>{p.bookingStatus || 'pending'}</span>
              <ChevronRight size={16} className="pt-arrow" />
            </div>
          )
        })}
        {filtered.length === 0 && <div className="pts-empty">No patients found</div>}
      </div>

      {selected && (
        <div className="mod-overlay" onClick={() => setSelected(null)}>
          <div className="mod mod-lg" onClick={(e) => e.stopPropagation()}>
            <button className="mod-close" onClick={() => setSelected(null)}><XIcon size={20} /></button>
            <div className="mod-hdr">
              <div className="mod-av-lg">{selected.user?.fullName?.charAt(0)?.toUpperCase() || '?'}</div>
              <div>
                <h3>{selected.user?.fullName || 'Unknown'}</h3>
                <p className="mod-sub"><Mail size={14} /> {selected.user?.email || '--'}</p>
              </div>
            </div>
            <div className="mod-body">
              <h4><CalIcon size={16} /> Appointment History</h4>
              {(selected.appointments || []).length === 0 ? (
                <p className="mod-empty">No appointment history</p>
              ) : (
                <div className="mod-list">
                  {selected.appointments.map((apt, i) => {
                    const aSc = apt.status === 'available' ? { bg: '#dbeafe', color: '#1e40af' }
                      : apt.status === 'booked' ? { bg: '#fef3c7', color: '#92400e' }
                      : apt.status === 'completed' ? { bg: '#d1fae5', color: '#065f46' }
                      : { bg: '#fee2e2', color: '#991b1b' }
                    return (
                      <div key={apt.id || i} className="mod-item">
                        <div className="mod-item-info">
                          <strong>{apt.appointmentDate || '--'} <span className="mod-item-time">{apt.appointmentTime || '--'}</span></strong>
                          <span>Fee: ${apt.consultationFee || 0}</span>
                        </div>
                        <span className="tbl-badge" style={{ background: aSc.bg, color: aSc.color }}>{apt.status || 'available'}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <button className="mod-close-btn" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}

      <style>{`
        .pg-load { display: flex; justify-content: center; padding: 100px 0; }
        .spnr { animation: spnr 0.8s linear infinite; color: var(--primary); } @keyframes spnr { to { transform: rotate(360deg) } }
        .pts { animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .pts-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .pg-title { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; }
        .pg-sub { color: var(--text-muted); margin-top: 4px; font-size: 14px; }
        .pts-search {
          display: flex; align-items: center; gap: 10px; padding: 10px 16px;
          background: var(--card-bg); border: 1px solid var(--input-border); border-radius: var(--radius);
          color: var(--text-muted); min-width: 260px;
        }
        .pts-search input { border: none; background: none; outline: none; flex: 1; color: var(--text-main); font-size: 14px; }
        .pts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
        .pt-card {
          display: flex; align-items: center; gap: 14px; padding: 18px;
          background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg);
          cursor: pointer; transition: all 0.2s ease;
        }
        .pt-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
        .pt-av { width: 44px; height: 44px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; flex-shrink: 0; }
        .pt-info { flex: 1; min-width: 0; }
        .pt-info strong { display: block; font-size: 14px; }
        .pt-info span { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .pt-status { padding: 3px 10px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; white-space: nowrap; }
        .pt-arrow { color: var(--text-muted); flex-shrink: 0; }
        .pts-empty { grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--text-muted); background: var(--card-bg); border-radius: var(--radius-lg); border: 1px dashed var(--border); }
        .mod-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .mod {
          background: var(--card-bg); border-radius: var(--radius-lg); padding: 32px;
          border: 1px solid var(--border); box-shadow: var(--shadow-lg); position: relative;
          animation: slideUp 0.3s ease;
        }
        .mod-lg { width: 100%; max-width: 520px; max-height: 80vh; overflow-y: auto; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .mod-close { position: absolute; top: 16px; right: 16px; background: var(--border); border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); cursor: pointer; }
        .mod-close:hover { background: var(--text-muted); color: white; }
        .mod-hdr { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
        .mod-av-lg { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), #6366f1); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; }
        .mod-hdr h3 { font-size: 20px; }
        .mod-sub { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; margin-top: 4px; }
        .mod-body h4 { display: flex; align-items: center; gap: 8px; font-size: 15px; margin-bottom: 16px; }
        .mod-empty { text-align: center; padding: 24px; color: var(--text-muted); }
        .mod-list { display: flex; flex-direction: column; gap: 8px; }
        .mod-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-radius: var(--radius); background: var(--bg); border: 1px solid var(--border); }
        .mod-item-info strong { display: block; font-size: 14px; }
        .mod-item-time { color: var(--primary); font-weight: 700; }
        .mod-item-info span { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: block; }
        .tbl-badge { display: inline-block; padding: 4px 14px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; text-transform: capitalize; }
        .mod-close-btn { width: 100%; margin-top: 24px; padding: 12px; background: var(--border); border: none; border-radius: var(--radius); font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  )
}
