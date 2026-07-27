import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { Trophy, Award, Settings, Plus, Trash2, RefreshCw, CheckCircle2, AlertCircle, Hash, Sparkles, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const LeagueStandingsModal = ({ isOpen, onClose, event, onStandingsUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [leagueConfig, setLeagueConfig] = useState({
    is_league: true,
    max_finalists: 20,
    podium_count: 3,
    total_matches: 3,
    point_schema: {
      "1": 10, "2": 9, "3": 8, "4": 7, "5": 6,
      "6": 5, "7": 4, "8": 3, "9": 2, "10": 1
    }
  });

  const [showConfig, setShowConfig] = useState(false);
  const [showParticipantsInput, setShowParticipantsInput] = useState(false);
  const [participantsText, setParticipantsText] = useState('');
  const [savingSync, setSavingSync] = useState(false);
  const [schemaRankCount, setSchemaRankCount] = useState(10);

  useEffect(() => {
    if (isOpen && event?.id) {
      fetchStandingsData();
    }
  }, [isOpen, event?.id]);

  const fetchStandingsData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/internal/events/${event.id}/standings`);
      if (response.data.success) {
        setLeagueConfig(response.data.league_config);
        setStandings(response.data.standings);
        
        // Compute schema rank count
        if (response.data.league_config?.point_schema) {
          const keys = Object.keys(response.data.league_config.point_schema).map(Number).filter(n => !isNaN(n));
          if (keys.length > 0) {
            setSchemaRankCount(Math.max(10, Math.max(...keys)));
          }
        }

        // Populate participants text
        const names = response.data.standings.map(s => s.player_name).join('\n');
        setParticipantsText(names);
      }
    } catch (_) {
      toast.error('Gagal mengambil data poin liga');
    } finally {
      setLoading(false);
    }
  };

  const applyPresetSchema = (count) => {
    setSchemaRankCount(count);
    const newSchema = {};
    for (let i = 1; i <= count; i++) {
      newSchema[i] = count - i + 1;
    }
    setLeagueConfig(prev => ({
      ...prev,
      point_schema: newSchema
    }));
  };

  const handleSaveConfig = async () => {
    try {
      const response = await api.post(`/internal/events/${event.id}/standings/config`, leagueConfig);
      if (response.data.success) {
        toast.success('Pengaturan sistem poin liga berhasil disimpan!');
        setShowConfig(false);
        fetchStandingsData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan poin');
    }
  };

  const handleSaveParticipants = async () => {
    const namesArray = participantsText
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    try {
      const response = await api.post(`/internal/events/${event.id}/standings/participants`, {
        player_names: namesArray
      });
      if (response.data.success) {
        toast.success(`Daftar ${namesArray.length} peserta finalis diperbarui!`);
        setShowParticipantsInput(false);
        fetchStandingsData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui daftar peserta');
    }
  };

  const handlePlacementChange = async (participantId, matchNum, placementVal) => {
    try {
      const response = await api.put(`/internal/events/${event.id}/standings/results`, {
        participant_id: participantId,
        match_number: matchNum,
        placement: placementVal ? Number(placementVal) : null
      });

      if (response.data.success) {
        setStandings(response.data.standings);
      }
    } catch (_) {
      toast.error('Gagal menyimpan skor match');
    }
  };

  const handleSyncToPrizes = async () => {
    if (!window.confirm(`Sinkronkan Top ${leagueConfig.podium_count} pemenang ke daftar Hadiah Event?`)) return;
    setSavingSync(true);
    try {
      const response = await api.post(`/internal/events/${event.id}/standings/sync-prizes`);
      if (response.data.success) {
        toast.success(response.data.message || 'Pemenang berhasil disinkronkan ke Modul Hadiah!');
        if (onStandingsUpdated) onStandingsUpdated();
      }
    } catch (_) {
      toast.error('Gagal menyinkronkan pemenang ke hadiah');
    } finally {
      setSavingSync(false);
    }
  };

  if (!event) return null;

  const totalMatches = Number(leagueConfig.total_matches || 3);
  const matchArray = Array.from({ length: totalMatches }, (_, i) => i + 1);

  const filteredStandings = standings.filter(s =>
    !searchQuery.trim() || (s.player_name || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Papan Skor & Standings Liga - ${event.title}`} maxWidth="max-w-6xl">
      <div className="space-y-4">
        {/* Top Actions & Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Sistem Poin Liga Standings</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {totalMatches} Match Configured
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Top {leagueConfig.podium_count} Podium Winners
                </span>
              </div>
              <p className="text-xs text-slate-400">Total {standings.length} Peserta Finalis | Tie-breaker berdasarkan posisi terbaik</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowParticipantsInput(!showParticipantsInput)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Kelola Peserta ({standings.length})
            </button>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-4 h-4" /> Pengaturan Poin & Match
            </button>
            <button
              onClick={handleSyncToPrizes}
              disabled={savingSync || standings.length === 0}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Sync Top {leagueConfig.podium_count} ke Hadiah
            </button>
          </div>
        </div>

        {/* Panel 1: Participants Input Sub-Panel */}
        {showParticipantsInput && (
          <div className="p-4 bg-slate-900/95 rounded-2xl border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Kelola Daftar Peserta / Tim Finalis (1 Nama per Baris)
              </h5>
              <span className="text-[11px] text-slate-400">Pisahkan nama dengan enter</span>
            </div>
            <textarea
              rows={6}
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              placeholder="Contoh:&#10;Team Alpha&#10;Team Omega&#10;Player Delta"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowParticipantsInput(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSaveParticipants}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
              >
                Simpan Daftar Peserta
              </button>
            </div>
          </div>
        )}

        {/* Panel 2: Point & Match Configuration Panel */}
        {showConfig && (
          <div className="p-4 bg-slate-900/95 rounded-2xl border border-purple-500/30 space-y-4">
            <h5 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-4 h-4" /> Pengaturan Fleksibel Match & Skema Poin Liga
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Jumlah Match Final</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={leagueConfig.total_matches}
                  onChange={(e) => setLeagueConfig({ ...leagueConfig, total_matches: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Jumlah Pemenang Podium (Top N)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={leagueConfig.podium_count}
                  onChange={(e) => setLeagueConfig({ ...leagueConfig, podium_count: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Batas Maksimal Finalis</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={leagueConfig.max_finalists}
                  onChange={(e) => setLeagueConfig({ ...leagueConfig, max_finalists: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase">
                  Skema Poin Per-Peringkat Match (Placement Points)
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Jumlah Rank Berpoin:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={schemaRankCount}
                    onChange={(e) => setSchemaRankCount(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-0.5 bg-slate-950 border border-slate-700 rounded text-xs text-cyan-300 font-bold text-center"
                  />
                  <button
                    type="button"
                    onClick={() => applyPresetSchema(5)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-purple-600/40 text-[10px] text-purple-300 rounded font-semibold border border-purple-500/30 transition-colors"
                  >
                    Top 5
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetSchema(10)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-purple-600/40 text-[10px] text-purple-300 rounded font-semibold border border-purple-500/30 transition-colors"
                  >
                    Top 10
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetSchema(20)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-purple-600/40 text-[10px] text-purple-300 rounded font-semibold border border-purple-500/30 transition-colors"
                  >
                    Top 20
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                {Array.from({ length: schemaRankCount }, (_, i) => i + 1).map(rankNum => (
                  <div key={rankNum} className="p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
                    <span className="block text-[10px] font-bold text-slate-400">#{rankNum}</span>
                    <input
                      type="number"
                      min="0"
                      value={leagueConfig.point_schema?.[rankNum] !== undefined ? leagueConfig.point_schema[rankNum] : ''}
                      onChange={(e) => {
                        const val = e.target.value !== '' ? Number(e.target.value) : 0;
                        setLeagueConfig({
                          ...leagueConfig,
                          point_schema: {
                            ...(leagueConfig.point_schema || {}),
                            [rankNum]: val
                          }
                        });
                      }}
                      className="w-full px-1 py-0.5 bg-slate-900 text-center rounded text-xs text-emerald-300 font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfig(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
              >
                Simpan Pengaturan
              </button>
            </div>
          </div>
        )}

        {/* Main Standings Table Matrix */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Memuat klasemen poin liga...</div>
        ) : standings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
            <p>Belum ada peserta finalis di event liga ini.</p>
            <button
              onClick={() => setShowParticipantsInput(true)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
            >
              + Tambah Daftar Peserta Finalis
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Realtime Search Bar for Participants */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama peserta / tim finalis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1.5 text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Menampilkan <span className="font-bold text-cyan-300">{filteredStandings.length}</span> dari {standings.length} Peserta
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-3 py-3 text-center w-12">Rank</th>
                    <th className="px-4 py-3">Nama Peserta / Tim</th>
                    {matchArray.map(mNum => (
                      <th key={mNum} className="px-2 py-3 text-center w-24">
                        Match {mNum}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-bold text-emerald-400 w-28">Total Poin</th>
                    <th className="px-4 py-3">Aturan Tie-Breaker</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStandings.map((item) => {
                    const isPodium = item.rank <= (leagueConfig.podium_count || 3);
                    return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-900/60 transition-colors ${
                        isPodium ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Rank Badge */}
                      <td className="px-3 py-2.5 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-mono ${
                            item.rank === 1
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                              : item.rank === 2
                              ? 'bg-slate-300 text-slate-950 font-black'
                              : item.rank === 3
                              ? 'bg-amber-700 text-white font-black'
                              : isPodium
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.rank}
                        </span>
                      </td>

                      {/* Player Name */}
                      <td className="px-4 py-2.5 font-bold text-white flex items-center gap-2">
                        <span>{item.player_name}</span>
                        {isPodium && (
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            Podium #{item.rank}
                          </span>
                        )}
                      </td>

                      {/* Match Placements Inputs */}
                      {matchArray.map(mNum => {
                        const val = item.matches?.[mNum] !== undefined ? item.matches[mNum] : '';
                        const pts = val ? leagueConfig.point_schema?.[val] || 0 : null;

                        return (
                          <td key={mNum} className="px-2 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <select
                                value={val}
                                onChange={(e) => handlePlacementChange(item.id, mNum, e.target.value)}
                                className="px-1.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500 text-center"
                              >
                                <option value="">-</option>
                                {Array.from({ length: Math.max(20, standings.length, schemaRankCount) }, (_, idx) => idx + 1).map(pRank => (
                                  <option key={pRank} value={pRank}>
                                    #{pRank}
                                  </option>
                                ))}
                              </select>
                              {pts !== null && (
                                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                  (+{pts})
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Total Points */}
                      <td className="px-4 py-2.5 text-center font-bold text-sm text-emerald-400 font-mono">
                        {item.total_points} pts
                      </td>

                      {/* Tie-breaker Note */}
                      <td className="px-4 py-2.5 text-xs text-slate-400">
                        {item.tie_note ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                            <Sparkles className="w-3 h-3 text-purple-400" /> {item.tie_note}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600">Posisi Terbaik #{item.best_placement}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </Modal>
  );
};
