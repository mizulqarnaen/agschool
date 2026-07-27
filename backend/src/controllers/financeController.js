import { incomeRepository } from '../repositories/incomeRepository.js';
import { expenseRepository } from '../repositories/expenseRepository.js';
import { paymentRepository } from '../repositories/paymentRepository.js';
import { memberRepository } from '../repositories/memberRepository.js';
import { eventRepository } from '../repositories/eventRepository.js';
import { prizeRepository } from '../repositories/prizeRepository.js';
import { settingRepository } from '../repositories/settingRepository.js';
import { loggerService } from '../services/loggerService.js';
import { currencyService } from '../services/currencyService.js';

// --- Dashboard Summary Metrics ---
export const getDashboardSummary = (req, res) => {
  try {
    const { period = 'all', start_date, end_date } = req.query;

    const allIncomes = incomeRepository.readAll();
    const allExpenses = expenseRepository.readAll();
    const allPayments = paymentRepository.readAll();
    const allPrizes = prizeRepository.readAll();
    const events = eventRepository.readAll();
    const members = memberRepository.readAll();
    const settings = settingRepository.getSettingsMap();
    const rateInfo = currencyService.getActiveRateInfo();

    const defaultCurrency = settings.default_currency || 'IDR';
    const initialBalanceIDR = Number(settings.initial_balance_idr || 0);

    // Date range helper
    const filterByPeriod = (items, dateProp = 'transaction_date') => {
      if (!period || period === 'all') return items;
      const now = new Date();
      let start = null;
      let end = null;

      if (period === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        start = todayStr;
        end = todayStr;
      } else if (period === 'month') {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        start = `${y}-${m}-01`;
        end = new Date(y, now.getMonth() + 1, 0).toISOString().split('T')[0];
      } else if (period === 'year') {
        const y = now.getFullYear();
        start = `${y}-01-01`;
        end = `${y}-12-31`;
      } else if (period === 'custom') {
        start = start_date || '1970-01-01';
        end = end_date || '2099-12-31';
      }

      return items.filter(item => {
        const rawDate = item[dateProp] || item.payment_date || (item.created_at ? item.created_at.split('T')[0] : '');
        if (!rawDate) return true;
        if (start && rawDate < start) return false;
        if (end && rawDate > end) return false;
        return true;
      });
    };

    const incomes = filterByPeriod(allIncomes, 'transaction_date');
    const expenses = filterByPeriod(allExpenses, 'transaction_date');
    const payments = filterByPeriod(allPayments, 'payment_date');
    const prizes = filterByPeriod(allPrizes, 'payment_date');

    // Calculate totals in converted base currency (IDR)
    const totalIncomeIDR = incomes.reduce((sum, item) => sum + Number(item.base_amount_idr || item.amount || 0), 0);
    const totalExpenseIDR = expenses.reduce((sum, item) => sum + Number(item.base_amount_idr || item.amount || 0), 0);
    const totalPaymentsIDR = payments.reduce((sum, item) => sum + Number(item.base_amount_idr || item.amount || 0), 0);

    // Only prizes with payment_status === 'Paid' are counted in paid prize expense summary
    const paidPrizes = prizes.filter(p => p.payment_status === 'Paid');
    const totalPaidPrizesIDR = paidPrizes.reduce((sum, item) => sum + Number(item.base_amount_idr || item.prize_amount || 0), 0);

    // Total Combined Expenses = Operational Expenses (includes auto-synced Paid Event Prizes) + Staff Member Payments
    const totalCombinedExpenseIDR = totalExpenseIDR + totalPaymentsIDR;

    // Net Balance = Initial Cash Balance + Total Income - Total Combined Expense
    const netBalanceIDR = initialBalanceIDR + totalIncomeIDR - totalCombinedExpenseIDR;

    res.json({
      success: true,
      data: {
        base_currency: defaultCurrency,
        active_exchange_rate_sgd_idr: rateInfo.active_rate_sgd_idr,
        initial_balance_idr: initialBalanceIDR,
        total_income_idr: totalIncomeIDR,
        total_expense_idr: totalExpenseIDR,
        total_payments_idr: totalPaymentsIDR,
        total_paid_prizes_idr: totalPaidPrizesIDR,
        total_combined_expense_idr: totalCombinedExpenseIDR,
        net_balance_idr: netBalanceIDR,

        initial_balance_sgd: Math.round((initialBalanceIDR / rateInfo.active_rate_sgd_idr) * 100) / 100,
        total_income_sgd: Math.round((totalIncomeIDR / rateInfo.active_rate_sgd_idr) * 100) / 100,
        total_expense_sgd: Math.round((totalExpenseIDR / rateInfo.active_rate_sgd_idr) * 100) / 100,
        total_payments_sgd: Math.round((totalPaymentsIDR / rateInfo.active_rate_sgd_idr) * 100) / 100,
        total_paid_prizes_sgd: Math.round((totalPaidPrizesIDR / rateInfo.active_rate_sgd_idr) * 100) / 100,
        total_combined_expense_sgd: Math.round((totalCombinedExpenseIDR / rateInfo.active_rate_sgd_idr) * 100) / 100,
        net_balance_sgd: Math.round((netBalanceIDR / rateInfo.active_rate_sgd_idr) * 100) / 100,

        counts: {
          incomes: incomes.length,
          expenses: expenses.length,
          payments: payments.length,
          prizes: prizes.length,
          events: events.length,
          members: members.length
        },
        recent_incomes: incomes.slice(0, 5),
        recent_expenses: expenses.slice(0, 5),
        recent_payments: payments.slice(0, 5)
      }
    });
  } catch (err) {
    console.error('Error calculating dashboard metrics:', err);
    res.status(500).json({ success: false, message: 'Failed to compute dashboard metrics.' });
  }
};

