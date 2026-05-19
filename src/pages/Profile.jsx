import { useState, useEffect } from 'react'
import { Loader2, Award, BookOpen, Star, Plus, X, Save, User } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { doctorApi } from '../services/api'

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ title: '', bio: '', specialities: [], certification: [], reviews: [] })
  const [newSpec, setNewSpec] = useState('')
  const [newCert, setNewCert] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    doctorApi.getPatients().then(() => {})
    const saved = localStorage.getItem('doctorUser')
    if (saved) {
      const u = JSON.parse(saved)
      setProfile({
        title: u.details?.title || '',
        bio: u.details?.bio || '',
        specialities: u.details?.specialities || [],
        certification: u.details?.certification || [],
        reviews: u.details?.reviews || [],
      })
    }
    setLoading(false)
  }, [])

  const handleSave = async () => {
    if (profile.title.length < 10) { toast.error('Title needs at least 10 characters'); return }
    if (profile.bio.length < 50) { toast.error('Bio needs at least 50 characters'); return }
    if (profile.specialities.length === 0) { toast.error('Add at least one specialty'); return }
    if (profile.certification.length === 0) { toast.error('Add at least one certification'); return }
    setSaving(true)
    try {
      await doctorApi.completeBio(profile)
      toast.success('Profile saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const add = (field) => {
    const v = field === 'spec' ? newSpec.trim() : newCert.trim()
    if (!v) return
    const arr = field === 'spec' ? profile.specialities : profile.certification
    if (arr.includes(v)) { toast.error('Already exists'); return }
    const key = field === 'spec' ? 'specialities' : 'certification'
    setProfile({ ...profile, [key]: [...arr, v] })
    field === 'spec' ? setNewSpec('') : setNewCert('')
  }

  const remove = (field, item) => {
    const key = field === 'spec' ? 'specialities' : 'certification'
    setProfile({ ...profile, [key]: profile[key].filter((x) => x !== item) })
  }

  if (loading) return <div className="pg-load"><Loader2 size={36} className="spnr" /></div>

  return (
    <div className="prf">
      <div className="prf-top">
        <div>
          <h1 className="pg-title">Profile</h1>
          <p className="pg-sub">Manage your professional information</p>
        </div>
        <button className="btn-p" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={18} className="spnr" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
      <div className="prf-grid">
        <div className="d-card prf-summary">
          <div className="prf-sum-hdr">
            <div className="prf-av-lg">
              {profile.title?.charAt(0)?.toUpperCase() || <User size={32} />}
            </div>
            <div>
              <h3>{profile.title || 'Your Title'}</h3>
              <p className="prf-meta">{profile.specialities.length} specialties &bull; {profile.certification.length} certifications</p>
            </div>
          </div>

          <div className="prf-sec">
            <h4><BookOpen size={17} /> Biography</h4>
            <p className="prf-bio">{profile.bio || 'No biography yet. Tell patients about yourself.'}</p>
          </div>

          <div className="prf-sec">
            <h4><Award size={17} /> Specialties</h4>
            <div className="prf-tags">
              {profile.specialities.map((s) => <span key={s} className="prf-tag">{s}</span>)}
              {profile.specialities.length === 0 && <span className="prf-na">None added</span>}
            </div>
          </div>

          <div className="prf-sec">
            <h4><Star size={17} /> Certifications</h4>
            <div className="prf-certs">
              {profile.certification.map((c) => <div key={c} className="prf-cert"><span>{c}</span></div>)}
              {profile.certification.length === 0 && <span className="prf-na">None added</span>}
            </div>
          </div>

          {profile.reviews.length > 0 && (
            <div className="prf-sec">
              <h4>Reviews</h4>
              {profile.reviews.map((r, i) => (
                <div key={i} className="prf-review">
                  <div className="prf-stars">{'★'.repeat(5)}</div>
                  <p>"{r}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="d-card prf-form">
          <h3 className="prf-form-title">Edit Information</h3>

          <div className="fld">
            <label>Professional Title</label>
            <input value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} placeholder="e.g. Senior Cardiologist (min 10 chars)" />
          </div>
          <div className="fld">
            <label>Biography</label>
            <textarea rows={5} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell patients about yourself (min 50 chars)" />
          </div>

          <div className="fld">
            <label>Specialties</label>
            <div className="prf-add-row">
              <input value={newSpec} onChange={(e) => setNewSpec(e.target.value)} placeholder="Add specialty" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add('spec'))} />
              <button className="btn-ico" onClick={() => add('spec')}><Plus size={18} /></button>
            </div>
            <div className="prf-edit-tags">
              {profile.specialities.map((s) => (
                <span key={s} className="prf-tag prf-tag-rm">
                  {s}
                  <button onClick={() => remove('spec', s)}><X size={13} /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="fld">
            <label>Certifications</label>
            <div className="prf-add-row">
              <input value={newCert} onChange={(e) => setNewCert(e.target.value)} placeholder="Add certification" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add('cert'))} />
              <button className="btn-ico" onClick={() => add('cert')}><Plus size={18} /></button>
            </div>
            <div className="prf-edit-tags">
              {profile.certification.map((c) => (
                <span key={c} className="prf-tag prf-tag-rm">
                  {c}
                  <button onClick={() => remove('cert', c)}><X size={13} /></button>
                </span>
              ))}
            </div>
          </div>

          <button className="btn-p prf-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={18} className="spnr" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
      <style>{`
        .pg-load { display: flex; justify-content: center; padding: 100px 0; }
        .spnr { animation: spnr 0.8s linear infinite; color: var(--primary); } @keyframes spnr { to { transform: rotate(360deg) } }
        .prf { animation: fadeUp 0.4s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .prf-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
        .pg-title { font-size: 30px; font-weight: 800; letter-spacing: -0.5px; }
        .pg-sub { color: var(--text-muted); margin-top: 4px; font-size: 14px; }
        .btn-p {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px;
          background: linear-gradient(135deg, var(--primary), #1d4ed8); color: white; border: none;
          border-radius: var(--radius); font-weight: 700; font-size: 14px; cursor: pointer;
          transition: all 0.25s ease; box-shadow: 0 4px 14px rgba(21,82,193,0.2);
        }
        .btn-p:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(21,82,193,0.3); }
        .btn-p:disabled { opacity: 0.5; cursor: not-allowed; }
        .prf-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; }
        @media (max-width: 900px) { .prf-grid { grid-template-columns: 1fr; } }
        .d-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 28px; }
        .prf-sum-hdr { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
        .prf-av-lg {
          width: 60px; height: 60px; border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), #6366f1);
          color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 26px;
        }
        .prf-sum-hdr h3 { font-size: 18px; }
        .prf-meta { color: var(--text-muted); font-size: 13px; margin-top: 4px; }
        .prf-sec { margin-bottom: 24px; }
        .prf-sec h4 { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--text-main); }
        .prf-bio { color: var(--text-muted); line-height: 1.7; font-size: 14px; }
        .prf-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .prf-tag {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px;
          background: var(--primary-light); color: var(--primary); border-radius: var(--radius-full);
          font-size: 13px; font-weight: 600;
        }
        .prf-tag-rm button { background: none; border: none; color: inherit; display: flex; padding: 2px; border-radius: 50%; cursor: pointer; }
        .prf-tag-rm button:hover { background: rgba(0,0,0,0.1); }
        .prf-na { color: var(--text-muted); font-size: 13px; font-style: italic; }
        .prf-certs { display: flex; flex-direction: column; gap: 8px; }
        .prf-cert { padding: 12px 16px; border-radius: var(--radius); background: var(--bg); border: 1px solid var(--border); font-size: 14px; font-weight: 500; }
        .prf-review { padding: 16px; border-radius: var(--radius); background: var(--bg); border: 1px solid var(--border); margin-bottom: 8px; }
        .prf-stars { color: #f59e0b; margin-bottom: 6px; }
        .prf-review p { font-style: italic; color: var(--text-muted); font-size: 14px; }
        .prf-form-title { font-size: 18px; font-weight: 700; margin-bottom: 24px; }
        .fld { margin-bottom: 20px; }
        .fld label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 13px; color: var(--text-muted); }
        .fld input, .fld textarea {
          width: 100%; padding: 12px 16px; border-radius: var(--radius);
          border: 1px solid var(--input-border); background: var(--bg); color: var(--text-main);
          font-size: 14px; outline: none; transition: border-color var(--transition);
        }
        .fld input:focus, .fld textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(21,82,193,0.1); }
        .fld textarea { resize: vertical; min-height: 110px; }
        .prf-add-row { display: flex; gap: 8px; }
        .prf-add-row input { flex: 1; }
        .btn-ico {
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          background: var(--primary); color: white; border: none; border-radius: var(--radius); cursor: pointer; flex-shrink: 0;
        }
        .btn-ico:hover { opacity: 0.9; }
        .prf-edit-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .prf-save-btn { width: 100%; margin-top: 8px; justify-content: center; }
      `}</style>
    </div>
  )
}
