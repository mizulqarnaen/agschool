import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Radio, Plus, Trash2, Trophy, Clock, CheckCircle2, AlertCircle, Save, Sparkles, Tag, ShieldCheck, Flame } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const LiveStandingsModal = ({ isOpen, onClose, event, onSuccess }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event && isOpen) {
      if (Array.isArray(event.live_standings) && event.live_standings.length > 0) {
        setSessions(JSON.parse(JSON.stringify(event.live_standings)));
      } else {
        // Create initial default session with Best Time Played preset
        setSessions([{
          id: `ls_${Date.now()}`,
          session_title: 'Top 10 Best Time Played (Sesi Harian)',
          metric_label: 'Waktu Tercepat (Best Time)',
          update_date: new Date().toISOString().split('T')[0],
          note: 'Update rekor waktu terbaik peserta. Top peserta terbaik berhak masuk ke Grand Final.',
          is_active: true,
          items: [
            { rank: 1, player_name: '', score_display: '01:20.50', status_badge: '🥇 Rekor Tercepat' },
            { rank: 2, player_name: '', score_display: '01:25.10', status_badge: '🟢 Top 10 Finalis' },
            { rank: 3, player_name: '', score_display: '01:29.80', status_badge: '🟢 Top 10 Finalis' }
          ]
        }]);
      }
      setActiveSessionIndex(0);
    }
  }, [event, isOpen]);

  if (!event) return null;

  const currentSession = sessions[activeSessionIndex] || null;

  const handleApplyPreset = (presetType) => {
    if (!currentSession) return;
    let newMetric = 'Waktu Tercepat (Best Time)';
    let newTitle = 'Top 10 Best Time Played (Sesi Harian)';
    let defaultBadge = '🥇 Rekor Tercepat';

    if (presetType === 'points') {
      newMetric = 'Total Poin / Skor';
      newTitle = 'Klasemen Poin Sementara (Live Leaderboard)';
      defaultBadge = '🟢 Top Leaderboard';
    } else if (presetType === 'qualifiers') {
      newMetric = 'Poin / Sesi Win';
      newTitle = 'Hasil Seleksi Kualifikasi (Qualifiers)';
      defaultBadge = '🟢 Lolos Final';
    }

    setSessions(prev => {
      const copy = [...prev];
      copy[activeSessionIndex] = {
        ...copy[activeSessionIndex],
        session_title: newTitle,
        metric_label: newMetric,
        items: copy[activeSessionIndex].items.map((item, idx) => ({
          ...item,
          status_badge: idx === 0 ? defaultBadge : (idx < 5 ? '🟢 Lolos Final' : '🟡 Safe Zone')
        }))
      };
      return copy;
    });
    toast.success(`Preset "${presetType}" diterapkan!`);
  };

  const handleAddSession = () => {
    const newSess = {
      id: `ls_${Date.now()}`,
      session_title: `Klasemen Sesi #${sessions.length + 1}`,
      metric_label: 'Waktu Tercepat (Best Time)',
      update_date: new Date().toISOString().split('T')[0],
      note: 'Pembaruan posisi & skor sementara.',
      is_active: true,
      items: [
        { rank: 1, player_name: '', score_display: '01:20.00', status_badge: '🥇 Leader' },
        { rank: 2, player_name: '', score_display: '01:25.00', status_badge: '🟢 Lolos' }
      ]
    };
    setSessions(prev => [...prev, newSess]);
    setActiveSessionIndex(sessions.length);
  };

  const handleDeleteSession = (indexToDelete) => {
    if (sessions.length <= 1) {
      return toast.error('Minimal harus ada 1 sesi klasemen!');
    }
    setSessions(prev => prev.filter((_, i) => i !== indexToDelete));
    setActiveSessionIndex(prev => Math.max(0, prev - 1));
  };

  const handleUpdateSessionField = (field, val) => {
    setSessions(prev => {
      const copy = [...prev];
      copy[activeSessionIndex] = { ...copy[activeSessionIndex], [field]: val };
      return copy;
    });
  };

  const handleAddItem = () => {
    if (!currentSession) return;
    setSessions(prev => {
      const copy = [...prev];
      const items = copy[activeSessionIndex].items || [];
      const nextRank = items.length + 1;
      items.push({
        rank: nextRank,
        player_name: '',
        score_display: '',
        status_badge: nextRank <= 3 ? '🟢 Top Podium' : (nextRank <= 10 ? '🟢 Lolos Final' : '🟡 Safe Zone')
      });
      copy[activeSessionIndex].items = items;
      return copy;
    });
  };

  const handleUpdateItem = (itemIdx, field, val) => {
    setSessions(prev => {
      const copy = [...prev];
      const items = [...copy[activeSessionIndex].items];
      items[itemIdx] = { ...items[itemIdx], [field]: val };
      copy[activeSessionIndex].items = items;
      return copy;
    });
  };

  const handleDeleteItem = (itemIdx) => {
    setSessions(prev => {
      const copy = [...prev];
      const items = copy[activeSessionIndex].items.filter((_, i) => i !== itemIdx);
      // Re-rank items sequentially
      const reRanked = items.map((it, idx) => ({ ...it, rank: idx + 1 }));
      copy[activeSessionIndex].items = reRanked;
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/internal/events/${event.id}/live-standings`, {
        live_standings: sessions
      });
      if (res.data.success) {
        toast.success('Live Standings berhasil diperbarui & dipublikasikan!');
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan Live Standings');
    } finally {
      setSaving(false);
    }
  };

  const badgePresets = ['🥇 Rekor Tercepat', '🟢 Lolos Final', '🟢 Top 10 Finalis', '🟡 Safe Zone', '🔴 Tereliminasi', '⚡ Best Summit'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`🔴 Update Live Standings - ${event.title}`}>
      <div className="space-y-5 max-w-4xl w-full">
        {/* Preset Selector Banner */}
        <div className="p-3.5 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 rounded-2xl border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Preset Format Cepat
            </span>
            <p className="text-[11px] text-slate-400">Pilih skenario leaderboard otomatis untuk mempermudah pengisian</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleApplyPreset('time')}
              className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5 text-purple-400" /> ⏱️ Best Time Played
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('points')}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> 🏆 Poin & Skor
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('qualifiers')}
              className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 🟢 Seleksi Kualifikasi
            </button>
          </div>
        </div>

        {/* Sessions Tab Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {sessions.map((sess, idx) => (
              <div key={sess.id || idx} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveSessionIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeSessionIndex === idx
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-purple-300" />
                  <span>{sess.session_title || `Sesi #${idx + 1}`}</span>
                </button>
                {sessions.length > 1 && activeSessionIndex === idx && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                    title="Hapus Sesi Ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddSession}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" /> + Tambah Sesi Baru
          </button>
        </div>

        {/* Active Session Configuration Form */}
        {currentSession && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Judul Pembaruan Sesi / Harian *</label>
                <input
                  type="text"
                  placeholder="Contoh: Top 10 Best Time Played (Sesi Seleksi Harian)"
                  value={currentSession.session_title}
                  onChange={(e) => handleUpdateSessionField('session_title', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Label Kolom Skor *</label>
                <input
                  type="text"
                  placeholder="Contoh: Waktu Tercepat / Best Time"
                  value={currentSession.metric_label}
                  onChange={(e) => handleUpdateSessionField('metric_label', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-bold placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Catatan / Pengumuman Sesi (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Top 10 peserta terbaik berhak masuk ke Grand Final AG School Minggu pukul 20:00 WIB."
                value={currentSession.note || ''}
                onChange={(e) => handleUpdateSessionField('note', e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Participants Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pt-2">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Daftar Peserta & Skor / Rekor Tercepat ({currentSession.items?.length || 0})
                </h4>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> + Baris Peserta
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-2 space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[10px] font-bold uppercase text-slate-400 bg-slate-900/90 rounded-lg">
                    <tr>
                      <th className="px-3 py-2 text-center w-12">Rank</th>
                      <th className="px-3 py-2">Nama Peserta / Tim *</th>
                      <th className="px-3 py-2 w-48">{currentSession.metric_label || 'Waktu / Skor'} *</th>
                      <th className="px-3 py-2 w-44">Badge Status</th>
                      <th className="px-2 py-2 text-center w-10">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {currentSession.items && currentSession.items.length > 0 ? (
                      currentSession.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                          <td className="px-3 py-1.5 text-center font-bold font-mono">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black ${
                              item.rank === 1
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                                : item.rank === 2
                                ? 'bg-slate-300 text-slate-950 font-black'
                                : item.rank === 3
                                ? 'bg-amber-700 text-white font-black'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              #{item.rank}
                            </span>
                          </td>
                          <td className="px-3 py-1.5">
                            <input
                              type="text"
                              placeholder="Nama Player / IGN / Tim..."
                              value={item.player_name}
                              onChange={(e) => handleUpdateItem(idx, 'player_name', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <input
                              type="text"
                              placeholder="01:23.45 / 25 pts"
                              value={item.score_display}
                              onChange={(e) => handleUpdateItem(idx, 'score_display', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                            />
                          </td>
                          <td className="px-3 py-1.5">
                            <div className="space-y-1">
                              <input
                                type="text"
                                placeholder="🟢 Lolos Final"
                                value={item.status_badge || ''}
                                onChange={(e) => handleUpdateItem(idx, 'status_badge', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[11px] text-purple-300 font-bold focus:outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(idx)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                              title="Hapus Baris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                          Belum ada peserta di sesi ini. Klik &quot;+ Baris Peserta&quot; untuk menambahkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Quick Status Badge Picker Bar */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-500">Pilih Cepat Status Badge:</span>
                {badgePresets.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      if (currentSession.items?.length > 0) {
                        handleUpdateItem(currentSession.items.length - 1, 'status_badge', b);
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-slate-800 text-[10px] font-bold"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-purple transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Mempublikasikan...' : 'Simpan & Publikasikan Live Standings'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
