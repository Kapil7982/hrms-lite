# HRMS Lite - Human Resource Management System

A lightweight web-based HRMS application for managing employee records and tracking daily attendance.

## Features

### Core Features
- **Employee Management**: Add, view, and delete employee records
- **Attendance Tracking**: Mark and view daily attendance (Present/Absent)
- **Dashboard**: Overview with key HR metrics

### Bonus Features
- Filter attendance records by date range
- Display total present days per employee
- Department-wise employee distribution
- Monthly attendance summary

## Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for HTTP requests

### Backend
- Node.js with Express.js
- MySQL database
- express-validator for validation

## Project Structure

```
hrms-lite/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── App.jsx        # Main application component
│   └── package.json
│
├── backend/               # Express backend API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── models/        # Database configuration
│   │   ├── middleware/    # Validation middleware
│   │   └── app.js         # Express application
│   ├── server.js          # Server entry point
│   └── package.json
│
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hrms-lite
```

### 2. Set Up MySQL Database

Ensure MySQL is running and accessible with:
- Host: localhost
- User: root
- Password: root

The application will automatically create the database and tables on first run.

### 3. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will start on `http://localhost:5000`

### 4. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:3000`

### 5. Access the Application

Open `http://localhost:3000` in your browser.

## API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/:id` | Get employee by ID |
| POST | `/api/employees` | Create new employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get all attendance (supports filters) |
| GET | `/api/attendance/:employeeId` | Get attendance for employee |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance/stats/:employeeId` | Get attendance statistics |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |

## Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=hrms_lite
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Create a new Web Service on Render/Railway
3. Connect your repository
4. Set environment variables for production database
5. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Import project on Vercel/Netlify
3. Set `VITE_API_URL` to your deployed backend URL
4. Deploy

## Assumptions & Limitations

1. Single admin user - no authentication required
2. No leave management, payroll, or advanced HR features
3. Attendance can only be marked once per employee per day (updates if already exists)
4. Deleting an employee cascades to delete all their attendance records
5. Date format is YYYY-MM-DD

## Validation Rules

### Employee
- Employee ID: Required, alphanumeric (with dashes/underscores), unique
- Full Name: Required, 2-100 characters
- Email: Required, valid email format, unique
- Department: Required

### Attendance
- Employee ID: Required, must exist
- Date: Required, valid date format
- Status: Required, must be "Present" or "Absent"

## License

MIT
