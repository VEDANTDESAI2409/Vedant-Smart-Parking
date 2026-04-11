# Smart Parking Booking Flow Code Guide

This document explains how the current Smart Parking booking flow works in this project, both on the frontend and backend.

## 1. Project Structure

This repo is currently split into these main parts:

- `user-dashboard/`
  User-facing React app.
- `admin-dashboard/`
  Admin-facing React app.
- `server/`
  Express + MongoDB backend.
- `shared-auth/`
  Shared auth and API client helpers used by the split frontends.

For the booking flow, the most important files are:

- `user-dashboard/src/user/pages/Search.jsx`
- `user-dashboard/src/services/api.js`
- `server/controllers/locationController.js`
- `server/controllers/bookingController.js`
- `server/controllers/paymentController.js`
- `server/models/Booking.js`
- `server/models/Payment.js`
- `server/models/ParkingSlot.js`
- `server/models/Location.js`

## 2. End-to-End Booking Flow

The actual user booking flow works in this order:

1. User opens the search/booking page.
2. User allows location access.
3. Frontend gets latitude/longitude.
4. Frontend calls backend to fetch nearby parking locations.
5. User selects one location.
6. Frontend calls backend for that location's slot blueprint.
7. User selects floor, slot, vehicle type, date, time, duration.
8. If the user is not logged in, login/signup modal opens.
9. Frontend creates a booking lock using the selected slot.
10. Backend locks the slot for 5 minutes.
11. Frontend starts payment.
12. After payment verification, backend marks booking as paid/confirmed.
13. Frontend shows receipt.
14. User can download the receipt as PDF.

## 3. Frontend Flow

File:

- `user-dashboard/src/user/pages/Search.jsx`

This file is the main booking page.

### 3.1 State Used in Search.jsx

The page stores the complete booking progress in React state:

- `geo`
  Detected location info like city, area, pincode.
- `locations`
  Nearby parking locations returned by backend.
- `selectedLocation`
  The parking location the user chooses.
- `floors`
  Blueprint floor data returned by backend.
- `selectedFloor`
  Current floor tab.
- `vehicleType`
  `car` or `bike`.
- `selectedSlot`
  The slot selected by the user.
- `bookingForm`
  Date, time, duration, payment method, UPI app.
- `userForm`
  Name, phone, email.
- `activeBooking`
  Locked booking created before payment.
- `paymentSession`
  Payment metadata returned by backend.
- `receipt`
  Final receipt payload shown after success.

### 3.2 Location Permission

When the user clicks `Enable Location Access`, this function runs:

```js
const loadNearby = async () => {
  const position = await new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    })
  );
  ...
  const response = await locationsAPI.getNearby({ lat, lng, radiusKm: 10 });
};
```

What it does:

- asks the browser for live coordinates
- optionally uses test coordinates from `.env`
- reverse geocodes city/area/pincode if Google Maps key exists
- calls backend `/api/locations/nearby`
- fills the nearby locations list

### 3.3 Loading the Blueprint

Whenever `selectedLocation` or `vehicleType` changes, this effect runs:

```js
useEffect(() => {
  if (!selectedLocation) return;
  (async () => {
    const response = await locationsAPI.getBlueprint(selectedLocation.id, { vehicleType });
    const nextFloors = response.data.data.floors || [];
    setFloors(nextFloors);
    setSelectedFloor(nextFloors[0]?.floorNumber || 1);
    setSelectedSlot(null);
  })();
}, [selectedLocation, vehicleType]);
```

This means:

- selected location decides which parking site to show
- selected vehicle type filters slot compatibility
- backend returns grouped floors and slots

### 3.4 Proceed to Book

When the user clicks `Proceed to Book`, this function runs:

```js
const startFlow = async () => {
  if (!selectedLocation || !selectedSlot || !bookingForm.date || !bookingForm.time) {
    return setError('Select location, slot, date, and time');
  }
  if (!userForm.name || !userForm.phone || !userForm.email) {
    return setError('Fill your details first');
  }
  if (!isAuthenticated) return setAuthModal(true);
  await createBooking();
};
```

This validates:

- location selected
- slot selected
- date/time selected
- user details filled
- user authenticated

If not authenticated, login/signup modal opens first.

### 3.5 Booking Creation

Actual booking lock is created by:

```js
const bookingResponse = await bookingsAPI.createSmart({
  locationId: selectedLocation.id,
  parkingSlotId: selectedSlot.id,
  floor: selectedFloor,
  vehicleType,
  date: bookingForm.date,
  time: bookingForm.time,
  durationMinutes: Number(bookingForm.durationMinutes),
  city: selectedLocation.city || geo?.city,
  area: selectedLocation.area || geo?.area,
  pincode: selectedLocation.pincode || geo?.pincode,
});
```

This calls:

- `POST /api/bookings/create`

After booking lock is created, frontend immediately calls:

```js
const paymentResponse = await paymentsAPI.initiate({
  bookingId: booking._id,
  paymentMethod: bookingForm.paymentMethod,
  upiApp: bookingForm.upiApp,
});
```

