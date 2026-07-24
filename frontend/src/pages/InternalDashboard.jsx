import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { TrendingUp, TrendingDown, Users, Wallet, ShieldCheck, DollarSign, Trophy, Coins, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const InternalDashboard = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState('IDR');

  // Date Period Filter State (default 'all')
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchDashboardSummary();
  }, [period, startDate, endDate]);

  const fetchDashboardSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/finance/dashboard', {
        params: {
          period,
          start_date: startDate,
          end_date: endDate
        }
      });
      if (response.data.success) {
        setSummary(response.data.data);
        if (response.data.data.base_currency) {
          setDisplayCurrency(response.data.data.base_currency);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const isIDR = displayCurrency === 'IDR';

  const initialVal = isIDR ? summary?.initial_balance_idr || 0 : summary?.initial_balance_sgd || 0;
  const incomeVal = isIDR ? summary?.total_income_idr || 0 : summary?.total_income_sgd || 0;
  const expenseVal = isIDR ? summary?.total_expense_idr || 0 : summary?.total_expense_sgd || 0;
  const paymentVal = isIDR ? summary?.total_payments_idr || 0 : summary?.total_payments_sgd || 0;
  const paidPrizeVal = isIDR ? summary?.total_paid_prizes_idr || 0 : summary?.total_paid_prizes_sgd || 0;
  const combinedExpenseVal = isIDR ? summary?.total_combined_expense_idr || 0 : summary?.total_combined_expense_sgd || 0;
  const netVal = isIDR ? summary?.net_balance_idr || 0 : summary?.net_balance_sgd || 0;

  const chartData = {
    labels: [t('total_income'), t('op_expenses'), t('total_payouts'), t('paid_event_prizes')],
    datasets: [
      {
        label: `${t('financial_flow')} (${displayCurrency})`,
        data: [incomeVal, expenseVal, paymentVal, paidPrizeVal],
        backgroundColor: [
          'rgba(6, 182, 212, 0.7)',
          'rgba(244, 63, 94, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(245, 158, 11, 0.7)'
        ],
        borderColor: ['#06b6d4', '#f43f5e', '#a855f7', '#f59e0b'],
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 sm:p-8 lg:p-10 w-full">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{t('dashboard')}</h1>
            <p className="text-xs text-slate-400 mt-1">{t('dashboard_subtitle')}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Period Filter Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-400">Periode:</span>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-cyan-300 font-bold"
              >
                <option value="all" className="bg-slate-900 text-white">Semua Waktu (All Time)</option>
                <option value="today" className="bg-slate-900 text-white">Hari Ini (Today)</option>
                <option value="month" className="bg-slate-900 text-white">Bulan Ini (This Month)</option>
                <option value="year" className="bg-slate-900 text-white">Tahun Ini (This Year)</option>
                <option value="custom" className="bg-slate-900 text-white">Rentang Custom (Custom Range)</option>
              </select>
            </div>

            {period === 'custom' && (
              <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                />
                <span className="text-slate-400 text-xs">s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                />
              </div>
            )}

            {/* Currency Display Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-400">Display:</span>
              <select
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-cyan-300 font-bold"
              >
                <option value="IDR" className="bg-slate-900 text-white">IDR (Rupiah)</option>
                <option value="SGD" className="bg-slate-900 text-white">SGD (Dollar)</option>
              </select>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('verified_portal')}</span>
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Net Cash Balance */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-cyan-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('net_balance')}</span>
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">
              {displayCurrency} {loading ? '...' : Number(netVal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{t('net_balance_formula')}</p>
          </div>

          {/* Initial Starting Cash Balance */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-teal-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('initial_balance')}</span>
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-teal-300">
              {displayCurrency} {loading ? '...' : Number(initialVal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{t('opening_balance_sub')} ({summary?.base_currency || 'IDR'})</p>
          </div>

          {/* Total Income */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('total_income')}</span>
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">
              {displayCurrency} {loading ? '...' : Number(incomeVal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{summary?.counts?.incomes || 0} {t('income_records_count')}</p>
          </div>
        </div>

        {/* Secondary Expense Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {/* Operational Expenses */}
          <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('op_expenses')}</span>
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold text-rose-400">
              {displayCurrency} {loading ? '...' : Number(expenseVal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{summary?.counts?.expenses || 0} {t('op_expense_items_count')}</p>
          </div>

          {/* Member Payments */}
          <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('total_payouts')}</span>
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold text-purple-400">
              {displayCurrency} {loading ? '...' : Number(paymentVal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{summary?.counts?.payments || 0} {t('member_payouts_count')}</p>
          </div>

          {/* Paid Event Prizes */}
          <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('paid_event_prizes')}</span>
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-bold text-amber-300">
              {displayCurrency} {loading ? '...' : Number(paidPrizeVal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{t('paid_prizes_sub')}</p>
          </div>
        </div>

        {/* Charts & Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
            <h3 className="text-base font-bold text-white mb-6">{t('financial_comparison')} ({displayCurrency})</h3>
            <div className="h-64">
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-4">{t('currency_rate_info')}</h3>
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">{t('active_exchange_rate')}</span>
                  <span className="font-extrabold text-cyan-400 text-sm">
                    1 SGD = {Number(summary?.active_exchange_rate_sgd_idr || 11800).toLocaleString()} IDR
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">{t('system_default_currency')}</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{summary?.base_currency || 'IDR'}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-xs text-slate-400">
              <p>{t('rate_notice')}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
