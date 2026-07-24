import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Settings, Save, RefreshCw, DollarSign, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { t } = useTranslation();

  const [settings, setSettings] = useState({
    org_name: 'AG School',
    contact_email: 'contact@agschool.com',
    initial_balance_idr: '0',
    default_language: 'id',
    default_currency: 'IDR',
    exchange_rate_mode: 'manual',
    exchange_rate_sgd_idr: '11800.00',
    auto_sync_interval_hours: '24'
  });

  const [rateInfo, setRateInfo] = useState(null);
  const [calcAmount, setCalcAmount] = useState('100');
  const [calcCurrency, setCalcCurrency] = useState('SGD');
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/admin/settings');
      if (response.data.success) {
        setSettings(prev => ({ ...prev, ...response.data.data }));
        if (response.data.data.rate_info) {
          setRateInfo(response.data.data.rate_info);
        }
      }
    } catch (_) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/internal/admin/settings', settings);
      toast.success('System settings updated');
      fetchSettings();
    } catch (_) {
      toast.error('Failed to save settings');
    }
  };

  const handleSyncRateNow = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/internal/admin/settings/sync-rate');
      if (response.data.success) {
        toast.success(response.data.data.message || 'Exchange rate synced');
        fetchSettings();
      } else {
        toast.error('Sync failed; retained fallback rate');
      }
    } catch (_) {
      toast.error('Failed to trigger rate sync');
    } finally {
      setSyncing(false);
    }
  };

  const currentRate = Number(settings.exchange_rate_sgd_idr || 11800);
  const convertedPreview = calcCurrency === 'SGD'
    ? (Number(calcAmount || 0) * currentRate).toLocaleString(undefined, { minimumFractionDigits: 2 })
    : (Number(calcAmount || 0) / currentRate).toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 sm:p-8 lg:p-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Settings className="w-7 h-7 text-cyan-400" />
              {t('settings')} & Financial Config
            </h1>
            <p className="text-xs text-slate-400 mt-1">Configure Organization Profile, Initial Cash Balance, Languages, and Exchange Rate Sync</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Form */}
          <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-2">Global System Parameters</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Organization Name</label>
              <input
                type="text"
                required
                value={settings.org_name || ''}
                onChange={(e) => setSettings({ ...settings, org_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={settings.contact_email || ''}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Opening Cash Balance */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <label className="block text-xs font-bold text-white uppercase">{t('initial_balance')} (IDR)</label>
              </div>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={settings.initial_balance_idr || ''}
                onChange={(e) => setSettings({ ...settings, initial_balance_idr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Starting cash balance of the organization before system records</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('language')}</label>
                <select
                  value={settings.default_language || 'id'}
                  onChange={(e) => setSettings({ ...settings, default_language: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="id">Indonesian ({t('indonesian')})</option>
                  <option value="en">English ({t('english')})</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('currency')}</label>
                <select
                  value={settings.default_currency || 'IDR'}
                  onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="IDR">IDR (Rupiah)</option>
                  <option value="SGD">SGD (Dollar)</option>
                </select>
              </div>
            </div>

            {/* Exchange Rate Mode Section */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{t('exchange_rate')} Mode & Sync</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Mode Selection</label>
                  <select
                    value={settings.exchange_rate_mode || 'manual'}
                    onChange={(e) => setSettings({ ...settings, exchange_rate_mode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="manual">Manual Mode (Admin Input)</option>
                    <option value="auto">Automatic Mode (Live Provider Sync)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    {t('exchange_rate')}: 1 SGD = X IDR
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    disabled={settings.exchange_rate_mode === 'auto'}
                    value={settings.exchange_rate_sgd_idr || ''}
                    onChange={(e) => setSettings({ ...settings, exchange_rate_sgd_idr: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {settings.exchange_rate_mode === 'auto' && (
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-300 block">Auto Sync Status</span>
                    <span className="text-[11px] text-slate-400">
                      Provider: {rateInfo?.provider_name || 'ExchangeRate-API'} | Status: {rateInfo?.last_sync_status || 'Active'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncRateNow}
                    disabled={syncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-xs font-semibold border border-cyan-500/30 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    Sync Now
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg glow-cyan transition-all"
              >
                <Save className="w-4 h-4" />
                {t('save_settings')}
              </button>
            </div>
          </form>

          {/* Currency Converter Preview */}
          <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Kalkulator Konversi Mata Uang</h3>
                  <p className="text-xs text-slate-400">Instant test based on current active rate</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('amount')}</label>
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base font-bold text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('currency')}</label>
                    <select
                      value={calcCurrency}
                      onChange={(e) => setCalcCurrency(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="SGD">SGD</option>
                      <option value="IDR">IDR</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block mb-1">
                    Hasil Konversi ({calcCurrency === 'SGD' ? 'IDR' : 'SGD'})
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-400">
                    {calcCurrency === 'SGD' ? `IDR ${convertedPreview}` : `SGD ${convertedPreview}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-6 border-t border-slate-800 flex items-center justify-between">
              <span>Active Rate: 1 SGD = {currentRate.toLocaleString()} IDR</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold uppercase text-[10px]">
                {settings.exchange_rate_mode} Mode
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
