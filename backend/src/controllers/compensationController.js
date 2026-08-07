import compensationRepository from '../repositories/compensationRepository.js';

// Public GET compensation search & summary endpoint
export const getPublicCompensations = async (req, res) => {
  try {
    const { search = '', campaign_id, status, page = 1, limit = 12 } = req.query;
    const campaigns = await compensationRepository.getAllCampaigns();
    const publishedCampaigns = campaigns.filter(c => c.is_published);
    const publishedCampaignIds = new Set(publishedCampaigns.map(c => c.id));

    let allRecords = await compensationRepository.getAllRecords();
    // Filter only published campaigns for public view
    allRecords = allRecords.filter(r => publishedCampaignIds.has(r.campaign_id));

    if (campaign_id) {
      allRecords = allRecords.filter(r => r.campaign_id === campaign_id);
    }

    if (status) {
      allRecords = allRecords.filter(r => String(r.payment_status).toLowerCase() === String(status).toLowerCase());
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      allRecords = allRecords.filter(r =>
        (r.discord_username && r.discord_username.toLowerCase().includes(q)) ||
        (r.roblox_username && r.roblox_username.toLowerCase().includes(q)) ||
        (r.full_name && r.full_name.toLowerCase().includes(q))
      );
    }

    // Sort: Completed -> Processing -> Pending, then by date DESC
    const getPrio = (st) => {
      const s = String(st || '').toLowerCase();
      if (s === 'completed') return 1;
      if (s === 'processing') return 2;
      return 3;
    };

    allRecords.sort((a, b) => {
      const prioDiff = getPrio(a.payment_status) - getPrio(b.payment_status);
      if (prioDiff !== 0) return prioDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Compute Summary Stats
    const totalRecipients = allRecords.length;
    const completedCount = allRecords.filter(r => String(r.payment_status).toLowerCase() === 'completed').length;
    const pendingCount = allRecords.filter(r => String(r.payment_status).toLowerCase() === 'pending').length;
    const processingCount = allRecords.filter(r => String(r.payment_status).toLowerCase() === 'processing').length;
    const totalAmount = allRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const totalPages = Math.ceil(totalRecipients / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedRecords = allRecords.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      data: {
        stats: {
          total_recipients: totalRecipients,
          completed_count: completedCount,
          pending_count: pendingCount,
          processing_count: processingCount,
          total_amount: totalAmount
        },
        campaigns: publishedCampaigns,
        pagination: {
          current_page: pageNum,
          total_pages: totalPages,
          total_items: totalRecipients,
          limit: limitNum
        },
        records: paginatedRecords
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Internal Admin Controllers
export const getAdminCampaigns = async (req, res) => {
  try {
    const campaigns = await compensationRepository.getAllCampaigns();
    return res.json({ success: true, data: campaigns });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminCampaign = async (req, res) => {
  try {
    const campaign = await compensationRepository.createCampaign(req.body);
    return res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminCampaign = async (req, res) => {
  try {
    const campaign = await compensationRepository.updateCampaign(req.params.id, req.body);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    return res.json({ success: true, data: campaign });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminCampaign = async (req, res) => {
  try {
    await compensationRepository.deleteCampaign(req.params.id);
    return res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminRecords = async (req, res) => {
  try {
    const records = await compensationRepository.getAllRecords();
    return res.json({ success: true, data: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminRecord = async (req, res) => {
  try {
    const record = await compensationRepository.createRecord(req.body);
    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminRecord = async (req, res) => {
  try {
    const record = await compensationRepository.updateRecord(req.params.id, req.body);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    return res.json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAdminRecord = async (req, res) => {
  try {
    await compensationRepository.deleteRecord(req.params.id);
    return res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
