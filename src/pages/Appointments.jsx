import { useState, useEffect } from 'react'
import { Plus, Loader2, Trash2, Clock, CalendarDays, DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { doctorApi } from '../services/api'

const ST = {
  available: { bg: '#dbeafe', color: '#1e40af', label: 'Available' },
  booked: { bg: '#fef3c7', color: '#92400e', label: 'Booked' },
  completed: { bg: '#d1fae5', color: '#065f46', label: 'Completed' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ appointmentDate: '', appointmentTime: '', consultationFee: '' })

  const fetch = async () => {
    try {
      const res = await doctorApi.getUpcomingAppointments()
      setAppointments(res.data?.data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetch() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await doctorApi.createAppointment({
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        consultationFee: Number(form.consultationFee),
      })
      toast.success('Appointment created')
      setShowForm(false)
      setForm({ appointmentDate: '', appointmentTime: '', consultationFee: '' })
      fetch()
    } catch { toast.error('Failed to create') }
  }

  const handleStatus = async (id, status) => {
    try {
      await doctorApi.updateAppointment({ appointmentId: id, status, appointmentDate: '', appointmentTime: '', consultationFee: 0 })
      toast.success(`Marked as ${status}`)
      fetch()
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id) => {
    try {
      await doctorApi.deleteAppointment(id)
      toast.success('Appointment deleted')
      fetch()
    } catch { toast.error('Failed to delete') }
  }

  if (loading) return <div className="pg-load"><Loader2 size={36} className="spnr" /></div>

  return (
    <div className="apts">
      <div className="apts-top">
        <div>
          <h1 className="pg-title">Appointments</h1>
          <p className="pg-sub">Manage your schedule</p>
        </div>
        <button className="btn-p" onClick={() => setShowForm(true)}><Plus size={18} /> New Slot</button>
      </div>

      {showForm && (
        <div className="mod-overlay" onClick={() => setShowForm(false)}>
          <div className="mod" onClick={(e) => e.stopPropagation()}>
            <h3 className="mod-title">Create Appointment Slot</h3>
            <form onSubmit={handleCreate}>
              <div className="fld"><label><CalendarDays size={15} /> Date</label><input type="date" required value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} /></div>
              <div className="fld"><label><Clock size={15} /> Time</label><input type="time" required value={form.appointmentTime} onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })} /></div>
              <div className="fld"><label><DollarSign size={15} /> Fee ($)</label><input type="number" required min="0" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} /></div>
              <div className="mod-acts">
                <button type="button" className="btn-s" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-p">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="d-card" style={{ marginTop: 24 }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>Date</th><th>Time</th><th>Fee</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
            </tr></thead>
            <tbody>
              {appointments.map((apt, i) => {
                const s = ST[apt.status] || ST.available
                return (
                  <tr key={apt.id || i}>
                    <td><span className="tbl-date">{apt.appointmentDate || '--'}</span></td>
                    <td><span className="tbl-time">{apt.appointmentTime || '--'}</span></td>
                    <td className="tbl-fee">${apt.consultationFee || 0}</td>
                    <td><span className="tbl-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span></td>
                    <td>
                      <div className="tbl-acts">
                        {apt.status === 'available' && <button className="act-btn act-grn" onClick={() => handleStatus(apt.id, 'booked')}>Book</button>}
                        {apt.status === 'booked' && <button className="act-btn act-blu" onClick={() => handleStatus(apt.id, 'completed')}>Complete</button>}
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && <button className="act-btn act-red" onClick={() => handleStatus(apt.id, 'cancelled')}>Cancel</button>}
                        <button className="act-btn act-ico" onClick={() => handleDelete(apt.id)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {appointments.length === 0 && <tr><td colSpan={5} className="tbl-empty">No appointments found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .pg-load { display: flex; justify-content: center; padding: 100px 0; }
        .spnr { animation: spnr 0.8s linear infinite; color: var(--primary); } @keyframes spnr { to { transform: rotate(360deg) } }
        .apts { animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .apts-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
        .pg-title { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; }
        .pg-sub { color: var(--text-muted); margin-top: 4px; font-size: 14px; }
        .btn-p {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px;
          background: linear-gradient(135deg, var(--primary), #1d4ed8); color: white; border: none;
          border-radius: var(--radius); font-weight: 700; font-size: 14px; cursor: pointer;
          transition: all 0.25s ease; box-shadow: 0 4px 14px rgba(21,82,193,0.2);
        }
        .btn-p:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(21,82,193,0.3); }
        .btn-s { padding: 12px 22px; background: var(--border); color: var(--text-main); border: none; border-radius: var(--radius); font-weight: 600; cursor: pointer; }
        .mod-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .mod {
          background: var(--card-bg); border-radius: var(--radius-lg); padding: 32px;
          width: 100%; max-width: 460px; border: 1px solid var(--border); box-shadow: var(--shadow-lg);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .mod-title { font-size: 20px; font-weight: 700; margin-bottom: 24px; }
        .fld { margin-bottom: 20px; }
        .fld label { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; font-weight: 600; font-size: 13px; color: var(--text-muted); }
        .fld input {
          width: 100%; padding: 12px 16px; border-radius: var(--radius);
          border: 1px solid var(--input-border); background: var(--bg); color: var(--text-main);
          font-size: 14px; outline: none;
        }
        .fld input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(21,82,193,0.1); }
        .mod-acts { display: flex; gap: 12px; justify-content: flex-end; margin-top: 28px; }
        .d-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
        .tbl-wrap { overflow-x: auto; }
        .tbl { width: 100%; border-collapse: separate; border-spacing: 0; }
        .tbl th { text-align: left; padding: 12px 16px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; border-bottom: 2px solid var(--border); }
        .tbl td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--border); }
        .tbl tbody tr { transition: background 0.15s ease; }
        .tbl tbody tr:hover td { background: var(--primary-light); }
        .tbl-date { font-weight: 600; }
        .tbl-time { display: inline-block; padding: 4px 10px; background: var(--primary-light); color: var(--primary); border-radius: var(--radius-full); font-size: 12px; font-weight: 700; }
        .tbl-fee { font-weight: 700; }
        .tbl-badge { display: inline-block; padding: 4px 14px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; text-transform: capitalize; }
        .tbl-acts { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
        .act-btn { padding: 6px 12px; border: none; border-radius: var(--radius-sm); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
        .act-btn:hover { transform: translateY(-1px); }
        .act-grn { background: #d1fae5; color: #065f46; }
        .act-blu { background: #dbeafe; color: #1e40af; }
        .act-red { background: #fee2e2; color: #991b1b; }
        .act-ico { background: none; color: var(--text-muted); padding: 6px; }
        .act-ico:hover { background: var(--border); }
        .tbl-empty { text-align: center; padding: 40px !important; color: var(--text-muted); }
      `}</style>
    </div>
  )
}
