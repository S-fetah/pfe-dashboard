import React, { useState, useEffect } from 'react'
import './App.css'
import { appointmentApi } from './api'
import Login from './Login'

function App() {
  const [user, setUser] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [doctorProfile, setDoctorProfile] = useState({
    experienceYears: 15,
    bio: 'Experienced cardiologist with a passion for patient-centered care, advanced diagnostics, and personalized treatment plans.',
    specialties: ['Interventional Cardiology', 'Heart Valve Disease', 'Hypertension', 'Electrophysiology'],
    certificates: [
      { id: 'c1', title: 'Board Certified Cardiologist', issuer: 'American Board of Internal Medicine' },
      { id: 'c2', title: 'Advanced Cardiac Life Support', issuer: 'American Heart Association' },
    ],
  })
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [profileMessage, setProfileMessage] = useState('')

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('doctorUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    const savedProfile = localStorage.getItem('doctorProfile')
    if (savedProfile) {
      setDoctorProfile(JSON.parse(savedProfile))
    }
  }, [])

  useEffect(() => {
    const profileData = {
      ...doctorProfile,
      certificates: doctorProfile.certificates.map(({ id, title, issuer }) => ({ id, title, issuer })),
    }
    localStorage.setItem('doctorProfile', JSON.stringify(profileData))
  }, [doctorProfile])

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const response = await appointmentApi.getForUser(user.id)
      setAppointments(response.data)
    } catch (err) {
      console.error('Failed to fetch appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('doctorUser', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('doctorUser')
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status)
      fetchAppointments()
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleAddSpecialty = () => {
    const trimmed = specialtyInput.trim()
    if (!trimmed) return
    if (doctorProfile.specialties.includes(trimmed)) {
      setProfileMessage('Specialty already added.')
      setTimeout(() => setProfileMessage(''), 2500)
      return
    }
    setDoctorProfile({
      ...doctorProfile,
      specialties: [...doctorProfile.specialties, trimmed],
    })
    setSpecialtyInput('')
    setProfileMessage('Specialty added.')
    setTimeout(() => setProfileMessage(''), 2500)
  }

  const handleRemoveSpecialty = (specialty) => {
    setDoctorProfile({
      ...doctorProfile,
      specialties: doctorProfile.specialties.filter((item) => item !== specialty),
    })
    setProfileMessage('Specialty removed.')
    setTimeout(() => setProfileMessage(''), 2500)
  }

  const handleRemoveCertificate = (certificateId) => {
    setDoctorProfile({
      ...doctorProfile,
      certificates: doctorProfile.certificates.filter((cert) => cert.id !== certificateId),
    })
    setProfileMessage('Certificate removed.')
    setTimeout(() => setProfileMessage(''), 2500)
  }

  const handleProfileCertificatesChange = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    const newCertificates = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      title: file.name,
      issuer: 'Uploaded Certificate',
      file,
    }))
    setDoctorProfile({
      ...doctorProfile,
      certificates: [...doctorProfile.certificates, ...newCertificates],
    })
    setProfileMessage(`${files.length} certificate(s) uploaded.`)
    setTimeout(() => setProfileMessage(''), 2500)
  }

  const handleSaveProfile = () => {
    localStorage.setItem('doctorProfile', JSON.stringify(doctorProfile))
    setProfileMessage('Profile saved successfully.')
    setTimeout(() => setProfileMessage(''), 2500)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const uniquePatients = Array.from(new Set(appointments.map(a => a.patient?._id)))
    .map(id => {
      const patientApps = appointments.filter(a => a.patient?._id === id);
      const latestApp = patientApps[0];
      return {
        ...latestApp?.patient,
        latestAppointment: latestApp
      };
    })
    .filter(p => p._id);

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo">MediCare</div>
        <div className="doctor-profile-sidebar">
          <strong>{user.fullName}</strong>
          <p>Medical Professional</p>
        </div>
        <nav style={{ marginTop: '20px' }}>
          {['Dashboard', 'Patients', 'Profile'].map(tab => (
            <a
              key={tab}
              href="#"
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={(event) => {
                event.preventDefault()
                setActiveTab(tab)
              }}
            >
              {tab}
            </a>
          ))}
          <a 
            href="#" 
            className="nav-item" 
            onClick={handleLogout} 
            style={{ color: '#EF4444', marginTop: 'auto', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}
          >
            Logout
          </a>
        </nav>
      </div>

      <div className="main-content">
        <header className="header">
          <div>
            <h1 style={{ color: '#979797ff' }}>{activeTab === 'Profile' ? 'Doctor Profile' : `${activeTab} Overview`}</h1>
          </div>
        </header>

        {activeTab === 'Dashboard' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Appointments</div>
                <div className="stat-value">{appointments.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Unique Patients</div>
                <div className="stat-value">{uniquePatients.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending Confirmations</div>
                <div className="stat-value">{pendingAppointments.length}</div>
              </div>
            </div>

            <div className="schedule-container">
              <div className="card">
                <h3 style={{ marginBottom: '20px' }}>Recent Appointment Requests</h3>
                {loading ? (
                  <p>Loading...</p>
                ) : appointments.length === 0 ? (
                  <p>No appointments found.</p>
                ) : (
                  appointments.slice(0, 5).map((app, index) => (
                    <div key={index} className="appointment-item">
                      <div className="time">{app.time}</div>
                      <div className="patient-info">
                        <h4>{app.patient?.fullName || 'Anonymous Patient'}</h4>
                        <p>{app.notes || 'General Consultation'}</p>
                      </div>
                      <span className={`badge ${app.status === 'confirmed' ? 'badge-in-person' : 'badge-video'}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'Patients' && (
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>My Patients & Status</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #F1F5F9' }}>
                  <th style={{ padding: '12px' }}>Patient Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Latest Appt.</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {uniquePatients.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{p.fullName}</td>
                    <td style={{ padding: '12px', color: '#64748B' }}>{p.email}</td>
                    <td style={{ padding: '12px', color: '#94A3B8' }}>{p.latestAppointment?.time}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: p.latestAppointment?.status === 'confirmed' ? '#ECFDF5' : '#FEF2F2',
                        color: p.latestAppointment?.status === 'confirmed' ? '#059669' : '#EF4444'
                      }}>
                        {p.latestAppointment?.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {p.latestAppointment?.status === 'pending' && (
                        <>
                          <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => handleStatusUpdate(p.latestAppointment._id, 'confirmed')}>Approve</button>
                          <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', color: '#EF4444', borderColor: '#FECACA' }} onClick={() => handleStatusUpdate(p.latestAppointment._id, 'cancelled')}>Cancel</button>
                        </>
                      )}
                      <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>Records</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Profile' && (
          <div className="profile-grid">
            <div className="card profile-summary">
              <h3>Doctor Profile</h3>
              <p style={{ color: '#64748B', marginTop: 8, marginBottom: 24 }}>
                Update your biography, specialties, experience, and certificates.
              </p>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#64748B' }}>Years of Experience</span>
                  <strong>{doctorProfile.experienceYears}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#64748B' }}>Specialties</span>
                  <strong>{doctorProfile.specialties.length}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Certificates</span>
                  <strong>{doctorProfile.certificates.length}</strong>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 12 }}>Biography</h4>
                <p style={{ color: '#475569', lineHeight: 1.8 }}>
                  {doctorProfile.bio}
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ marginBottom: 12 }}>Skills & Specialties</h4>
                <div className="tags-row">
                  {doctorProfile.specialties.map((spec) => (
                    <span key={spec} className="tag-pill">{spec}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: 12 }}>Certificates</h4>
                {doctorProfile.certificates.map((cert) => (
                  <div key={cert.id} className="certificate-item">
                    <div>
                      <strong>{cert.title}</strong>
                      <div style={{ fontSize: 13, color: '#64748B' }}>{cert.issuer}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card profile-form">
              <h3 style={{ marginBottom: '20px' }}>Edit Profile</h3>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={doctorProfile.experienceYears}
                  onChange={(e) => setDoctorProfile({ ...doctorProfile, experienceYears: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  rows="5"
                  value={doctorProfile.bio}
                  onChange={(e) => setDoctorProfile({ ...doctorProfile, bio: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Add Specialty</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    placeholder="Enter new specialty"
                  />
                  <button className="btn-primary" style={{ padding: '12px 18px', minWidth: 110 }} onClick={handleAddSpecialty}>
                    Add
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Current Specialties</label>
                <div className="tags-row" style={{ flexWrap: 'wrap' }}>
                  {doctorProfile.specialties.map((spec) => (
                    <span key={spec} className="tag-pill tag-removable">
                      {spec}
                      <button type="button" className="remove-button" onClick={() => handleRemoveSpecialty(spec)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Upload More Certificates</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  multiple
                  onChange={handleProfileCertificatesChange}
                  style={{ display: 'block', marginTop: 8 }}
                />
              </div>
              <div className="form-group">
                <label>Uploaded Certificates</label>
                <div>
                  {doctorProfile.certificates.map((cert) => (
                    <div key={cert.id} className="certificate-item">
                      <div>
                        <strong>{cert.title}</strong>
                        <div style={{ fontSize: 13, color: '#64748B' }}>{cert.issuer}</div>
                      </div>
                      <button type="button" className="remove-button" onClick={() => handleRemoveCertificate(cert.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn-primary save-button" onClick={handleSaveProfile}>
                Save Profile
              </button>
              {profileMessage && <p style={{ color: '#1552C1', marginTop: 16 }}>{profileMessage}</p>}
            </div>
          </div>
        )}


      </div>
    </div>
  )
}

export default App
