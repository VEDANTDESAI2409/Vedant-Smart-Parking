# Smart Parking System - Frontend

A modern React-based frontend for the Smart Parking System, built with Vite, React Router, and Tailwind CSS.

## Features

### Admin Panel
- **Dashboard**: Real-time statistics, charts, and analytics
- **Parking Slots Management**: CRUD operations for parking slots
- **Bookings Management**: View and manage all parking bookings
- **User Management**: Manage system users
- **Vehicle Management**: Track registered vehicles
- **Payments**: Monitor payment transactions
- **Reports**: Generate and view detailed reports
- **Settings**: System configuration and preferences
- **Profile**: Admin profile management

### User Interface
- **Home**: Landing page with system overview
- **Search**: Find available parking spots
- **Booking**: Manage current and past bookings
- **History**: View booking history
- **Profile**: User profile and preferences

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Context API** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Chart library for data visualization
- **React Icons** - Icon library
- **React Hook Form** - Form handling
- **Yup** - Form validation
- **Lucide React** - Additional icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see backend documentation)

### Installation

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

4. Open your browser and visit `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
client/
├── public/
│   └── vite.svg
├── src/
│   ├── admin/
│   │   ├── pages/          # Admin page components
│   │   └── AdminLayout.jsx # Admin layout wrapper
│   ├── components/         # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Card.jsx
│   │   ├── Sidebar.jsx
│   │   └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx # Authentication context
│   ├── routes/
│   │   └── AdminRoutes.jsx # Admin routing logic
│   ├── services/
│   │   └── api.js         # API service functions
│   ├── shared/            # Shared components
│   ├── user/
│   │   └── pages/         # User page components
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## API Integration

The frontend communicates with the backend API through Axios. The API base URL is configured in `vite.config.js` to proxy requests to `http://localhost:5000`.

### Authentication

- Login endpoint: `POST /api/auth/login`
- JWT tokens are stored in localStorage
- Automatic token refresh and logout on token expiry

### Key API Endpoints

- `/api/slots` - Parking slots management
- `/api/bookings` - Booking operations
- `/api/users` - User management
- `/api/vehicles` - Vehicle management
- `/api/payments` - Payment processing
- `/api/reports` - Analytics and reports

## Features

### Dark Mode
- Toggle between light and dark themes
- Theme preference saved in localStorage

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Adaptive navigation

### Form Validation
- Client-side validation using Yup
- Real-time error feedback
- Accessible form controls

### Data Visualization
- Interactive charts using Recharts
- Real-time dashboard updates
- Customizable chart themes

## Development

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- Consistent naming conventions

### Component Structure
- Functional components with hooks
- Custom hooks for reusable logic
- Context API for global state

### State Management
- Context API for authentication
- Local component state for UI
- API calls for server state

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Serve the `dist` folder with any static server

3. Configure the backend API URL in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.