// --- Incomes ---
export const getIncomes = (req, res) => {
  const incomes = incomeRepository.getFiltered(req.query);
  res.json({ success: true, data: incomes });
};

export const createIncome = (req, res) => {
  const rateInfo = currencyService.getActiveRateInfo();
  const settings = settingRepository.getSettingsMap();
  const currency = req.body.currency || settings.default_currency || 'IDR';
  const amount = Number(req.body.amount || 0);
  const rateUsed = Number(req.body.exchange_rate_used || rateInfo.active_rate_sgd_idr);
  const baseIDR = currencyService.calculateBaseIdr(amount, currency, rateUsed);

  const newIncome = incomeRepository.create({
    ...req.body,
    amount,
    currency,
    exchange_rate_used: rateUsed,
    base_amount_idr: baseIDR,
    recorded_by_user_id: req.user.id
  });
  loggerService.logActivity(req.user.id, 'CREATE_INCOME', 'Income', newIncome.id, { amount: newIncome.amount, currency: newIncome.currency });
  res.status(201).json({ success: true, data: newIncome });
};

export const updateIncome = (req, res) => {
  const { id } = req.params;
  const rateInfo = currencyService.getActiveRateInfo();
  const settings = settingRepository.getSettingsMap();
  const currency = req.body.currency || settings.default_currency || 'IDR';
  const amount = Number(req.body.amount || 0);
  const rateUsed = Number(req.body.exchange_rate_used || rateInfo.active_rate_sgd_idr);
  const baseIDR = currencyService.calculateBaseIdr(amount, currency, rateUsed);

  const updated = incomeRepository.update(id, {
    ...req.body,
    amount,
    currency,
    exchange_rate_used: rateUsed,
    base_amount_idr: baseIDR
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Income record not found.' });
  loggerService.logActivity(req.user.id, 'UPDATE_INCOME', 'Income', id, req.body);
  res.json({ success: true, data: updated });
};

export const deleteIncome = (req, res) => {
  const { id } = req.params;
  const deleted = incomeRepository.softDelete(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Income record not found.' });
  loggerService.logActivity(req.user.id, 'DELETE_INCOME', 'Income', id);
  res.json({ success: true, message: 'Income record soft-deleted.' });
};

// --- Expenses ---
export const getExpenses = (req, res) => {
  const expenses = expenseRepository.getFiltered(req.query);
  res.json({ success: true, data: expenses });
};

export const createExpense = (req, res) => {
  const rateInfo = currencyService.getActiveRateInfo();
  const settings = settingRepository.getSettingsMap();
  const currency = req.body.currency || settings.default_currency || 'IDR';
  const amount = Number(req.body.amount || 0);
  const rateUsed = Number(req.body.exchange_rate_used || rateInfo.active_rate_sgd_idr);
  const baseIDR = currencyService.calculateBaseIdr(amount, currency, rateUsed);

  const newExpense = expenseRepository.create({
    ...req.body,
    amount,
    currency,
    exchange_rate_used: rateUsed,
    base_amount_idr: baseIDR,
    related_event_id: req.body.related_event_id ? Number(req.body.related_event_id) : null,
    recorded_by_user_id: req.user.id
  });
  loggerService.logActivity(req.user.id, 'CREATE_EXPENSE', 'Expense', newExpense.id, { amount: newExpense.amount, currency: newExpense.currency });
  res.status(201).json({ success: true, data: newExpense });
};

export const updateExpense = (req, res) => {
  const { id } = req.params;
  const rateInfo = currencyService.getActiveRateInfo();
  const settings = settingRepository.getSettingsMap();
  const currency = req.body.currency || settings.default_currency || 'IDR';
  const amount = Number(req.body.amount || 0);
  const rateUsed = Number(req.body.exchange_rate_used || rateInfo.active_rate_sgd_idr);
  const baseIDR = currencyService.calculateBaseIdr(amount, currency, rateUsed);

  const updated = expenseRepository.update(id, {
    ...req.body,
    amount,
    currency,
    exchange_rate_used: rateUsed,
    base_amount_idr: baseIDR,
    related_event_id: req.body.related_event_id ? Number(req.body.related_event_id) : null
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Expense record not found.' });
  loggerService.logActivity(req.user.id, 'UPDATE_EXPENSE', 'Expense', id, req.body);
  res.json({ success: true, data: updated });
};

export const deleteExpense = (req, res) => {
  const { id } = req.params;
  const deleted = expenseRepository.softDelete(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Expense record not found.' });
  loggerService.logActivity(req.user.id, 'DELETE_EXPENSE', 'Expense', id);
  res.json({ success: true, message: 'Expense record soft-deleted.' });
};

// --- Internal Member Payments ---
export const getPayments = (req, res) => {
  const payments = paymentRepository.getFiltered(req.query);
  const members = memberRepository.readAll();

  const enriched = payments.map(payment => {
    const member = members.find(m => m.id === payment.member_id);
    return {
      ...payment,
      member_name: member ? member.full_name : 'Unknown Member',
      member_category: member ? member.category : 'N/A'
    };
  });

  res.json({ success: true, data: enriched });
};

export const createPayment = (req, res) => {
  const rateInfo = currencyService.getActiveRateInfo();
  const settings = settingRepository.getSettingsMap();
  const currency = req.body.currency || settings.default_currency || 'IDR';
  const amount = Number(req.body.amount || 0);
  const rateUsed = Number(req.body.exchange_rate_used || rateInfo.active_rate_sgd_idr);
  const baseIDR = currencyService.calculateBaseIdr(amount, currency, rateUsed);

  const newPayment = paymentRepository.create({
    ...req.body,
    member_id: Number(req.body.member_id),
    amount,
    currency,
    exchange_rate_used: rateUsed,
    base_amount_idr: baseIDR,
    recorded_by_user_id: req.user.id
  });
  loggerService.logActivity(req.user.id, 'CREATE_PAYMENT', 'MemberPayment', newPayment.id, { amount: newPayment.amount, currency: newPayment.currency });
  res.status(201).json({ success: true, data: newPayment });
};

export const updatePayment = (req, res) => {
  const { id } = req.params;
  const rateInfo = currencyService.getActiveRateInfo();
  const settings = settingRepository.getSettingsMap();
  const currency = req.body.currency || settings.default_currency || 'IDR';
  const amount = Number(req.body.amount || 0);
  const rateUsed = Number(req.body.exchange_rate_used || rateInfo.active_rate_sgd_idr);
  const baseIDR = currencyService.calculateBaseIdr(amount, currency, rateUsed);

  const updated = paymentRepository.update(id, {
    ...req.body,
    member_id: Number(req.body.member_id),
    amount,
    currency,
    exchange_rate_used: rateUsed,
    base_amount_idr: baseIDR
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Payment record not found.' });
  loggerService.logActivity(req.user.id, 'UPDATE_PAYMENT', 'Payment', id, req.body);
  res.json({ success: true, data: updated });
};

export const deletePayment = (req, res) => {
  const { id } = req.params;
  const deleted = paymentRepository.softDelete(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Payment record not found.' });
  loggerService.logActivity(req.user.id, 'DELETE_PAYMENT', 'Payment', id);
  res.json({ success: true, message: 'Payment record soft-deleted.' });
};

// --- Members CRUD ---
export const getMembers = (req, res) => {
  const members = memberRepository.readAll();
  res.json({ success: true, data: members });
};

export const createMember = (req, res) => {
  let categories = req.body.categories;
  if (!Array.isArray(categories) || categories.length === 0) {
    categories = req.body.category ? [req.body.category] : ['BA'];
  }
  const categoryStr = categories.join(', ');
  const role_salaries = req.body.role_salaries || {};

  let monthly_salary = req.body.monthly_salary !== undefined && req.body.monthly_salary !== '' && req.body.monthly_salary !== null
    ? Number(req.body.monthly_salary)
    : null;

  if ((monthly_salary === null || monthly_salary === 0) && Object.keys(role_salaries).length > 0) {
    monthly_salary = Object.values(role_salaries).reduce((acc, val) => {
      const amt = typeof val === 'object' ? Number(val.amount || 0) : Number(val || 0);
      return acc + amt;
    }, 0);
  }

  const newMember = memberRepository.create({
    full_name: req.body.full_name,
    email: req.body.email || '',
    phone: req.body.phone || '',
    roblox_username: req.body.roblox_username || '',
    roblox_nickname: req.body.roblox_nickname || '',
    tiktok_handle: req.body.tiktok_handle || '',
    discord_username: req.body.discord_username || '',
    bank_name: req.body.bank_name || '',
    bank_account_number: req.body.bank_account_number || '',
    bank_account_name: req.body.bank_account_name || '',
    monthly_salary,
    salary_currency: req.body.salary_currency || 'IDR',
    category: categoryStr,
    categories,
    role_salaries,
    status: req.body.status || 'active',
    joined_date: req.body.joined_date || new Date().toISOString().split('T')[0]
  });
  loggerService.logActivity(req.user.id, 'CREATE_MEMBER', 'Member', newMember.id, { full_name: newMember.full_name });
  res.status(201).json({ success: true, data: newMember });
};

export const updateMember = (req, res) => {
  const { id } = req.params;
  let categories = req.body.categories;
  if (!Array.isArray(categories) || categories.length === 0) {
    categories = req.body.category ? [req.body.category] : ['BA'];
  }
  const categoryStr = categories.join(', ');
  const role_salaries = req.body.role_salaries || {};

  let monthly_salary = req.body.monthly_salary !== undefined && req.body.monthly_salary !== '' && req.body.monthly_salary !== null
    ? Number(req.body.monthly_salary)
    : null;

  if ((monthly_salary === null || monthly_salary === 0) && Object.keys(role_salaries).length > 0) {
    monthly_salary = Object.values(role_salaries).reduce((acc, val) => {
      const amt = typeof val === 'object' ? Number(val.amount || 0) : Number(val || 0);
      return acc + amt;
    }, 0);
  }

  const updated = memberRepository.update(id, {
    full_name: req.body.full_name,
    email: req.body.email || '',
    phone: req.body.phone || '',
    roblox_username: req.body.roblox_username || '',
    roblox_nickname: req.body.roblox_nickname || '',
    tiktok_handle: req.body.tiktok_handle || '',
    discord_username: req.body.discord_username || '',
    bank_name: req.body.bank_name || '',
    bank_account_number: req.body.bank_account_number || '',
    bank_account_name: req.body.bank_account_name || '',
    monthly_salary,
    salary_currency: req.body.salary_currency || 'IDR',
    category: categoryStr,
    categories,
    role_salaries,
    status: req.body.status || 'active',
    joined_date: req.body.joined_date
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Member not found.' });
  loggerService.logActivity(req.user.id, 'UPDATE_MEMBER', 'Member', id, req.body);
  res.json({ success: true, data: updated });
};

export const deleteMember = (req, res) => {
  const { id } = req.params;
  const deleted = memberRepository.softDelete(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Member not found.' });
  loggerService.logActivity(req.user.id, 'DELETE_MEMBER', 'Member', id);
  res.json({ success: true, message: 'Member soft-deleted.' });
};

// --- Member Categories Management ---
export const getMemberCategories = (req, res) => {
  const settings = settingRepository.getSettingsMap();
  const defaultCategories = ['BA', 'Caster', 'Maintainer', 'Secretary', 'Staff', 'Content Creator'];
  let categories = defaultCategories;
  if (settings.member_categories) {
    try {
      categories = JSON.parse(settings.member_categories);
    } catch (_) {
      categories = defaultCategories;
    }
  }
  res.json({ success: true, data: categories });
};

export const updateMemberCategories = (req, res) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return res.status(400).json({ success: false, message: 'Categories must be an array.' });
  }
  settingRepository.updateSettingsMap({ member_categories: JSON.stringify(categories) });
  loggerService.logActivity(req.user.id, 'UPDATE_MEMBER_CATEGORIES', 'Settings', null, { categories });
  res.json({ success: true, data: categories });
};

// --- Payment Categories Management ---
export const getPaymentCategories = (req, res) => {
  const settings = settingRepository.getSettingsMap();
  const defaultCategories = ['BA payment', 'Caster payment', 'Maintainer fee', 'Secretary stipend', 'Other payout'];
  let categories = defaultCategories;
  if (settings.payment_categories) {
    try {
      categories = JSON.parse(settings.payment_categories);
    } catch (_) {
      categories = defaultCategories;
    }
  }
  res.json({ success: true, data: categories });
};

export const updatePaymentCategories = (req, res) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return res.status(400).json({ success: false, message: 'Categories must be an array.' });
  }
  settingRepository.updateSettingsMap({ payment_categories: JSON.stringify(categories) });
  loggerService.logActivity(req.user.id, 'UPDATE_PAYMENT_CATEGORIES', 'Settings', null, { categories });
  res.json({ success: true, data: categories });
};

// --- Operational Income Categories Management ---
export const getIncomeCategories = (req, res) => {
  const settings = settingRepository.getSettingsMap();
  const defaultCategories = ['Sponsorship', 'Donation', 'Registration Fee', 'School Allocation', 'Merchandise Sales', 'Other Income'];
  let categories = defaultCategories;
  if (settings.income_categories) {
    try {
      categories = JSON.parse(settings.income_categories);
    } catch (_) {
      categories = defaultCategories;
    }
  }
  res.json({ success: true, data: categories });
};

export const updateIncomeCategories = (req, res) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return res.status(400).json({ success: false, message: 'Categories must be an array.' });
  }
  settingRepository.updateSettingsMap({ income_categories: JSON.stringify(categories) });
  loggerService.logActivity(req.user.id, 'UPDATE_INCOME_CATEGORIES', 'Settings', null, { categories });
  res.json({ success: true, data: categories });
};

// --- Operational Expense Categories Management ---
export const getExpenseCategories = (req, res) => {
  const settings = settingRepository.getSettingsMap();
  const defaultCategories = ['Equipment', 'Logistics', 'Server/Domain', 'Refreshments', 'Operations', 'Event Prize Payout', 'Marketing', 'Other Expense'];
  let categories = defaultCategories;
  if (settings.expense_categories) {
    try {
      categories = JSON.parse(settings.expense_categories);
    } catch (_) {
      categories = defaultCategories;
    }
  }
  res.json({ success: true, data: categories });
};

export const updateExpenseCategories = (req, res) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return res.status(400).json({ success: false, message: 'Categories must be an array.' });
  }
  settingRepository.updateSettingsMap({ expense_categories: JSON.stringify(categories) });
  loggerService.logActivity(req.user.id, 'UPDATE_EXPENSE_CATEGORIES', 'Settings', null, { categories });
  res.json({ success: true, data: categories });
};
