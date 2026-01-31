const express = require('express');
const router = express.Router();
const { getPool } = require('../models/database');

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const pool = getPool();

    // Get total employees
    const [employeeCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM employees'
    );

    // Get department breakdown
    const [departments] = await pool.execute(
      'SELECT department, COUNT(*) as count FROM employees GROUP BY department'
    );

    // Get today's attendance summary
    const today = new Date().toISOString().split('T')[0];
    const [todayAttendance] = await pool.execute(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent
      FROM attendance
      WHERE date = ?
    `, [today]);

    // Get recent attendance records
    const [recentAttendance] = await pool.execute(`
      SELECT a.*, e.full_name, e.department
      FROM attendance a
      JOIN employees e ON a.employee_id = e.employee_id
      ORDER BY a.date DESC, a.created_at DESC
      LIMIT 10
    `);

    // Get attendance overview for the current month
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const monthStart = firstDayOfMonth.toISOString().split('T')[0];

    const [monthlyStats] = await pool.execute(`
      SELECT
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_count
      FROM attendance
      WHERE date >= ?
    `, [monthStart]);

    res.json({
      employees: {
        total: employeeCount[0].count,
        by_department: departments
      },
      today: {
        date: today,
        total_marked: parseInt(todayAttendance[0].total) || 0,
        present: parseInt(todayAttendance[0].present) || 0,
        absent: parseInt(todayAttendance[0].absent) || 0,
        not_marked: employeeCount[0].count - (parseInt(todayAttendance[0].total) || 0)
      },
      monthly: {
        total_records: parseInt(monthlyStats[0].total_records) || 0,
        present_count: parseInt(monthlyStats[0].present_count) || 0,
        absent_count: parseInt(monthlyStats[0].absent_count) || 0
      },
      recent_attendance: recentAttendance
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;
