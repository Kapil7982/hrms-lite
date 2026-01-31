const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { employeeValidators } = require('../middleware/validators');

// GET /api/employees - Get all employees
router.get('/', getAllEmployees);

// GET /api/employees/:id - Get employee by ID
router.get('/:id', employeeValidators.getById, getEmployeeById);

// POST /api/employees - Create new employee
router.post('/', employeeValidators.create, createEmployee);

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', employeeValidators.getById, deleteEmployee);

module.exports = router;
