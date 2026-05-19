# Medi-Care Complete API Documentation

## Base URL
```
http://YOUR_BACKEND_IP:3000/api
```

---

## Table of Contents
1. [Authentication System](#authentication-system)
2. [Auth Endpoints](#auth-endpoints)
3. [User Endpoints](#user-endpoints)
4. [Doctor Endpoints](#doctor-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Payment Endpoints](#payment-endpoints)

---

## Authentication System

### How Sessions Work

This API uses a **custom session-based authentication** system built on top of Firebase Auth and Firestore. Here's the complete flow:

#### 1. Login Flow
1. User sends `POST /api/auth/login` with email and password
2. Backend verifies credentials against **Firebase Auth** using the Firebase Identity Toolkit API
3. On success, Firebase returns a `localId` (user ID) and Firebase tokens
4. Backend generates a **random 64-character hex token** using `crypto.randomBytes(32)`
5. Backend stores this token in Firestore `sessions` collection with:
   - `userId`: the Firebase user ID
   - `accessToken`: the generated token
   - `createdAt` / `updatedAt`: timestamps
6. Backend returns the `accessToken` to the client

#### 2. Protected Request Flow
1. Client includes the token in the `Authorization` header: `Bearer <accessToken>`
2. Backend middleware (`authMiddleware`) intercepts the request:
   - Extracts the token from the `Authorization` header
   - Queries Firestore `sessions` collection where `accessToken` matches
   - If no session found → returns `401 Unauthorized`
   - If session found → extracts `userId` from session data
   - Queries Firestore `users` collection by `userId` (document ID)
   - If user not found → returns `401 Unauthorized`
   - If user found → attaches full user data to `request.user` and proceeds
3. The route handler can access `request.user` which contains:
   - `uid`: user ID
   - `fullName`, `email`, `userType`, `status`, `speciality`, etc.

#### 3. Session Collection Structure (Firestore)
```
sessions/{sessionId}
├── userId: string          // Firebase Auth UID
├── accessToken: string     // 64-char hex token
├── createdAt: string       // ISO timestamp
└── updatedAt: string       // ISO timestamp
```

#### 4. User Collection Structure (Firestore)
```
users/{uid}
├── uid: string
├── fullName: string
├── email: string
├── userType: "user" | "doctor" | "admin"
├── password: string        // stored for login verification
├── status: "active" | "pending" | "refused"
├── speciality: string | null
├── certificateUrl: string | null
├── details: object | null  // bio, title, reviews, etc.
├── createdAt: string
└── updatedAt: string
```

#### 5. Important Notes
- **Tokens do not expire automatically**. You need to implement token expiration/cleanup if needed
- **No logout endpoint** exists yet. To logout, delete the session from Firestore client-side or add a logout endpoint
- Each login creates a **new session** (multiple sessions per user are possible)
- The token is **not a JWT** - it's a random string stored in Firestore

---

## Auth Endpoints

### 1. User Signup
**`POST /api/auth/signup`**

Content-Type: `multipart/form-data`

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | string | Yes | User's full name |
| email | string | Yes | Valid email format |
| password | string | Yes | Min 6 characters |
| userType | string | Yes | `"user"` or `"doctor"` |
| speciality | string | Conditional | Required if `userType` is `"doctor"` |
| certificate | File | Conditional | Required if `userType` is `"doctor"` |

#### Response (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uid": "firebase-uid-here",
    "email": "user@example.com",
    "userType": "doctor"
  }
}
```

#### Response (400) - Doctor without certificate
```json
{
  "success": false,
  "message": "Certificate is required for doctors"
}
```

#### React Native Example
```javascript
const formData = new FormData();
formData.append("fullName", "Dr. Jane Smith");
formData.append("email", "jane@example.com");
formData.append("password", "securepass123");
formData.append("userType", "doctor");
formData.append("speciality", "Cardiology");
formData.append("certificate", {
  uri: selectedFileUri,
  name: "certificate.pdf",
  type: "application/pdf"
});

const response = await fetch("http://YOUR_IP:3000/api/auth/signup", {
  method: "POST",
  headers: { "Accept": "application/json" },
  body: formData,
});
```

---

### 2. User Login
**`POST /api/auth/login`**

Content-Type: `application/json`

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email |
| password | string | Yes | Min 6 characters |

#### Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "a1b2c3d4e5f6...",
  "userId": "firebase-uid-here"
}
```

#### Response (401) - Invalid credentials
```json
{
  "message": "Invalid credentials"
}
```

#### React Native Example
```javascript
const response = await fetch("http://YOUR_IP:3000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  body: JSON.stringify({
    email: "jane@example.com",
    password: "securepass123",
  }),
});

const data = await response.json();
// Store data.accessToken securely (SecureStore/AsyncStorage)
```

---

### 3. Test Certificate Upload
**`POST /api/auth/doctor/certificate`**

Content-Type: `multipart/form-data`

Used to test file upload to Cloudinary without creating a user.

#### Request
- `file`: File upload (PDF or image)

#### Response (200)
```json
{
  "success": true,
  "message": "Test upload successful",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "public_id": "doctor-certificates/xyz123"
  }
}
```

---

### 4. Protected Route (Test)
**`GET /api/protected`**

Headers: `Authorization: Bearer <accessToken>`

#### Response (200)
```json
{
  "message": "This is protected content",
  "user": {
    "uid": "firebase-uid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "userType": "user",
    "status": "active"
  }
}
```

---

## User Endpoints

### 5. Get Current User
**`GET /api/user`**

Headers: `Authorization: Bearer <accessToken>`

#### Response (200)
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "uid": "firebase-uid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "userType": "user",
    "status": "active",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

### 6. Get User Bookings
**`GET /api/user/bookings`**

Headers: `Authorization: Bearer <accessToken>`

Returns all bookings made by the authenticated user.

#### Response (200)
```json
{
  "success": true,
  "message": "Bookings fetched successfully",
  "data": [
    {
      "appointmentId": "apt_123",
      "userId": "user_456",
      "status": "pending acceptence",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 7. Book Appointment
**`POST /api/user/bookings/book`**

Headers: `Authorization: Bearer <accessToken>`
Content-Type: `application/json`

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| appointmentId | string | Yes | ID of the appointment to book |

#### Response (200)
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": "booking_789"
  }
}
```

#### Response (400) - Already booked
```json
{
  "success": false,
  "message": "Booking already exists"
}
```

#### Response (404) - Appointment not found
```json
{
  "success": false,
  "message": "Appointment not found"
}
```

---

## Doctor Endpoints

### 8. Get All Doctors
**`GET /api/doctors`**

Headers: `Authorization: Bearer <accessToken>`

Returns all registered doctors.

#### Response (200)
```json
{
  "success": true,
  "message": "Doctors fetched successfully",
  "data": {
    "FileterdDoctors": [
      {
        "uid": "doctor_uid",
        "fullName": "Dr. Jane Smith",
        "email": "jane@example.com",
        "userType": "doctor",
        "status": "active",
        "speciality": "Cardiology",
        "certificateUrl": "https://res.cloudinary.com/...",
        "details": {
          "title": "Senior Cardiologist",
          "bio": "Experienced cardiologist with 10+ years...",
          "specialities": ["Cardiology", "Internal Medicine"],
          "certification": ["Board Certified"],
          "reviews": ["Great doctor!"]
        }
      }
    ]
  }
}
```

---

### 9. Complete Doctor Bio
**`PUT /api/doctors/completeBio`**

Headers: `Authorization: Bearer <accessToken>`
Content-Type: `application/json`

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Min 10 characters |
| bio | string | Yes | Min 50 characters |
| specialities | string[] | Yes | Min 1 item |
| certification | string[] | Yes | Min 1 item |
| reviews | string[] | No | Min 1 item, defaults to `[]` |

#### Response (200)
```json
{
  "success": true,
  "message": "Details updated successfully"
}
```

---

### 10. Create Appointment
**`POST /api/doctors/appointments/create`**

Headers: `Authorization: Bearer <accessToken>`
Content-Type: `application/json`

Only doctors can create appointments.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| appointmentDate | string | Yes | Format: `YYYY-MM-DD` |
| appointmentTime | string | Yes | Time string |
| consultationFee | number | Yes | Fee amount |

#### Response (201)
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": "apt_123"
  }
}
```

#### Response (401) - Not a doctor
```json
{
  "success": false,
  "message": "Unauthorized... only doctor can create appointment",
  "userType": "user"
}
```

---

### 11. Update Appointment
**`PUT /api/doctors/appointments/update`**

Headers: `Authorization: Bearer <accessToken>`
Content-Type: `application/json`

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| appointmentId | string | Yes | Appointment ID |
| appointmentDate | string | Yes | Format: `YYYY-MM-DD` |
| appointmentTime | string | Yes | Time string |
| status | string | Yes | `"booked"`, `"completed"`, `"cancelled"`, `"rescheduled"`, `"available"` |
| consultationFee | number | Yes | Fee amount |

#### Response (200)
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "data": {}
}
```