This starts the payment session.

### 3.6 Payment UI

The payment UI now behaves like an action panel:

- UPI button selection stays in the page
- click on app button calls:

```js
const launchPaymentApp = (app) => {
  window.location.href = paymentSession.upiLinks[app];
};
```

- card currently uses simulated verification flow
- user returns and taps:
  - `Success`
  - `Pending`
  - `Failed`

### 3.7 Payment Verification

Frontend verifies payment with:

```js
const response = await paymentsAPI.verify({
  paymentId: paymentSession.paymentId,
  bookingId: activeBooking._id,
  status,
  transactionId: status === 'success' ? `TXN_${Date.now()}` : undefined,
});
```

If success:

- `receipt` state is set
- receipt card renders on the page

### 3.8 Receipt PDF Download

In `Search.jsx`, receipt download is handled fully on the client.

The code:

1. builds a simple PDF text stream
2. creates a browser `Blob`
3. creates a temporary download link
4. downloads the file

Main function:

```js
const downloadReceiptPdf = () => {
  const blob = buildReceiptPdfBlob(receipt);
  const url = URL.createObjectURL(blob);
  ...
  link.click();
};
```

## 4. API Layer

File:

- `user-dashboard/src/services/api.js`

This file is the frontend API wrapper.

Important methods used in booking flow:

```js
locationsAPI.getNearby(params)
locationsAPI.getBlueprint(locationId, params)
bookingsAPI.createSmart(data)
paymentsAPI.initiate(data)
paymentsAPI.verify(data)
```

These map to backend endpoints:

- `GET /api/locations/nearby`
- `GET /api/locations/:id/slots`
- `POST /api/bookings/create`
- `POST /api/payments/initiate`
- `POST /api/payments/verify`

## 5. Backend Nearby Location Logic

File:

- `server/controllers/locationController.js`

### 5.1 Nearby Search

The backend route:

- `GET /api/locations/nearby`

does this:

1. reads `lat`, `lng`, `radiusKm`
2. fetches active locations from DB
3. calculates distance using Haversine formula
4. keeps only locations within radius
5. counts available slots for each location

Distance function:

```js
const calculateDistanceKm = (lat1, lng1, lat2, lng2) => { ... }
```

### 5.2 Legacy + New Slot Support

This project currently supports both:

- new slots linked by `locationId`
- old slots stored with flat text fields like `city`, `area`, `location`, `pincode`

That compatibility is handled through:

```js
const buildLegacySlotQuery = (location, vehicleType = null) => { ... }
```

This is why old admin-created records can still work.

### 5.3 Blueprint API

The blueprint route:

- `GET /api/locations/:id/slots`

does this:

1. loads the selected location
2. loads matching slots
3. releases expired locks if needed
4. groups slots by floor
5. returns a floor-wise slot blueprint payload

Returned slot payload includes:

- `id`
- `slotNumber`
- `slotType`
- `status`
- `vehicleType`
- `supportedVehicleTypes`
- `price`
- `hourlyRate`
- `dailyRate`
- `isBookable`
- `isLocked`
- `isAccessible`

## 6. Backend Booking Creation Logic

File:

- `server/controllers/bookingController.js`

### 6.1 Main Route

The smart booking route is:

- `POST /api/bookings/create`

Handled by:

```js
exports.createSmartBooking = async (req, res) => { ... }
```

### 6.2 What createSmartBooking Validates

It checks:

- `locationId` exists
- `parkingSlotId` exists
- date/time is valid
- booking start time is in future
- location exists
- slot belongs to selected location
- slot supports selected vehicle type
- slot is not reserved
- slot is not occupied
- slot is not locked by another user
- slot has no conflicting booking
- slot has valid pricing

### 6.3 How Slot Matching Works

This helper is very important:

```js
const slotBelongsToLocation = (slot, location) => { ... }
```

It returns true if:

- `slot.locationId === location._id`

or for older records if all these match:

- `slot.location === location.name`
- `slot.city === location.cityId.name`
- `slot.area === location.areaId.name`
- `slot.pincode === location.pincodeId.pincode`

This was added because some older admin-created slots were not linked by `locationId`.

### 6.4 How Vehicle Matching Works

Vehicle compatibility is handled by:

```js
const slotSupportsVehicle = (slot, vehicleType) => { ... }
```

It supports:

- modern schema: `supportedVehicleTypes`
- legacy schema: `vehicleType`

### 6.5 5-Minute Lock Window

Booking uses:

```js
const LOCK_WINDOW_MS = 5 * 60 * 1000;
```

When booking starts:

- slot is marked `locked`
- `lockToken` is generated
- `lockExpiresAt` is saved

This prevents double booking while payment is in progress.

### 6.6 Price Calculation

Inside `createSmartBooking`:

```js
const subtotal =
  duration >= 24
    ? Math.ceil(duration / 24) * effectiveSlot.dailyRate
    : duration * effectiveSlot.hourlyRate;

const taxAmount = Number((subtotal * 0.18).toFixed(2));
const finalAmount = Number((subtotal + taxAmount).toFixed(2));
```

