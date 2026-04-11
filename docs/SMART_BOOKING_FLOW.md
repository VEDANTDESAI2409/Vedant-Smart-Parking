# Smart Parking Booking Flow

## Folder Structure

```text
Vedant-Smart-Parking/
|-- user-dashboard/
|   |-- src/
|   |   |-- user/pages/
|   |   |   |-- Home.jsx
|   |   |   |-- Search.jsx
|   |   |   |-- Booking.jsx
|   |   |   |-- History.jsx
|   |   |   |-- Login.jsx
|   |   |   `-- Signup.jsx
|   |   |-- services/api.js
|   |   `-- context/AuthContext.jsx
|-- admin-dashboard/
|   `-- src/admin/pages/
|-- server/
|   |-- models/
|   |   |-- User.js
|   |   |-- Location.js
|   |   |-- ParkingSlot.js
|   |   |-- Booking.js
|   |   `-- Payment.js
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- locationController.js
|   |   |-- bookingController.js
|   |   `-- paymentController.js
|   |-- routes/
|   |   |-- auth.js
|   |   |-- locations.js
|   |   |-- bookings.js
|   |   `-- payments.js
|   `-- server.js
`-- shared-auth/
```

## Feature Flow

1. User opens `user-dashboard` and clicks `Book`.
2. Browser Geolocation API collects `lat/lng`.
3. Frontend reverse geocodes with Google Maps when `VITE_GOOGLE_MAPS_API_KEY` is set.
4. Frontend calls `GET /api/locations/nearby?lat=&lng=&radiusKm=`.
5. User selects a location and frontend calls `GET /api/locations/:id/slots?vehicleType=car|bike`.
6. User selects floor, vehicle type, slot, date, time, duration.
7. If not authenticated, modal asks user to login or signup.
8. Frontend calls `POST /api/bookings/create`.
9. Backend locks the slot for 5 minutes and creates a pending booking.
10. Frontend calls `POST /api/payments/initiate`.
11. UPI flow returns intent links. Card flow returns a simulated checkout session.
12. Frontend calls `POST /api/payments/verify`.
13. Backend marks payment complete or failed, updates booking, and releases or occupies the slot.
14. Receipt UI is returned and shown on the dashboard.

## APIs

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/locations/nearby`
- `GET /api/locations/:id/slots`
- `POST /api/bookings/create`
- `POST /api/payments/initiate`
- `POST /api/payments/verify`
- `GET /api/bookings/me`
- `GET /api/user/bookings`

## Data Model Notes

### `locations`
- `name`
- `lat`
- `lng`
- `cityId`
- `areaId`
- `pincodeId`
- `floors[]`
- `address`
- `radiusKm`

### `slots`
- `locationId`
- `slotNumber`
- `floor`
- `slotType`
- `status`
- `supportedVehicleTypes`
- `hourlyRate`
- `dailyRate`
- `lockExpiresAt`
- `lockedBy`
- `lockToken`

### `bookings`
- `user`
- `parkingSlot`
- `vehicle`
- `bookingReference`
- `status`
- `paymentStatus`
- `locationSnapshot`
- `paymentLock`
- `receiptNumber`
- `pricing`

### `payments`
- `booking`
- `user`
- `amount`
- `paymentMethod`
- `paymentGateway`
- `transactionId`
- `status`
- `verification`
- `receiptSnapshot`

## Integration Steps

### Google Maps

1. Enable Geocoding API in Google Cloud.
2. Add `VITE_GOOGLE_MAPS_API_KEY` to `user-dashboard/.env`.
3. Restart `user-dashboard`.

### UPI

1. Add `UPI_MERCHANT_ID` and `UPI_MERCHANT_NAME` in `server/.env`.
2. Backend generates:
   - `upi://pay`
   - `gpay://upi/pay`
   - `phonepe://pay`
   - `paytmmp://pay`

### Card Payments

Current flow uses a production-shaped simulation.

To connect Stripe or Razorpay:
1. Replace `simulation` in `paymentController.initiatePayment`.
2. Create gateway order / payment intent.
3. Save gateway response in `Payment.gatewayResponse`.
4. Use webhook or verification API to confirm payment.
5. Map verified status back into `POST /api/payments/verify`.

## Environment Variables

### Backend

```env
PORT=5000
CLIENT_URL=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
ALLOW_SERVER_WITHOUT_DB=true
ALLOW_DEV_ADMIN_LOGIN=true
DEV_ADMIN_EMAIL=admin@smartparking.com
DEV_ADMIN_PASSWORD=admin123
UPI_MERCHANT_ID=merchant@upi
UPI_MERCHANT_NAME=ParkingApp
CARD_PAYMENT_PROVIDER=simulation
```

### User Dashboard

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
VITE_ADMIN_APP_URL=http://localhost:3001/admin/login
VITE_AUTH_REDIRECT_PATH=/
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Deployment Guide

### Backend

1. Deploy Node server to Render, Railway, EC2, or similar.
2. Set environment variables from the backend block above.
3. Point MongoDB Atlas network rules to the deployment IP or VPC.
4. Configure webhook URLs if adding Stripe or Razorpay.

### Frontend

1. Deploy `user-dashboard` and `admin-dashboard` separately on Vercel, Netlify, or similar.
2. Set `VITE_API_BASE_URL` to the deployed backend.
3. Set `CLIENT_URL` on the backend to include both deployed frontend URLs.

## Edge Cases Handled

- Prevents booking unavailable slots.
- Prevents double booking by checking overlapping bookings.
- Locks slots for 5 minutes during payment.
- Releases the slot if payment fails or booking lock expires.
- Returns receipt-ready booking data after successful verification.

## Current Scope

Implemented now:
- End-to-end user booking flow in the dashboard
- Nearby location API
- Floor blueprint slot API
- Login/signup modal gate
- UPI deep links
- Card payment simulation
- Payment verification
- Receipt UI

Recommended next production steps:
- Add WebSocket live slot updates
- Add webhook endpoints for Stripe/Razorpay
- Add admin UI for editing floor blueprints visually
- Add cron job for expired lock cleanup
