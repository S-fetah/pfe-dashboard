import { useState, useEffect } from 'react'
import { Loader2, DollarSign, CheckCircle, Clock, TrendingUp, ArrowUpRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { doctorApi } from '../services/api'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    doctorApi.getPayments()
      .then((res) => setPayments(res.data?.data || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const total = payments.reduce((s, p) => s + (p.amount || 0), 0)
  const paid = payments.filter((p) => p.status === 'paid').length
  const unpaid = payments.filter((p) => p.status === 'unpaid' || p.status === 'pending').length

  if (loading) return <div className="pg-load"><Loader2 size={36} className="spnr" /></div>

  return (
    <div className="pym">
      <div className="pym-top">
        <div>
          <h1 className="pg-title">Payments</h1>
          <p className="pg-sub">{payments.length} total transactions</p>
        </div>
      </div>
      <div className="pym-stats">
        <div className="pym-stat" style={{ '--clr': '#059669' }}>
          <div className="pym-stat-top">
            <div className="pym-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}><DollarSign size={22} /></div>
            <span className="pym-stat-trend" style={{ color: '#059669' }}><TrendingUp size={14} /> +12%</span>
          </div>
          <div className="pym-stat-val">${total.toLocaleString()}</div>
          <div className="pym-stat-lbl">Total Earnings</div>
        </div>
        <div className="pym-stat" style={{ '--clr': '#1552C1' }}>
          <div className="pym-stat-top">
            <div className="pym-stat-icon" style={{ background: '#dbeafe', color: '#1552C1' }}><CheckCircle size={22} /></div>
          </div>
          <div className="pym-stat-val">{paid}</div>
          <div className="pym-stat-lbl">Paid</div>
        </div>
        <div className="pym-stat" style={{ '--clr': '#F59E0B' }}>
          <div className="pym-stat-top">
            <div className="pym-stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}><Clock size={22} /></div>
          </div>
          <div className="pym-stat-val">{unpaid}</div>
          <div className="pym-stat-lbl">Unpaid / Pending</div>
        </div>
      </div>
      <div className="d-card" style={{ marginTop: 24 }}>
        <div className="d-card-hdr">
          <h3>Payment History</h3>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th>Patient</th><th>Amount</th><th>Status</th><th>Date</th><th>Transaction</th>
            </tr></thead>
            <tbody>
              {payments.map((p, i) => {
                const sc = p.status === 'paid' ? { bg: '#d1fae5', color: '#065f46' }
                  : p.status === 'unpaid' ? { bg: '#fef3c7', color: '#92400e' }
                  : { bg: '#dbeafe', color: '#1e40af' }
                return (
                  <tr key={p.id || i}>
                    <td>
                      <div className="tbl-patient">
                        <div className="tbl-av">{p.patient?.fullName?.charAt(0) || '?'}</div>
                        <span>{p.patient?.fullName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="tbl-amount">${p.amount || 0}</td>
                    <td><span className="tbl-badge" style={{ background: sc.bg, color: sc.color }}>{p.status || 'unpaid'}</span></td>
                    <td className="tbl-cell-muted">{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '--'}</td>
                    <td className="tbl-cell-muted">{p.transactionId || '--'}</td>
                  </tr>
                )
              })}
              {payments.length === 0 && <tr><td colSpan={5} className="tbl-empty">No payments yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        .pg-load { display: flex; justify-content: center; padding: 100px 0; }
        .spnr { animation: spnr 0.8s linear infinite; color: var(--primary); } @keyframes spnr { to { transform: rotate(360deg) } }
        .pym { animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .pym-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
        .pg-title { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; }
        .pg-sub { color: var(--text-muted); margin-top: 4px; font-size: 14px; }
        .pym-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .pym-stat {
          background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px;
          position: relative; overflow: hidden;
        }
        .pym-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--clr); }
        .pym-stat-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
        .pym-stat-icon { width: 48px; height: 48px; border-radius: var(--radius); display: flex; align-items: center; justify-content: center; }
        .pym-stat-trend { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: var(--radius-full); background: color-mix(in srgb, currentColor 10%, transparent); }
        .pym-stat-val { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
        .pym-stat-lbl { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .d-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
        .d-card-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .d-card-hdr h3 { font-size: 16px; font-weight: 700; }
        .tbl-wrap { overflow-x: auto; }
        .tbl { width: 100%; border-collapse: separate; border-spacing: 0; }
        .tbl th { text-align: left; padding: 12px 16px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; border-bottom: 2px solid var(--border); }
        .tbl td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--border); }
        .tbl tbody tr { transition: background 0.15s ease; }
        .tbl tbody tr:hover td { background: var(--primary-light); }
        .tbl-patient { display: flex; align-items: center; gap: 12px; }
        .tbl-av { width: 34px; height: 34px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
        .tbl-amount { font-weight: 700; }
        .tbl-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 14px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; text-transform: capitalize; }
        .tbl-cell-muted { color: var(--text-muted); }
        .tbl-empty { text-align: center; padding: 40px !important; color: var(--text-muted); }
      `}</style>
    </div>
  )
}
