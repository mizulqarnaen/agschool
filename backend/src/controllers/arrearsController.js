import { arrearsRepository } from '../repositories/arrearsRepository.js';
import memberRepository from '../repositories/memberRepository.js';
import { loggerService } from '../services/loggerService.js';

// Public GET Endpoint: Fetch Arrears data & stats
export const getPublicArrears = (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;

    const allRecords = arrearsRepository.getAllWithMembers({ search, status });
    const stats = arrearsRepository.getSummaryStats();

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedRecords = allRecords.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      data: {
        records: paginatedRecords,
        stats,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(allRecords.length / limitNum) || 1,
          total_items: allRecords.length,
          limit: limitNum
        }
      }
    });
  } catch (err) {
    console.error('Error fetching public arrears:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data tunggakan.' });
  }
};

// Admin GET Endpoint: Fetch All Arrears Data
export const getAdminArrears = (req, res) => {
  try {
    const records = arrearsRepository.getAllWithMembers();
    const stats = arrearsRepository.getSummaryStats();
    res.json({ success: true, data: { records, stats } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data tunggakan admin.' });
  }
};

// Admin POST Endpoint: Create New Arrears Entry
export const createAdminArrears = (req, res) => {
  try {
    const {
      member_id,
      full_name,
      discord_username,
      roblox_username,
      role,
      juli_amount,
      agustus_amount,
      status = 'Pending',
      notes
    } = req.body;

    const juliNum = Number(juli_amount || 0);
    const agustusNum = Number(agustus_amount || 0);
    const totalNum = juliNum + agustusNum;

    // Check matching member in directory if member_id is provided
    let matchedMember = null;
    if (member_id) {
      const members = memberRepository.readAll();
      matchedMember = members.find(m => Number(m.id) === Number(member_id));
    }

    const newRecord = arrearsRepository.create({
      member_id: member_id ? Number(member_id) : null,
      full_name: full_name || matchedMember?.full_name || matchedMember?.ign_tag || 'Staff / Member',
      discord_username: discord_username || matchedMember?.discord_username || '',
      roblox_username: roblox_username || matchedMember?.roblox_username || '',
      role: role || (matchedMember ? (Array.isArray(matchedMember.roles) ? matchedMember.roles.join(', ') : matchedMember.role) : 'Staff'),
      juli_amount: juliNum,
      agustus_amount: agustusNum,
      total_amount: totalNum,
      currency: 'IDR',
      status: status || 'Pending',
      notes: notes || ''
    });

    if (req.user) {
      loggerService.logActivity(req.user.id, 'CREATE_ARREARS_RECORD', 'Arrears', newRecord.id, { full_name: newRecord.full_name, total_amount: totalNum });
    }

    res.status(201).json({ success: true, data: newRecord });
  } catch (err) {
    console.error('Error creating arrears record:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data tunggakan baru.' });
  }
};

// Admin PUT Endpoint: Update Existing Arrears Entry
export const updateAdminArrears = (req, res) => {
  try {
    const { id } = req.params;
    const {
      member_id,
      full_name,
      discord_username,
      roblox_username,
      role,
      juli_amount,
      agustus_amount,
      status,
      notes
    } = req.body;

    const existing = arrearsRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Data tunggakan tidak ditemukan.' });
    }

    const juliNum = juli_amount !== undefined ? Number(juli_amount) : existing.juli_amount;
    const agustusNum = agustus_amount !== undefined ? Number(agustus_amount) : existing.agustus_amount;
    const totalNum = juliNum + agustusNum;

    const updated = arrearsRepository.update(id, {
      ...(member_id !== undefined && { member_id: member_id ? Number(member_id) : null }),
      ...(full_name !== undefined && { full_name }),
      ...(discord_username !== undefined && { discord_username }),
      ...(roblox_username !== undefined && { roblox_username }),
      ...(role !== undefined && { role }),
      juli_amount: juliNum,
      agustus_amount: agustusNum,
      total_amount: totalNum,
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes })
    });

    if (req.user) {
      loggerService.logActivity(req.user.id, 'UPDATE_ARREARS_RECORD', 'Arrears', id, req.body);
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating arrears record:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data tunggakan.' });
  }
};

// Admin DELETE Endpoint: Delete Arrears Entry
export const deleteAdminArrears = (req, res) => {
  try {
    const { id } = req.params;
    const existing = arrearsRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Data tunggakan tidak ditemukan.' });
    }

    arrearsRepository.delete(id);

    if (req.user) {
      loggerService.logActivity(req.user.id, 'DELETE_ARREARS_RECORD', 'Arrears', id, { full_name: existing.full_name });
    }

    res.json({ success: true, message: 'Data tunggakan berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleting arrears record:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus data tunggakan.' });
  }
};
