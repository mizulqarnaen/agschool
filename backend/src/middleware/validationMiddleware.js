import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

export const validateIncome = [
  body('transaction_date').isISO8601().withMessage('Valid transaction date is required'),
  body('category').notEmpty().withMessage('Income category is required'),
  body('source').notEmpty().withMessage('Income source is required'),
  body('description').isLength({ min: 3, max: 255 }).withMessage('Description must be 3-255 characters'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number greater than 0'),
  handleValidationErrors
];

export const validateExpense = [
  body('transaction_date').isISO8601().withMessage('Valid transaction date is required'),
  body('category').notEmpty().withMessage('Expense category is required'),
  body('description').isLength({ min: 3, max: 255 }).withMessage('Description must be 3-255 characters'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number greater than 0'),
  handleValidationErrors
];

export const validatePayment = [
  body('member_id').isInt({ gt: 0 }).withMessage('Valid internal member is required'),
  body('payment_category').notEmpty().withMessage('Payment category is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number greater than 0'),
  body('status').isIn(['Pending', 'Processing', 'Paid', 'Cancelled']).withMessage('Invalid payment status'),
  handleValidationErrors
];
