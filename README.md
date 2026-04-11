# Smart Parking System

A full-stack Smart Parking System with separate Admin and User dashboards.

## Features

### Admin Dashboard
- Authentication (Login, Forgot Password, Reset Password)
- Dashboard Overview (Stats, Charts, Recent Activities)
- Parking Slot Management (CRUD, Categories, Status)
- Booking/Reservation Management
- User/Customer Management
- Vehicle Management
- Payments and Billing
- Reports and Analytics
- Notifications and Alerts
- Settings and Profile

### User Dashboard (UI/UX Starter)
- Parking Search
- Slot Availability View
- Booking Flow
- Payment Page
- Booking History
- Profile and Vehicles
- Notifications

## Tech Stack

### Frontend
- React.js with Vite
- React Router for routing
- Axios for API calls
- Context API for state management
- Tailwind CSS for styling
- Recharts for charts
- React Icons and Lucide for icons
- React Hook Form + Yup for forms

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

## Project Structure

```
Vedant-Smart-Parking/
  admin-dashboard/ # React (Vite) Admin dashboard (port 3001)
  user-dashboard/  # React (Vite) User dashboard (port 3000)
  shared-auth/     # Shared auth/api client helpers
  server/          # Node.js backend (port 5000)
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
  docs/            # Documentation
    admin-uiux.md
    user-uiux.md
    api-docs.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from `.env.example` (already present in this repo) and adjust values as needed.

4. Start the MongoDB service (if using local MongoDB)

5. Run the seed script to populate dummy data:
   ```bash
   node seed.js
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the dashboard you want to run:
   ```bash
   cd user-dashboard
   # or: cd admin-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` from `.env.example` (recommended) so `VITE_API_BASE_URL` is set and the dev console stays clean.

4. Start the development server:
   ```bash
   npm run dev
   ```

The dashboards run on:
- User: `http://localhost:3000`
- Admin: `http://localhost:3001`

### Default Admin Credentials

After running the seed script, you can login with:
- Email: admin@smartparking.com
- Password: admin123

## API Documentation

See `docs/api-docs.md` for complete API documentation.

## UI/UX Guidelines

- Admin Dashboard: `docs/admin-uiux.md`
- User Dashboard: `docs/user-uiux.md`

## Development

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Building for Production
```bash
# Backend
cd server
npm run build

# Frontend
cd client
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
