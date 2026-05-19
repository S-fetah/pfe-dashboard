import { useState } from 'react'
import { Menu, X, LogOut, Activity } from 'lucide-react'
import * as Icons from 'lucide-react'

const iconMap = {
  LayoutDashboard: Icons.LayoutDashboard,
  Calendar: Icons.Calendar,
  Users: Icons.Users,
  CreditCard: Icons.CreditCard,
  UserCircle: Icons.UserCircle,
  Stethoscope: Icons.Stethoscope,
}

export default function Layout({ user, pages, activePage, onNavigate, onLogout, roleLabel, children }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="lyt">
      <aside className={`sbrd ${open ? '' : 'clps'}`}>
        <div className="sbrd-hdr">
          <div className="sbrd-logo">
            <div className="sbrd-logo-icon"><Activity size={22} /></div>
            {open && <span className="sbrd-logo-txt">MediCare</span>}
          </div>
          <button className="sbrd-tggl" onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {open && (
          <div className="sbrd-usr">
            <div className="sbrd-av">{user?.fullName?.charAt(0)?.toUpperCase() || 'D'}</div>
            <div className="sbrd-usr-info">
              <strong>{user?.fullName || 'User'}</strong>
              <span>{roleLabel || 'Medical Professional'}</span>
            </div>
          </div>
        )}
        <nav className="sbrd-nav">
          {pages.map((p) => {
            const Ic = iconMap[p.icon]
            return (
              <button key={p.key} className={`sbrd-btn ${activePage === p.key ? 'act' : ''}`} onClick={() => onNavigate(p.key)}>
                {Ic && <Ic size={20} />}
                {open && <span>{p.label}</span>}
              </button>
            )
          })}
        </nav>
        <div className="sbrd-ftr">
          <button className="sbrd-btn sbrd-lo" onClick={onLogout}>
            <LogOut size={20} />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <main className="lyt-main">
        <div className="lyt-pg">{children}</div>
      </main>
      <style>{`
        .lyt { display: flex; min-height: 100vh; background: var(--bg); }
        .sbrd {
          width: 270px; background: var(--sidebar-bg); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh;
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1); z-index: 50;
        }
        .sbrd.clps { width: 72px; }
        .sbrd-hdr {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 16px; border-bottom: 1px solid var(--border);
        }
        .sbrd-logo { display: flex; align-items: center; gap: 12px; }
        .sbrd-logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, var(--primary), #6366f1);
          color: white; border-radius: var(--radius); display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(21,82,193,0.25);
        }
        .sbrd-logo-txt { font-size: 20px; font-weight: 800; background: linear-gradient(135deg, var(--primary), #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .sbrd-tggl { background: none; border: none; color: var(--text-muted); padding: 6px; border-radius: var(--radius-sm); display: flex; }
        .sbrd-tggl:hover { background: var(--border); }
        .sbrd-usr { display: flex; align-items: center; gap: 12px; padding: 20px 16px; border-bottom: 1px solid var(--border); }
        .sbrd-av { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-light), #dbeafe); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; flex-shrink: 0; }
        .sbrd-usr-info strong { font-size: 14px; display: block; }
        .sbrd-usr-info span { font-size: 12px; color: var(--text-muted); }
        .sbrd-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; }
        .sbrd-btn {
          display: flex; align-items: center; gap: 12px; padding: 12px; width: 100%;
          border: none; background: none; border-radius: var(--radius); font-size: 14px;
          font-weight: 500; color: var(--text-muted); transition: all 0.2s ease; text-align: left;
          cursor: pointer;
        }
        .sbrd-btn:hover { background: var(--primary-light); color: var(--primary); }
        .sbrd-btn.act { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(21,82,193,0.2); }
        .sbrd-lo { margin-top: auto; color: var(--error); }
        .sbrd-lo:hover { background: #fef2f2 !important; color: var(--error) !important; }
        .lyt-main { flex: 1; overflow-y: auto; min-height: 100vh; }
        .lyt-pg { padding: 32px; max-width: 1200px; margin: 0 auto; }
        @media (max-width: 768px) {
          .sbrd:not(.clps) { position: fixed; inset: 0; width: 100%; z-index: 100; }
          .sbrd.clps { width: 0; overflow: hidden; }
          .lyt-pg { padding: 16px; }
        }
      `}</style>
    </div>
  )
}