So the current pricing logic is:

- hourly booking uses `hourlyRate`
- long booking uses `dailyRate`
- tax is 18%

### 6.7 Booking Snapshot

The booking stores a `locationSnapshot`.

This is very useful because booking history and receipts still work even if admin later changes the original location or slot labels.

Stored snapshot fields include:

- location name
- city
- area
- pincode
- floor
- slot number
- slot type
- vehicle type

## 7. Receipt Payload

Receipt data is shaped by:

```js
const buildReceiptPayload = (booking, payment = null) => ({ ... })
```

Now the visible codes are shortened using:

```js
const toShortDisplayCode = (value, prefix) => { ... }
```

So the UI shows:

- `BK1234`
- `RC5678`

instead of long raw backend references.

Important:

- backend still stores full original references
- UI only displays short codes

## 8. Authentication in the Booking Flow

`Search.jsx` uses:

```js
const { user, isAuthenticated, login, register } = useAuth();
```

If the user is not logged in:

- auth modal opens
- user can login or signup
- on success, booking creation continues automatically

This is handled by:

```js
const submitAuth = async (event) => { ... }
```

## 9. Payment Flow

The booking flow currently supports:

- UPI deep-link style flow
- card simulation flow

### 9.1 Payment Initiate

Frontend calls:

- `POST /api/payments/initiate`

Backend returns a `paymentSession` that includes:

- payment id
- expiry time
- UPI links for:
  - generic UPI
  - Google Pay
  - PhonePe
  - Paytm

### 9.2 Payment Verify

Frontend then calls:

- `POST /api/payments/verify`

with:

- `paymentId`
- `bookingId`
- `status`
- optional `transactionId`

If successful:

- payment becomes paid
- booking status progresses
- receipt payload is returned

## 10. Why Some Earlier Bugs Happened

These were the important real issues fixed in the current codebase:

### 10.1 Location visible but slots missing

Cause:

- slots were created in old schema without `locationId`

Fix:

- backend now supports legacy matching by text fields

### 10.2 Slot visible but booking failed

Cause:

- booking creation originally expected strict `locationId` matching

Fix:

- `slotBelongsToLocation()` added for both new and old records

### 10.3 Vehicle mismatch confusion

Cause:

- blueprint and booking were not aligned well for legacy records

Fix:

- vehicle filtering now checks both `supportedVehicleTypes` and legacy `vehicleType`

### 10.4 500 error during booking/payment

Cause:

- older/legacy slot records missing proper pricing/status fields
- reference generation in schema happened too late

Fix:

- fallback pricing/status handling added
- booking/payment reference generation moved to validation stage

## 11. Admin Dependency

For user booking flow to work, admin must create:

1. City
2. Pincode
3. Area
4. Location with valid coordinates
5. Parking slots for that location

If coordinates are wrong, nearby search fails even if data exists.

Example for Surat/Piplod test:

- lat: `21.1517`
- lng: `72.7708`

## 12. Environment Variables Used

### User Dashboard

Important values in `user-dashboard/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:5000
VITE_GOOGLE_MAPS_API_KEY=...
VITE_TEST_LOCATION_ENABLED=true
VITE_TEST_LOCATION_LAT=21.1517
VITE_TEST_LOCATION_LNG=72.7708
VITE_TEST_LOCATION_CITY=Surat
VITE_TEST_LOCATION_AREA=Piplod
VITE_TEST_LOCATION_PINCODE=395007
```

### Server

Important values in `server/.env`:

```env
PORT=5000
MONGODB_URI=...
JWT_SECRET=...
CLIENT_URL=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001
ALLOW_SERVER_WITHOUT_DB=true
ALLOW_DEV_ADMIN_LOGIN=true
```

## 13. Quick Debugging Guide

If nearby locations do not show:

- check location coordinates
- check backend is connected to DB
- check location is active

If blueprint does not show slots:

- check slots exist for that location
- check vehicle type matches
- check slot is not reserved/occupied

If booking fails:

- check slot pricing exists
- check selected time is future time
- check slot is not locked by another user

If payment/receipt fails:

- check `/api/payments/initiate`
- check `/api/payments/verify`
- check booking and payment models

## 14. Suggested Future Improvements

If you want to improve this project further, these are the best next steps:

- replace simulated card flow with Razorpay or Stripe
- add webhook-based payment verification
- add live WebSocket slot updates
- add QR receipt and booking code
- generate richer PDF using a real PDF library
- add admin blueprint editor
- add cron job to auto-release expired slot locks

## 15. Summary

In simple words, the current code works like this:

- frontend gets user location
- backend finds nearby locations
- frontend loads slot blueprint
- user selects slot + date/time + payment type
- backend creates a temporary booking and locks the slot
- payment is initiated
- payment is verified
- backend returns receipt data
- frontend shows receipt and downloads a PDF

This is the core production-style booking flow currently implemented in the project.