---

### 12. Delete Appointment
**`DELETE /api/doctors/appointments/delete`**

Headers: `Authorization: Bearer <accessToken>`
Content-Type: `application/json`

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| appointmentId | string | Yes | Appointment ID to delete |

#### Response (200)
```json
{
  "success": true,
  "message": "Appointment deleted successfully"
}
```

---

### 13. Get Doctor Patients
**`GET /api/doctors/patients`**

Headers: `Authorization: Bearer <accessToken>`

Returns all patients who have booked appointments with the authenticated doctor, grouped by patient with their appointment details.

#### Response (200)
```json
{
  "success": true,
  "message": "Patients fetched successfully",
  "data": [
    {
      "userId": "patient_uid",
      "user": {
        "uid": "patient_uid",
        "fullName": "John Patient",
        "email": "john@example.com",
        "userType": "user",
        "status": "active"
      },
      "bookingId": "booking_123",
      "bookingStatus": "pending acceptence",
      "bookingDate": "2025-01-15T10:30:00.000Z",
      "appointments": [
        {
          "id": "apt_456",
          "doctorId": "doctor_uid",
          "appointmentDate": "2025-02-01",
          "appointmentTime": "10:00 AM",
          "consultationFee": 100,
          "status": "available",
          "createdAt": "2025-01-10T08:00:00.000Z",
          "updatedAt": "2025-01-10T08:00:00.000Z"
        }
      ]
    }
  ]
}
```

