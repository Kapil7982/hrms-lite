const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Employee validators
const employeeValidators = {
  create: [
    body('employee_id')
      .trim()
      .notEmpty().withMessage('Employee ID is required')
      .matches(/^[a-zA-Z0-9-_]+$/).withMessage('Employee ID must be alphanumeric (dashes and underscores allowed)')
      .isLength({ max: 50 }).withMessage('Employee ID must be at most 50 characters'),
    body('full_name')
      .trim()
      .notEmpty().withMessage('Full name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('department')
      .trim()
      .notEmpty().withMessage('Department is required')
      .isLength({ max: 100 }).withMessage('Department must be at most 100 characters'),
    validate
  ],
  getById: [
    param('id')
      .notEmpty().withMessage('Employee ID is required'),
    validate
  ]
};

// Attendance validators
const attendanceValidators = {
  create: [
    body('employee_id')
      .trim()
      .notEmpty().withMessage('Employee ID is required'),
    body('date')
      .notEmpty().withMessage('Date is required')
      .isDate().withMessage('Invalid date format (use YYYY-MM-DD)')
      .custom((value) => {
        const inputDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (inputDate > today) {
          throw new Error('Cannot mark attendance for future dates');
        }
        return true;
      }),
    body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['Present', 'Absent']).withMessage('Status must be either Present or Absent'),
    validate
  ],
  getByEmployee: [
    param('employeeId')
      .notEmpty().withMessage('Employee ID is required'),
    validate
  ],
  query: [
    query('date')
      .optional()
      .isDate().withMessage('Invalid date format (use YYYY-MM-DD)'),
    query('from')
      .optional()
      .isDate().withMessage('Invalid from date format (use YYYY-MM-DD)'),
    query('to')
      .optional()
      .isDate().withMessage('Invalid to date format (use YYYY-MM-DD)'),
    validate
  ]
};

module.exports = { employeeValidators, attendanceValidators };
