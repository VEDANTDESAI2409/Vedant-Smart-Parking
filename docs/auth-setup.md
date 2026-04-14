# Park n Go Authentication Setup

This project now includes a production-oriented auth flow for the user dashboard:

- Twilio Verify SMS OTP for phone signup/login
- Firebase Google sign-in
- Firebase email/password login with verification enforcement
- Firestore user sync
- App JWT issuance from the Express backend

## Environment Variables

Backend: copy [server/.env.example](/c:/Users/virti/OneDrive/Desktop/park-n-go/Vedant-Smart-Parking/server/.env.example) to `server/.env`

Frontend: copy [user-dashboard/.env.example](/c:/Users/virti/OneDrive/Desktop/park-n-go/Vedant-Smart-Parking/user-dashboard/.env.example) to `user-dashboard/.env`

Leave your actual secrets out of source control.

Backend values:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=

FIREBASE_PROJECT_ID=
FIREBASE_SERVICE_ACCOUNT_JSON=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

Frontend values:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Twilio Setup

1. In Twilio Console, create or open a Verify Service.
2. Enable SMS as a channel.
3. Copy the Verify Service SID into `TWILIO_VERIFY_SERVICE_SID`.
4. Use the Twilio Account SID and Auth Token only on the backend.

## Firebase Setup

1. In Firebase Console, enable Authentication.
2. Turn on `Google` and `Email/Password` providers.
3. Enable Firestore in the same Firebase project.
4. Create a service account key for the backend, then either:
   - paste the JSON into `FIREBASE_SERVICE_ACCOUNT_JSON`, or
   - map the values into `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, and `FIREBASE_ADMIN_PRIVATE_KEY`
5. Copy the web app config values into the `VITE_FIREBASE_*` frontend env vars.

## User Flows

Phone:
- The frontend calls `/api/auth/send-otp`
- The backend sends OTP using Twilio Verify
- The frontend submits the code to `/api/auth/verify-otp`
- The backend verifies the code, syncs the user into Mongo + Firestore, and returns a JWT

Google:
- The frontend signs in with Firebase Google provider
- The frontend sends the Firebase ID token to `/api/auth/firebase/session`
- The backend verifies the Firebase token, syncs the user into Mongo + Firestore, and returns a JWT

Email:
- Signup happens in Firebase Auth from the frontend
- A verification email is sent through Firebase
- Login is blocked until `emailVerified === true`
- After verified login, the frontend sends the ID token to `/api/auth/firebase/session`

## API Contract

`POST /api/auth/send-otp`

```json
{
  "phone": "+14155552671"
}
```

`POST /api/auth/verify-otp`

```json
{
  "phone": "+14155552671",
  "code": "123456",
  "name": "Driver Name",
  "email": "driver@example.com"
}
```

`POST /api/auth/firebase/session`

```json
{
  "idToken": "firebase-id-token"
}
```

## Notes

- Phone numbers are validated in E.164 format.
- OTP resend requests are rate-limited in memory per phone/IP pair.
- Twilio secrets are never sent to the browser.
- The backend-issued JWT is what the rest of Park n Go should use for protected API access.
