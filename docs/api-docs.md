# API Documentation

## Overview

The Smart Parking System API provides RESTful endpoints for managing parking operations, user accounts, bookings, payments, and administrative functions. Built with Node.js and Express, it follows REST conventions and uses JWT for authentication.

## Base URL

```
http://localhost:5000/api
```

## Authentication

### JWT Token Authentication

All API requests (except login) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Login

**POST** `/auth/login`

Authenticate admin user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## Parking Slots API

### Get All Slots

**GET** `/slots`

Retrieve all parking slots with optional filtering.

**Query Parameters:**
- `status` - Filter by status (available, occupied, maintenance)
- `type` - Filter by type (standard, premium, disabled)
- `location` - Filter by location
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slotNumber": "A001",
      "location": "Floor 1, Section A",
      "type": "standard",
      "status": "available",
      "pricePerHour": 5.00,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### Get Slot by ID

**GET** `/slots/:id`

Retrieve a specific parking slot.

### Create Slot

**POST** `/slots`

Create a new parking slot.

**Request Body:**
```json
{
  "slotNumber": "A001",
  "location": "Floor 1, Section A",
  "type": "standard",
  "status": "available",
  "pricePerHour": 5.00
}
```

### Update Slot

**PUT** `/slots/:id`

Update an existing parking slot.

### Delete Slot

**DELETE** `/slots/:id`

Delete a parking slot.

## Bookings API

### Get All Bookings

**GET** `/bookings`

Retrieve all bookings with optional filtering.

**Query Parameters:**
- `status` - Filter by status (active, completed, cancelled)
- `userId` - Filter by user ID
- `slotId` - Filter by slot ID
- `startDate` - Filter by start date
- `endDate` - Filter by end date
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "slotId": 1,
      "vehicleId": 1,
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T12:00:00Z",
      "status": "active",
      "totalAmount": 10.00,
      "createdAt": "2024-01-15T09:00:00Z",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "slot": {
        "id": 1,
        "slotNumber": "A001",
        "location": "Floor 1, Section A"
      },
      "vehicle": {
        "id": 1,
        "licensePlate": "ABC-123",
        "model": "Toyota Camry"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 247,
    "pages": 25
  }
}
```

### Get Booking by ID

**GET** `/bookings/:id`

### Create Booking

**POST** `/bookings`

Create a new booking.

**Request Body:**
```json
{
  "userId": 1,
  "slotId": 1,
  "vehicleId": 1,
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T12:00:00Z"
}
```

### Update Booking

**PUT** `/bookings/:id`

### Cancel Booking

**PUT** `/bookings/:id/cancel`

Cancel an active booking.

## Users API

### Get All Users

**GET** `/users`

**Query Parameters:**
- `status` - Filter by status (active, inactive)
- `search` - Search by name or email
- `page` - Page number
- `limit` - Items per page

### Get User by ID

**GET** `/users/:id`

### Create User

**POST** `/users`

### Update User

**PUT** `/users/:id`

### Delete User

**DELETE** `/users/:id`

## Vehicles API

### Get All Vehicles

**GET** `/vehicles`

**Query Parameters:**
- `userId` - Filter by user ID
- `status` - Filter by status
- `search` - Search by license plate or model
- `page` - Page number
- `limit` - Items per page

### Get Vehicle by ID

**GET** `/vehicles/:id`

### Create Vehicle

**POST** `/vehicles`

**Request Body:**
```json
{
  "userId": 1,
  "licensePlate": "ABC-123",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "Blue"
}
```

### Update Vehicle

**PUT** `/vehicles/:id`

### Delete Vehicle

**DELETE** `/vehicles/:id`

## Payments API

### Get All Payments

**GET** `/payments`

**Query Parameters:**
- `bookingId` - Filter by booking ID
- `userId` - Filter by user ID
- `status` - Filter by status
- `startDate` - Filter by date range
- `endDate` - Filter by date range
- `page` - Page number
- `limit` - Items per page

### Get Payment by ID

**GET** `/payments/:id`

### Process Payment

**POST** `/payments/process`

**Request Body:**
```json
{
  "bookingId": 1,
  "amount": 10.00,
  "paymentMethod": "credit_card",
  "cardToken": "tok_123456789"
}
```

## Reports API

### Dashboard Statistics

**GET** `/reports/dashboard`

Get comprehensive dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSlots": 150,
    "occupiedSlots": 87,
    "totalBookings": 1247,
    "activeBookings": 23,
    "totalUsers": 456,
    "totalVehicles": 523,
    "totalRevenue": 45230.00,
    "monthlyRevenue": [
      { "month": "Jan", "revenue": 3200 },
      { "month": "Feb", "revenue": 4100 }
    ],
    "occupancyData": [
      { "time": "00:00", "occupied": 12 },
      { "time": "04:00", "occupied": 8 }
    ],
    "bookingStatusData": [
      { "name": "Active", "value": 23, "color": "#22c55e" },
      { "name": "Completed", "value": 1156, "color": "#3b82f6" },
      { "name": "Cancelled", "value": 68, "color": "#ef4444" }
    ]
  }
}
```

### Revenue Report

**GET** `/reports/revenue`

**Query Parameters:**
- `startDate` - Start date for report
- `endDate` - End date for report
- `groupBy` - Group by (day, week, month)

### Occupancy Report

**GET** `/reports/occupancy`

**Query Parameters:**
- `startDate` - Start date for report
- `endDate` - End date for report
- `slotId` - Specific slot ID (optional)

## Error Responses

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Rate Limiting

- API requests are limited to 1000 requests per hour per IP
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Data Formats

### Dates and Times
- All dates are in ISO 8601 format (UTC)
- Example: `2024-01-15T10:00:00Z`

### Currency
- All monetary values are in USD
- Represented as decimal numbers (e.g., 10.00)

### Pagination
- Page-based pagination
- Default limit: 10 items per page
- Maximum limit: 100 items per page

## Webhooks

The API supports webhooks for real-time notifications:

### Booking Events
- `booking.created`
- `booking.updated`
- `booking.cancelled`
- `booking.completed`

### Payment Events
- `payment.succeeded`
- `payment.failed`
- `payment.refunded`

## SDKs and Libraries

### JavaScript SDK
```javascript
import { ParkingAPI } from 'smart-parking-sdk';

const api = new ParkingAPI({
  baseURL: 'http://localhost:5000/api',
  token: 'your-jwt-token'
});

// Example usage
const slots = await api.slots.getAll();
const booking = await api.bookings.create(bookingData);
```

## Testing

### Test Environment
- Base URL: `http://localhost:5000/api`
- Test credentials provided in documentation
- Rate limits do not apply to test environment

### API Testing Tools
- Postman collection available
- Swagger/OpenAPI documentation
- cURL examples provided

## Support

For API support and questions:
- Email: api-support@smartparking.com
- Documentation: https://docs.smartparking.com
- Status Page: https://status.smartparking.com