const { getPool } = require('../models/database');

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const pool = getPool();
    const [employees] = await pool.execute(
      'SELECT * FROM employees ORDER BY created_at DESC'
    );
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const pool = getPool();
    const [employees] = await pool.execute(
      'SELECT * FROM employees WHERE employee_id = ?',
      [req.params.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employees[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const { employee_id, full_name, email, department } = req.body;
    const pool = getPool();

    // Check for duplicate employee_id
    const [existingById] = await pool.execute(
      'SELECT employee_id FROM employees WHERE employee_id = ?',
      [employee_id]
    );

    if (existingById.length > 0) {
      return res.status(409).json({
        error: 'Duplicate employee ID',
        message: `An employee with ID "${employee_id}" already exists`
      });
    }

    // Check for duplicate email
    const [existingByEmail] = await pool.execute(
      'SELECT email FROM employees WHERE email = ?',
      [email]
    );

    if (existingByEmail.length > 0) {
      return res.status(409).json({
        error: 'Duplicate email',
        message: `An employee with email "${email}" already exists`
      });
    }

    // Insert new employee
    await pool.execute(
      'INSERT INTO employees (employee_id, full_name, email, department) VALUES (?, ?, ?, ?)',
      [employee_id, full_name, email, department]
    );

    // Fetch the created employee
    const [newEmployee] = await pool.execute(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employee_id]
    );

    res.status(201).json({
      message: 'Employee created successfully',
      employee: newEmployee[0]
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const pool = getPool();

    // Check if employee exists
    const [existing] = await pool.execute(
      'SELECT employee_id FROM employees WHERE employee_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete employee (attendance records will be deleted via CASCADE)
    await pool.execute(
      'DELETE FROM employees WHERE employee_id = ?',
      [req.params.id]
    );

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  deleteEmployee
};
