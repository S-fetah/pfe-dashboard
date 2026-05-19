import { useState } from 'react'
import { Eye, EyeOff, Stethoscope, Loader2, Activity } from 'lucide-react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await onLogin(email, password)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-bg" />
      <div className="login-container">
        <div className="login-brand">
          <div className="brand-icon"><Activity size={40} /></div>
          <h1>MediCare</h1>
          <p>Doctor Management Platform</p>
        </div>
        <div className="login-card">
          <div className="card-content">
            <div className="card-header">
              <div className="avatar-icon"><Stethoscope size={24} /></div>
              <h2>Welcome Back</h2>
              <p>Sign in to your account</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email Address</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@medicare.com"
                />
              </div>
              <div className="field">
                <label>Password</label>
                <div className="pw-wrap">
                  <input
                    type={show ? 'text' : 'password'} required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShow(!show)} tabIndex={-1}>
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && <div className="form-error"><span>⚠</span> {error}</div>}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <Loader2 size={18} className="spinner" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes sp { to { transform: rotate(360deg) } }
        .spinner { animation: sp 0.8s linear infinite }
        .login-root {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: var(--bg); position: relative; overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .login-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 600px 400px at 10% 40%, rgba(21,82,193,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 500px 500px at 90% 60%, rgba(21,82,193,0.04) 0%, transparent 60%);
        }
        .login-container {
          position: relative; display: flex; align-items: center; gap: 60px;
          width: 100%; max-width: 1000px; padding: 40px;
        }
        .login-brand { flex: 1; color: var(--text-main); padding: 40px; }
        .brand-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: linear-gradient(135deg, var(--primary), #6366f1);
          color: white; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(21,82,193,0.2);
          margin-bottom: 24px;
        }
        .login-brand h1 { font-size: 42px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; color: var(--text-main); }
        .login-brand p { font-size: 16px; color: var(--text-muted); }
        .login-card { width: 420px; }
        .card-content {
          background: var(--card-bg); border-radius: var(--radius-lg);
          padding: 40px 36px; border: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
        }
        .card-header { text-align: center; margin-bottom: 32px; }
        .avatar-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--primary-light); color: var(--primary);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .card-header h2 { color: var(--text-main); font-size: 22px; font-weight: 700; margin-bottom: 4px; }
        .card-header p { color: var(--text-muted); font-size: 14px; }
        .field { margin-bottom: 20px; }
        .field label { display: block; margin-bottom: 8px; color: var(--text-main); font-size: 13px; font-weight: 600; }
        .field input {
          width: 100%; padding: 12px 16px; border-radius: var(--radius);
          background: var(--bg); border: 1px solid var(--input-border);
          color: var(--text-main); font-size: 15px; outline: none;
          transition: all 0.25s ease;
        }
        .field input::placeholder { color: var(--text-muted); opacity: 0.5; }
        .field input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(21,82,193,0.1); }
        .pw-wrap { position: relative; }
        .pw-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: var(--text-muted); padding: 4px;
          display: flex; align-items: center;
        }
        .pw-toggle:hover { color: var(--text-main); }
        .form-error {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px; border-radius: var(--radius);
          background: #fef2f2; border: 1px solid #fecaca;
          color: var(--error); font-size: 13px; margin-bottom: 16px;
        }
        .submit-btn {
          width: 100%; padding: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, var(--primary), #1d4ed8);
          color: white; border: none; border-radius: var(--radius); font-size: 15px; font-weight: 700;
          transition: all 0.25s ease;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(21,82,193,0.2); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 800px) {
          .login-container { flex-direction: column; gap: 32px; padding: 20px; }
          .login-brand { padding: 0; text-align: center; }
          .brand-icon { margin: 0 auto 16px; }
          .login-brand h1 { font-size: 32px; }
          .login-card { width: 100%; }
        }
      `}</style>
    </div>
  )
}
