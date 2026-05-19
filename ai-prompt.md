# Build a Modern Doctor Dashboard (React)

## Objective
Create a full-featured, modern Doctor Dashboard using React. Use the **same color palette** listed below but make the design modern, clean, and professional with charts, animations, and smooth UX.

## Color Palette (DO NOT CHANGE)
```css
--primary: #1552C1;
--primary-light: #EFF6FF;
--bg: #F8FAFC;
--sidebar-bg: #FFFFFF;
--text-main: #1E293B;
--text-muted: #64748B;
--border: #F1F5F9;
--success: #059669;
--error: #EF4444;
--warning-bg: #FEF3C7;
--warning-text: #92400E;
--info-bg: #DBEAFE;
--info-text: #1E40AF;
--badge-confirmed-bg: #ECFDF5;
--badge-cancelled-bg: #FEF2F2;
--tag-bg: #EFF6FF;
--card-bg: #FFFFFF;
--input-border: #E2E8F0;
--hover-bg: #E0E7FF;
--shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px;
```

## Features Required

### 1. Authentication (Login Page)
- Doctor login with email & password
- Role check: only allow doctors
- Show error message for invalid credentials or wrong role
- Password show/hide toggle
- Smooth transitions on login

### 2. Layout
- Left sidebar with: Logo ("MediCare" or similar), doctor name + role, navigation tabs, logout button at bottom
- Right main content area with header and tab content
- Responsive (collapsible sidebar on mobile)

### 3. Dashboard Tab
- **Stats Cards** (with icons & micro-animations):
  - Total Appointments
  - Unique Patients
  - Pending Confirmations
  - Today's Appointments
- **Appointments Chart**: A bar/line chart showing appointments per day/week (use Recharts or Chart.js)
- **Recent Appointment Requests** list with status badges
- **Upcoming Schedule** view (today's timeline)

### 4. Patients Tab
- **Patients table** with columns: Name, Email, Last Appointment, Status, Actions
- **Status badges**: Confirmed (green), Pending (orange), Cancelled (red)
- **Action buttons**: Approve / Cancel for pending patients
- **Search/filter** patients by name
- **Patient detail modal/section** showing appointment history

### 5. Profile Tab
- **Profile Summary** section: experience years, specialties count, certificates count, biography
- **Edit Profile** form: years of experience, bio textarea, add/remove specialties (tags), upload certificates
- **Specialties** as removable tag pills
- **Certificates** list with remove option
- **Save Profile** button with success message

### 6. Charts & Visuals (Modern Touches)
- Use **Recharts** library for:
  - Weekly appointments bar chart on Dashboard
  - Appointment status distribution (pie/donut chart)
  - Patient visit frequency
- Animated stat counters on scroll/load
- Loading skeletons while data fetches

### 7. UI/UX Enhancements
- Smooth page transitions between tabs
- Hover effects on cards, buttons, table rows
- Badge animations
- Toast notifications for actions (approve, cancel, save)
- Responsive design (mobile-first approach)
- Dark mode toggle (using CSS variables)
- Shimmer loading states

## API Endpoints (Doctor Only)
Use **only doctor-related APIs** from the file `./apis.md` (attached separately). Ignore any patient-only endpoints in that file.

## Tech Stack
- **React 18** with Hooks
- **React Router** for navigation (if needed)
- **Recharts** for charts
- **CSS Variables** for theming (use the palette above)
- **axios** for API calls
- **react-hot-toast** or similar for notifications

## File Structure Expected
```
src/
  components/
    Layout/
      Sidebar.jsx
      Header.jsx
    Dashboard/
      StatsCard.jsx
      AppointmentsChart.jsx
      RecentAppointments.jsx
    Patients/
      PatientsTable.jsx
      PatientDetailModal.jsx
    Profile/
      ProfileSummary.jsx
      ProfileForm.jsx
    common/
      StatusBadge.jsx
      LoadingSkeleton.jsx
  pages/
    Login.jsx
    Dashboard.jsx
    Patients.jsx
    Profile.jsx
  hooks/
    useApi.js
  services/
    api.js
  App.jsx
  App.css
  index.css
```

## Design Notes
- Border radius: 12-20px for cards, 999px for pills/badges, 10-14px for inputs/buttons
- Font: 'Inter', system-ui, sans-serif
- Card shadows: subtle, using the shadow variable
- Transitions: 0.2s ease on hover states
- Icons: Use lucide-react or heroicons for consistency
- Keep sidebar at 260px width
- Main content padding: 40px
