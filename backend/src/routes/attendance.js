const express = require('express');
const router = express.Router();
const {
  getAllAttendance,
  getAttendanceByEmployee,
  markAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');
const { attendanceValidators } = require('../middleware/validators');

// GET /api/attendance - Get all attendance records (with optional filters)
router.get('/', attendanceValidators.query, getAllAttendance);

// GET /api/attendance/stats/:employeeId - Get attendance stats for employee
router.get('/stats/:employeeId', attendanceValidators.getByEmployee, getAttendanceStats);

// GET /api/attendance/:employeeId - Get attendance for specific employee
router.get('/:employeeId', attendanceValidators.getByEmployee, getAttendanceByEmployee);

// POST /api/attendance - Mark attendance
router.post('/', attendanceValidators.create, markAttendance);

module.exports = router;