#### Response (200) - No patients
```json
{
  "success": true,
  "message": "No patients found",
  "data": []
}
```

---

### 14. Get Doctor Upcoming Appointments
**`GET /api/doctors/appointments/upcoming`**

Headers: `Authorization: Bearer <accessToken>`

Returns all appointments for the authenticated doctor with dates >= today.

#### Response (200)
```json
{
  "success": true,
  "message": "Upcoming appointments fetched successfully",
  "data": [
    {
      "id": "apt_123",
      "doctorId": "doctor_uid",
      "appointmentDate": "2025-02-01",
      "appointmentTime": "10:00 AM",
      "consultationFee": 100,
      "status": "available",
      "createdAt": "2025-01-10T08:00:00.000Z",
      "updatedAt": "2025-01-10T08:00:00.000Z"
    }
  ]
}
```

---

## Admin Endpoints

> **Note:** Admin endpoints check that the authenticated user has `userType: "admin"`. You need to manually set a user's `userType` to `"admin"` in Firestore to use these endpoints.

### 15. Get Pending Doctors
**`GET /api/admin/doctors/pending`**

Headers: `Authorization: Bearer <accessToken>`

Returns all doctors with `status: "pending"` (newly registered doctors awaiting license approval).

#### Response (200)
```json
{
  "success": true,
  "message": "Pending doctors fetched successfully",
  "data": [
    {
      "id": "doctor_uid",
      "uid": "doctor_uid",
      "fullName": "Dr. Jane Smith",
      "email": "jane@example.com",
      "userType": "doctor",
      "status": "pending",
      "speciality": "Cardiology",
      "certificateUrl": "https://res.cloudinary.com/...",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Response (200) - No pending doctors
```json
{
  "success": true,
  "message": "No pending doctors",
  "data": []
}
```

---

### 16. Update Doctor Status (Accept/Refuse)
**`PUT /api/admin/doctors/:doctorId/status`**

Headers: `Authorization: Bearer <accessToken>`
Content-Type: `application/json`

#### URL Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| doctorId | string | Yes | The Firestore document ID of the doctor |

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | `"active"` to accept, `"refused"` to reject |

#### Response (200) - Success
```json
{
  "success": true,
  "message": "Doctor status updated to active",
  "data": {
    "doctorId": "doctor_uid",
    "status": "active"
  }
}
```

#### Response (404) - Doctor not found
```json
{
  "success": false,
  "message": "Doctor not found"
}
```

#### Response (400) - Not a doctor
```json
{
  "success": false,
  "message": "User is not a doctor"
}
```

#### React Native Example
```javascript
// Accept a doctor
const response = await fetch("http://YOUR_IP:3000/api/admin/doctors/doctor_uid/status", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${adminToken}`,
  },
  body: JSON.stringify({ status: "active" }),
});

// Refuse a doctor
const response = await fetch("http://YOUR_IP:3000/api/admin/doctors/doctor_uid/status", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${adminToken}`,
  },
  body: JSON.stringify({ status: "refused" }),
});
```

---

## Payment Endpoints

> **Note:** Payment endpoints are restricted to doctors only. The authenticated user must have `userType: "doctor"`.

### Payment Data Model (Firestore)
```
payments/{paymentId}
├── appointmentId: string     // Reference to the appointment
├── amount: number            // Payment amount
├── status: string            // "paid", "unpaid", "pending"
├── transactionId: string | null  // Transaction/proof reference
├── paymentProof: string | null   // URL to payment proof image/document
├── paymentDate: string       // ISO timestamp (set when status becomes "paid")
├── createdAt: string         // ISO timestamp
└── updatedAt: string         // ISO timestamp
```

---

### 17. Get Doctor Payments
**`GET /api/doctors/payments`**

Headers: `Authorization: Bearer <accessToken>`

Returns all payments for the authenticated doctor's appointments, including patient and appointment details.

#### Response (200)
```json
{
  "success": true,
  "message": "Payments fetched successfully",
  "data": [
    {
      "id": "payment_123",
      "appointmentId": "apt_456",
      "amount": 100,
      "status": "paid",
      "transactionId": "TXN789012",
      "paymentProof": "https://res.cloudinary.com/proof.jpg",
      "paymentDate": "2025-01-20T14:00:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-20T14:00:00.000Z",
      "appointment": {
        "id": "apt_456",
        "doctorId": "doctor_uid",
        "appointmentDate": "2025-02-01",
        "appointmentTime": "10:00 AM",
        "consultationFee": 100,
        "status": "booked"
      },
      "patient": {
        "uid": "patient_uid",
        "fullName": "John Patient",
        "email": "john@example.com",
        "userType": "user",
        "status": "active"
      }
    }
  ]
}
```

#### Response (200) - No payments
```json
{
  "success": true,
  "message": "No payments found",
  "data": []
}
```

---

### 18. Create Payment
**`POST /api/doctors/payments`**

Headers: `Authorization: Bearer <accessToken>`
Content-Type: `application/json`

Creates a new payment record for an appointment.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| appointmentId | string | Yes | ID of the appointment |
| amount | number | Yes | Must be positive |
| status | string | No | `"paid"`, `"unpaid"`, `"pending"`. Defaults to `"unpaid"` |
| transactionId | string | No | Transaction reference ID |
| paymentProof | string | No | URL to payment proof |

#### Response (201)
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": "payment_123",
    "appointmentId": "apt_456",
    "amount": 100,
    "status": "unpaid",
    "transactionId": null,
    "paymentProof": null,
    "paymentDate": "2025-01-20T14:00:00.000Z",
    "createdAt": "2025-01-20T14:00:00.000Z",
    "updatedAt": "2025-01-20T14:00:00.000Z"
  }
}
```

