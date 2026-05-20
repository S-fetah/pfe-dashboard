import { useState, useEffect } from 'react'
import { Calendar, Users, Clock, DollarSign, Loader2, TrendingUp, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, LineChart, Line } from 'recharts'
import { doctorApi } from '../services/api'

const COLORS = ['#1552C1', '#F59E0B', '#059669', '#EF4444']

function StatCard({ icon: Icon, label, value, color, trend }) {
  return (
    <div className="d-stat" style={{ '--clr': color }}>
      <div className="d-stat-top">
        <div className="d-stat-icon"><Icon size={22} /></div>
        {trend !== undefined && (
          <div className="d-stat-trend" style={{ color: trend >= 0 ? '#059669' : '#EF4444' }}>
            <TrendingUp size={14} style={{ transform: trend >= 0 ? 'none' : 'rotate(180deg)' }} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="d-stat-val">{value}</div>
      <div className="d-stat-lbl">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, uniquePatients: 0, pending: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    Promise.all([
      doctorApi.getAllAppointments().catch(() => ({ data: { data: [] } })),
      doctorApi.getPatients().catch(() => ({ data: { data: [] } })),
    ]).then(([aptRes, patRes]) => {
      const apts = aptRes.data?.data || []
      const pats = patRes.data?.data || []
      setAppointments(apts)
      setStats({
        total: apts.length,
        uniquePatients: pats.length,
        pending: apts.filter(a => a.status === 'available' || a.status === 'booked').length,
        completed: apts.filter(a => a.status === 'completed').length,
      })
    }).finally(() => setLoading(false))
  }, [])

  const weekData = [
    { day: 'Mon', apts: 4 }, { day: 'Tue', apts: 7 }, { day: 'Wed', apts: 3 },
    { day: 'Thu', apts: 8 }, { day: 'Fri', apts: 5 }, { day: 'Sat', apts: 2 }, { day: 'Sun', apts: 1 },
  ]

  const statusData = [
    { name: 'Available', value: Math.max(2, stats.total - stats.pending), color: '#1552C1' },
    { name: 'Booked', value: stats.pending, color: '#F59E0B' },
    { name: 'Completed', value: stats.completed, color: '#059669' },
    { name: 'Cancelled', value: Math.max(0, stats.total - stats.pending - stats.completed), color: '#EF4444' },
  ].filter(d => d.value > 0)

  const cards = [
    { label: 'Total Appointments', value: stats.total, icon: Calendar, color: '#1552C1', trend: 12 },
    { label: 'Unique Patients', value: stats.uniquePatients, icon: Users, color: '#059669', trend: 8 },
    { label: 'Pending', value: stats.pending, icon: Clock, color: '#F59E0B', trend: -3 },
    { label: 'Completed', value: stats.completed, icon: DollarSign, color: '#8B5CF6', trend: 15 },
  ]

  if (loading) return <div className="pg-load"><Loader2 size={36} className="spnr" /></div>

  return (
    <div className="dash">
      <div className="dash-top">
        <div>
          <h1 className="pg-title">Dashboard</h1>
          <p className="pg-sub">Your practice at a glance</p>
        </div>
        <div className="dash-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>
      <div className="d-stats">{cards.map((c) => <StatCard key={c.label} {...c} />)}</div>
      <div className="d-charts">
        <div className="d-card d-card-chart">
          <div className="d-card-hdr">
            <h3>Weekly Overview</h3>
            <button className="d-card-more">View Details <ChevronRight size={14} /></button>
          </div>
          <div className="d-chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="bgArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1552C1" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#1552C1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 13 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow)' }} />
                <Area type="monotone" dataKey="apts" stroke="#1552C1" strokeWidth={3} fill="url(#bgArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="d-card d-card-chart">
          <div className="d-card-hdr">
            <h3>Status Distribution</h3>
          </div>
          <div className="d-chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={5} dataKey="value">
                  {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px' }} />
                <Legend formatter={(v) => <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="d-card" style={{ marginTop: 24 }}>
        <div className="d-card-hdr">
          <h3>Recent Appointments</h3>
          <button className="d-card-more">View All <ChevronRight size={14} /></button>
        </div>
        <div className="d-list">
          {appointments.slice(0, 5).map((apt, i) => (
            <div key={apt.id || i} className="d-row">
              <div className="d-row-time">{apt.appointmentTime || '--'}</div>
              <div className="d-row-info">
                <strong>{apt.patient?.fullName || `Patient #${i + 1}`}</strong>
                <span>{apt.appointmentDate || 'No date'}</span>
              </div>
              <span className={`d-badge ${(apt.status || 'available').toLowerCase()}`}>
                {(apt.status || 'available').toUpperCase()}
              </span>
            </div>
          ))}
          {appointments.length === 0 && <p className="d-empty">No appointments yet</p>}
        </div>
      </div>
      <style>{`
        .pg-load { display: flex; justify-content: center; padding: 100px 0; }
        .spnr { animation: spnr 0.8s linear infinite; color: var(--primary); }
        @keyframes spnr { to { transform: rotate(360deg) } }
        .dash { animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .dash-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .pg-title { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; }
        .pg-sub { color: var(--text-muted); margin-top: 4px; font-size: 14px; }
        .dash-date { padding: 8px 16px; background: var(--primary-light); color: var(--primary); border-radius: var(--radius-full); font-size: 13px; font-weight: 600; }
        .d-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 28px; }
        .d-stat {
          background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg);
          padding: 24px; transition: all 0.25s ease; position: relative; overflow: hidden;
        }
        .d-stat:hover { transform: translateY(-3px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1); }
        .d-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--clr); }
        .d-stat-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .d-stat-icon { width: 48px; height: 48px; border-radius: var(--radius); background: color-mix(in srgb, var(--clr) 12%, transparent); color: var(--clr); display: flex; align-items: center; justify-content: center; }
        .d-stat-trend { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: var(--radius-full); background: color-mix(in srgb, currentColor 10%, transparent); }
        .d-stat-val { font-size: 30px; font-weight: 800; margin-bottom: 4px; }
        .d-stat-lbl { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .d-charts { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
        @media (max-width: 800px) { .d-charts { grid-template-columns: 1fr; } }
        .d-card {
          background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px;
        }
        .d-card-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .d-card-hdr h3 { font-size: 16px; font-weight: 700; }
        .d-card-more { display: flex; align-items: center; gap: 4px; background: none; border: none; color: var(--primary); font-size: 13px; font-weight: 600; padding: 6px 10px; border-radius: var(--radius-sm); cursor: pointer; }
        .d-card-more:hover { background: var(--primary-light); }
        .d-chart-wrap { margin-top: 8px; }
        .d-list { margin-top: 16px; }
        .d-row {
          display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--border);
          transition: background var(--transition);
        }
        .d-row:last-child { border-bottom: none; }
        .d-row:hover { padding-left: 8px; }
        .d-row-time { font-weight: 700; color: var(--primary); min-width: 80px; font-size: 14px; }
        .d-row-info { flex: 1; }
        .d-row-info strong { display: block; font-size: 14px; }
        .d-row-info span { font-size: 12px; color: var(--text-muted); }
        .d-badge { padding: 4px 14px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
        .d-badge.available { background: #dbeafe; color: #1e40af; }
        .d-badge.booked { background: #fef3c7; color: #92400e; }
        .d-badge.completed { background: #d1fae5; color: #065f46; }
        .d-badge.cancelled { background: #fee2e2; color: #991b1b; }
        .d-empty { color: var(--text-muted); text-align: center; padding: 24px; }
      `}</style>
    </div>
  )
}
