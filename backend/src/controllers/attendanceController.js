const { getPool } = require('../models/database');

// Get all attendance records (with optional filters)
const getAllAttendance = async (req, res) => {
  try {
    const pool = getPool();
    const { date, from, to, employee_id } = req.query;

    let query = `
      SELECT a.*, e.full_name, e.department
      FROM attendance a
      JOIN employees e ON a.employee_id = e.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }

    if (from) {
      query += ' AND a.date >= ?';
      params.push(from);
    }

    if (to) {
      query += ' AND a.date <= ?';
      params.push(to);
    }

    if (employee_id) {
      query += ' AND a.employee_id = ?';
      params.push(employee_id);
    }

    query += ' ORDER BY a.date DESC, e.full_name ASC';

    const [attendance] = await pool.execute(query, params);
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
};

// Get attendance for specific employee
const getAttendanceByEmployee = async (req, res) => {
  try {
    const pool = getPool();
    const { employeeId } = req.params;
    const { from, to } = req.query;

    // Check if employee exists
    const [employee] = await pool.execute(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employeeId]
    );

    if (employee.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    let query = 'SELECT * FROM attendance WHERE employee_id = ?';
    const params = [employeeId];

    if (from) {
      query += ' AND date >= ?';
      params.push(from);
    }

    if (to) {
      query += ' AND date <= ?';
      params.push(to);
    }

    query += ' ORDER BY date DESC';

    const [attendance] = await pool.execute(query, params);

    res.json({
      employee: employee[0],
      attendance
    });
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
};

// Mark attendance
const markAttendance = async (req, res) => {
  try {
    const { employee_id, date, status } = req.body;
    const pool = getPool();

    // Check if employee exists
    const [employee] = await pool.execute(
      'SELECT employee_id FROM employees WHERE employee_id = ?',
      [employee_id]
    );

    if (employee.length === 0) {
      return res.status(404).json({
        error: 'Employee not found',
        message: `No employee found with ID "${employee_id}"`
      });
    }

    // Check for existing attendance on the same date
    const [existing] = await pool.execute(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, date]
    );

    if (existing.length > 0) {
      // Update existing attendance
      await pool.execute(
        'UPDATE attendance SET status = ? WHERE employee_id = ? AND date = ?',
        [status, employee_id, date]
      );

      const [updated] = await pool.execute(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
        [employee_id, date]
      );

      return res.json({
        message: 'Attendance updated successfully',
        attendance: updated[0]
      });
    }

    // Insert new attendance record
    await pool.execute(
      'INSERT INTO attendance (employee_id, date, status) VALUES (?, ?, ?)',
      [employee_id, date, status]
    );

    const [newAttendance] = await pool.execute(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, date]
    );

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: newAttendance[0]
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

// Get attendance stats for an employee
const getAttendanceStats = async (req, res) => {
  try {
    const pool = getPool();
    const { employeeId } = req.params;

    // Check if employee exists
    const [employee] = await pool.execute(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employeeId]
    );

    if (employee.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get attendance statistics
    const [stats] = await pool.execute(`
      SELECT
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent_days
      FROM attendance
      WHERE employee_id = ?
    `, [employeeId]);

    const result = stats[0];

    res.json({
      employee: employee[0],
      stats: {
        total_days: result.total_days || 0,
        present_days: parseInt(result.present_days) || 0,
        absent_days: parseInt(result.absent_days) || 0,
        attendance_percentage: result.total_days > 0
          ? Math.round((result.present_days / result.total_days) * 100)
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ error: 'Failed to fetch attendance statistics' });
  }
};

module.exports = {
  getAllAttendance,
  getAttendanceByEmployee,
  markAttendance,
  getAttendanceStats
};
