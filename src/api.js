// Mock API Service for Doctor Dashboard
const mockDelay = (data) => new Promise(resolve => setTimeout(() => resolve({ data }), 500));

export const authApi = {
  login: (data) => mockDelay({ 
    user: { id: '1', fullName: 'Dr. James Wilson', role: 'doctor' } 
  }),
};

export const appointmentApi = {
  getForUser: (userId) => mockDelay([
    { _id: '1', patient: { _id: 'p1', fullName: 'John Doe', email: 'john.doe@example.com' }, time: '10:00 AM', date: new Date(), notes: 'Annual checkup', status: 'pending' },
    { _id: '2', patient: { _id: 'p2', fullName: 'Jane Smith', email: 'jane.smith@example.com' }, time: '11:30 AM', date: new Date(), notes: 'Consultation', status: 'confirmed' },
    { _id: '3', patient: { _id: 'p3', fullName: 'Ahmed Ali', email: 'ahmed.ali@example.com' }, time: '1:00 PM', date: new Date(), notes: 'Follow-up', status: 'pending' },
    { _id: '4', patient: { _id: 'p4', fullName: 'Maria Gonzales', email: 'maria.gonzales@example.com' }, time: '2:30 PM', date: new Date(), notes: 'Lab results review', status: 'cancelled' }
  ]),
  updateStatus: (id, status) => mockDelay({ message: 'Status updated' }),
};

export default {};
