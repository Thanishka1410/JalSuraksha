const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[0-9\s\-]{10,15}$/).withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['super_admin', 'gp_admin', 'vWSC_member', 'citizen', 'district_officer'])
    .withMessage('Invalid role'),
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

const createPumpValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Pump name is required'),
  body('pumpId')
    .trim()
    .notEmpty().withMessage('Pump ID is required'),
  body('village')
    .notEmpty().withMessage('Village is required')
    .isMongoId().withMessage('Invalid village ID'),
  body('type')
    .notEmpty().withMessage('Pump type is required')
    .isIn(['submersible', 'centrifugal', 'booster', 'jet']).withMessage('Invalid pump type'),
  body('capacity')
    .optional()
    .isNumeric().withMessage('Capacity must be a number')
    .isFloat({ min: 0 }).withMessage('Capacity cannot be negative'),
  validate
];

const createComplaintValidation = [
  body('village')
    .notEmpty().withMessage('Village is required')
    .isMongoId().withMessage('Invalid village ID'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['leakage', 'no_water', 'dirty_water', 'low_pressure', 'other']).withMessage('Invalid category'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  validate
];

const createWaterQualityValidation = [
  body('village')
    .notEmpty().withMessage('Village is required')
    .isMongoId().withMessage('Invalid village ID'),
  body('parameters.pH')
    .optional()
    .isNumeric().withMessage('pH must be a number'),
  body('parameters.TDS')
    .optional()
    .isNumeric().withMessage('TDS must be a number'),
  body('parameters.turbidity')
    .optional()
    .isNumeric().withMessage('Turbidity must be a number'),
  body('parameters.chlorine')
    .optional()
    .isNumeric().withMessage('Chlorine must be a number'),
  body('parameters.fluoride')
    .optional()
    .isNumeric().withMessage('Fluoride must be a number'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  createPumpValidation,
  createComplaintValidation,
  createWaterQualityValidation
};
