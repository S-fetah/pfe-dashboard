import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
)

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  getProfile: () => api.get('/user'),
  getProtected: () => api.get('/protected'),
}

export const adminApi = {
  getPendingDoctors: () => api.get('/admin/doctors/pending'),
  updateDoctorStatus: (doctorId, status) => api.put(`/admin/doctors/${doctorId}/status`, { status }),
  getAllDoctors: () => api.get('/doctors'),
}

export const doctorApi = {
  completeBio: (data) => api.put('/doctors/completeBio', data),
  getPatients: () => api.get('/doctors/patients'),
  getUpcomingAppointments: () => api.get('/doctors/appointments/upcoming'),
  createAppointment: (data) => api.post('/doctors/appointments/create', data),
  updateAppointment: (data) => api.put('/doctors/appointments/update', data),
  deleteAppointment: (appointmentId) => api.delete('/doctors/appointments/delete', { data: { appointmentId } }),
  getPayments: () => api.get('/doctors/payments'),
  createPayment: (data) => api.post('/doctors/payments', data),
  updatePayment: (paymentId, data) => api.put(`/doctors/payments/${paymentId}`, data),
  deletePayment: (paymentId) => api.delete(`/doctors/payments/${paymentId}`),
  updateBookingStatus: (bookingId, status) => api.put(`/doctors/bookings/${bookingId}/status`, { status }),
}
