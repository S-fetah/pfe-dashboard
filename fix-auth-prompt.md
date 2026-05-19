# Auth Bug: Login succeeds but "Invalid token" on subsequent API calls

## Environment
- Backend URL: `https://medi-care-vg2a.onrender.com`
- Frontend: React app running on the same Render domain

## The Problem

1. `POST /api/auth/login` with `{ email, password }` → **returns `accessToken` successfully** (64-char hex)
2. Any subsequent request with `Authorization: Bearer <accessToken>` → **returns `{ "message": "Invalid token" }`** (401)

## Expected Behavior

Per the API docs, the login flow should:
1. Verify credentials against Firebase Auth
2. Get `localId` (user ID) from Firebase
3. Generate `crypto.randomBytes(32).toString('hex')` as the token
4. **Store in Firestore `sessions` collection**: `{ userId, accessToken, createdAt, updatedAt }`
5. Return the `accessToken` to the client

Then the auth middleware should:
1. Extract token from `Authorization: Bearer <token>`
2. **Query Firestore `sessions` where `accessToken == <token>`**
3. If found → get `userId` → look up `users/{userId}` → attach user to `request.user`
4. If not found → return 401 "Invalid token"

## Suspected Root Cause

The session is **not being persisted to Firestore** during login. The token is generated and returned, but the `sessions` collection document is never written. When the middleware tries to query `sessions` by `accessToken`, nothing is found → "Invalid token".

## What to Check

### 1. Login route (`POST /api/auth/login`)
- Is the `sessions` collection being referenced correctly? (check for typos like `session` vs `sessions`)
- Is `db.collection('sessions').doc(sessionId).set({...})` actually being called?
- Is there a `try/catch` swallowing the Firestore write error?
- Is the `accessToken` value in the session doc exactly the same as what's returned? (no extra whitespace, newlines)

### 2. Auth middleware
- Does the middleware query use the EXACT token string? (not trimmed, not hashed)
- What does `db.collection('sessions').where('accessToken', '==', token).get()` return?

### 3. Firestore rules
- Does the Firestore security rules allow writes to the `sessions` collection?
- Does the Firebase service account have write permission?

## Test Script

```javascript
// Add this temporarily to the login route to debug
console.log('Generated token:', token)
console.log('Token length:', token.length)

const sessionRef = db.collection('sessions').doc()
await sessionRef.set({
  userId: localId,
  accessToken: token,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
})
console.log('Session created:', sessionRef.id)

// Verify by reading it back
const doc = await sessionRef.get()
console.log('Session exists:', doc.exists)
console.log('Stored token:', doc.data()?.accessToken)
```

## Fix

Ensure the session document is **actually written to Firestore** in the login route before returning the response. The most common fix is:

```javascript
// In the login route handler
const token = crypto.randomBytes(32).toString('hex')

// WRITE to Firestore first
await db.collection('sessions').add({
  userId: localId,        // from Firebase Auth
  accessToken: token,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
})

// THEN return the response
res.json({
  success: true,
  message: 'Login successful',
  accessToken: token,
  userId: localId
})
```
