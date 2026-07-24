import express from 'express';
import {
  getDashboardSummary,
  getIncomes, createIncome, updateIncome, deleteIncome,
  getExpenses, createExpense, updateExpense, deleteExpense,
  getPayments, createPayment, updatePayment, deletePayment,
  getMembers, createMember, updateMember, deleteMember,
  getMemberCategories, updateMemberCategories,
  getPaymentCategories, updatePaymentCategories
} from '../controllers/financeController.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validateIncome, validateExpense, validatePayment } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Allow Finance and Administrator roles
router.use(authorizeRoles('administrator', 'finance'));

router.get('/dashboard', getDashboardSummary);

// Incomes
router.get('/incomes', getIncomes);
router.post('/incomes', validateIncome, createIncome);
router.put('/incomes/:id', validateIncome, updateIncome);
router.delete('/incomes/:id', deleteIncome);

// Expenses
router.get('/expenses', getExpenses);
router.post('/expenses', validateExpense, createExpense);
router.put('/expenses/:id', validateExpense, updateExpense);
router.delete('/expenses/:id', deleteExpense);

// Internal Member Payments
router.get('/payments/categories', getPaymentCategories);
router.post('/payments/categories', updatePaymentCategories);
router.get('/payments', getPayments);
router.post('/payments', validatePayment, createPayment);
router.put('/payments/:id', validatePayment, updatePayment);
router.delete('/payments/:id', deletePayment);

// Internal Staff Members
router.get('/members/categories', getMemberCategories);
router.post('/members/categories', updateMemberCategories);
router.get('/members', getMembers);
router.post('/members', createMember);
router.put('/members/:id', updateMember);
router.delete('/members/:id', deleteMember);

export default router;
