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
smart-parking-system/
  client/          # React frontend
    src/
      admin/       # Admin dashboard code
      user/        # User dashboard UI/UX
      shared/      # Shared components
      routes/
      services/
      context/
      components/
      pages/
      assets/
      utils/
  server/          # Node.js backend
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
   cd smart-parking-system/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/smart-parking
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:3000
   ```

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

1. Navigate to the client directory:
   ```bash
   cd smart-parking-system/client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be running on `http://localhost:5173`

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