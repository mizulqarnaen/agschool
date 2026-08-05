import express from 'express';
import {
  getDashboardSummary,
  getIncomes, createIncome, updateIncome, deleteIncome,
  getExpenses, createExpense, updateExpense, deleteExpense,
  getPayments, createPayment, updatePayment, deletePayment,
  getMembers, createMember, updateMember, deleteMember,
  getMemberCategories, updateMemberCategories,
  getPaymentCategories, updatePaymentCategories,
  getIncomeCategories, updateIncomeCategories,
  getExpenseCategories, updateExpenseCategories
} from '../controllers/financeController.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateIncome, validateExpense, validatePayment } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Routes accessible by Administrator, Finance, and Secretary
const internalTeam = authorizeRoles('administrator', 'finance', 'secretary');
const financeOnly = authorizeRoles('administrator', 'finance');

// Dashboard summary accessible by all internal roles
router.get('/dashboard', internalTeam, getDashboardSummary);

// Members directory accessible by all internal roles
router.get('/members/categories', internalTeam, getMemberCategories);
router.post('/members/categories', internalTeam, updateMemberCategories);
router.get('/members', internalTeam, getMembers);
router.post('/members', internalTeam, createMember);
router.put('/members/:id', internalTeam, updateMember);
router.delete('/members/:id', internalTeam, deleteMember);

// Incomes (Finance & Administrator only)
router.get('/incomes/categories', financeOnly, getIncomeCategories);
router.post('/incomes/categories', financeOnly, updateIncomeCategories);
router.get('/incomes', financeOnly, getIncomes);
router.post('/incomes', financeOnly, validateIncome, createIncome);
router.put('/incomes/:id', financeOnly, validateIncome, updateIncome);
router.delete('/incomes/:id', financeOnly, deleteIncome);

// Expenses (Finance & Administrator only)
router.get('/expenses/categories', financeOnly, getExpenseCategories);
router.post('/expenses/categories', financeOnly, updateExpenseCategories);
router.get('/expenses', financeOnly, getExpenses);
router.post('/expenses', financeOnly, validateExpense, createExpense);
router.put('/expenses/:id', financeOnly, validateExpense, updateExpense);
router.delete('/expenses/:id', financeOnly, deleteExpense);

// Internal Member Payments (Finance & Administrator only)
router.get('/payments/categories', financeOnly, getPaymentCategories);
router.post('/payments/categories', financeOnly, updatePaymentCategories);
router.get('/payments', financeOnly, getPayments);
router.post('/payments', financeOnly, validatePayment, createPayment);
router.put('/payments/:id', financeOnly, validatePayment, updatePayment);
router.delete('/payments/:id', financeOnly, deletePayment);

export default router;