#### Response (404) - Appointment not found
```json
{
  "success": false,
  "message": "Appointment not found"
}
```

#### Response (403) - Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: this appointment does not belong to you"
}
```

---

### 19. Update Payment
**`PUT /api/doctors/payments/:paymentId`**

Headers: `Authorization: Bearer <accessToken>`
Content-Type: `application/json`

Updates a payment record. When status is set to `"paid"`, `paymentDate` is automatically set to the current timestamp.

#### URL Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| paymentId | string | Yes | The payment document ID |

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | No | `"paid"`, `"unpaid"`, `"pending"` |
| transactionId | string | No | Transaction reference ID |
| paymentProof | string | No | URL to payment proof |

#### Response (200)
```json
{
  "success": true,
  "message": "Payment updated successfully",
  "data": {
    "id": "payment_123",
    "status": "paid",
    "updatedAt": "2025-01-20T14:00:00.000Z"
  }
}
```

#### Response (404) - Payment not found
```json
{
  "success": false,
  "message": "Payment not found"
}
```

#### Response (403) - Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: this payment does not belong to you"
}
```

#### React Native Example
```javascript
// Mark payment as paid
const response = await fetch("http://YOUR_IP:3000/api/doctors/payments/payment_123", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${doctorToken}`,
  },
  body: JSON.stringify({
    status: "paid",
    transactionId: "TXN789012",
  }),
});
```

---

### 20. Delete Payment
**`DELETE /api/doctors/payments/:paymentId`**

Headers: `Authorization: Bearer <accessToken>`

Deletes a payment record. Only the doctor who owns the associated appointment can delete.

#### URL Parameters
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| paymentId | string | Yes | The payment document ID |

#### Response (200)
```json
{
  "success": true,
  "message": "Payment deleted successfully",
  "data": {
    "id": "payment_123"
  }
}
```

#### Response (404) - Payment not found
```json
{
  "success": false,
  "message": "Payment not found"
}
```

#### Response (403) - Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: this payment does not belong to you"
}
```

---

## Firestore Collections Summary

| Collection | Purpose |
|------------|---------|
| `users` | User profiles (patients, doctors, admins) |
| `sessions` | Authentication sessions (token → userId mapping) |
| `appointments` | Doctor-created appointment slots |
| `bookings` | Patient bookings of appointments |
| `payments` | Payment records for appointments |

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error details (if applicable)"
}
```

### Common HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Quick Start Checklist

1. **Signup** a doctor account → `POST /api/auth/signup`
2. **Login** to get `accessToken` → `POST /api/auth/login`
3. **Complete bio** (optional) → `PUT /api/doctors/completeBio`
4. **Create appointments** → `POST /api/doctors/appointments/create`
5. **View patients** → `GET /api/doctors/patients`
6. **Manage payments** → `GET/POST/PUT/DELETE /api/doctors/payments`
7. **Admin**: Accept/refuse doctors → `GET /api/admin/doctors/pending`, `PUT /api/admin/doctors/:doctorId/status`
