import { brandAmbassadorRepository } from '../repositories/brandAmbassadorRepository.js';
import { memberRepository } from '../repositories/memberRepository.js';
import { loggerService } from '../services/loggerService.js';

// --- Public Endpoints ---
export const getPublicBrandAmbassadors = (req, res) => {
  try {
    const list = brandAmbassadorRepository.getPublicBAs(req.query);
    // Sanitize to public exposed fields only
    const sanitized = list.map(b => ({
      id: b.id,
      member_id: b.member_id || null,
      display_name: b.display_name,
      roblox_username: b.roblox_username,
      roblox_user_id: b.roblox_user_id,
      avatar_url: brandAmbassadorRepository.resolveAvatarUrl(b.roblox_username, b.avatar_url, b.roblox_user_id),
      title: b.title,
      short_intro: b.short_intro,
      bio: b.bio,
      nickname: b.nickname,
      motto: b.motto,
      favorite_game: b.favorite_game,
      specialty: b.specialty,
      joined_date: b.joined_date,
      display_order: b.display_order,
      is_featured: !!b.is_featured,
      instagram: b.instagram,
      tiktok: b.tiktok,
      youtube: b.youtube,
      discord_username: b.discord_username
    }));

    res.json({ success: true, data: sanitized });
  } catch (err) {
    console.error('Error fetching public brand ambassadors:', err);
    res.status(500).json({ success: false, message: 'Error fetching brand ambassadors' });
  }
};

export const getPublicBrandAmbassadorDetail = (req, res) => {
  try {
    const { id } = req.params;
    const rawItem = brandAmbassadorRepository.findById(id);

    if (!rawItem || rawItem.status !== 'public' || rawItem.deleted_at) {
      return res.status(404).json({ success: false, message: 'Brand Ambassador not found or not public' });
    }

    const item = brandAmbassadorRepository.resolveLinkedData(rawItem);

    const sanitized = {
      id: item.id,
      member_id: item.member_id || null,
      display_name: item.display_name,
      roblox_username: item.roblox_username,
      roblox_user_id: item.roblox_user_id,
      avatar_url: brandAmbassadorRepository.resolveAvatarUrl(item.roblox_username, item.avatar_url, item.roblox_user_id),
      title: item.title,
      short_intro: item.short_intro,
      bio: item.bio,
      nickname: item.nickname,
      motto: item.motto,
      favorite_game: item.favorite_game,
      specialty: item.specialty,
      joined_date: item.joined_date,
      display_order: item.display_order,
      is_featured: !!item.is_featured,
      instagram: item.instagram,
      tiktok: item.tiktok,
      youtube: item.youtube,
      discord_username: item.discord_username
    };

    res.json({ success: true, data: sanitized });
  } catch (err) {
    console.error('Error fetching brand ambassador detail:', err);
    res.status(500).json({ success: false, message: 'Error fetching brand ambassador detail' });
  }
};

// --- Internal Authenticated Endpoints ---
export const getInternalBrandAmbassadors = (req, res) => {
  try {
    const list = brandAmbassadorRepository.getInternalBAs(req.query);
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('Error fetching internal brand ambassadors:', err);
    res.status(500).json({ success: false, message: 'Error fetching brand ambassadors' });
  }
};

export const createBrandAmbassador = (req, res) => {
  try {
    const {
      member_id, display_name, roblox_username, roblox_user_id, avatar_url,
      title, short_intro, bio, nickname, motto, favorite_game,
      specialty, joined_date, display_order, status, is_featured,
      instagram, tiktok, youtube, discord_username
    } = req.body;

    if (!display_name || !roblox_username || !title) {
      return res.status(400).json({ success: false, message: 'Display Name, Roblox Username, and Role/Title are required.' });
    }

    let linkedMemberId = member_id ? Number(member_id) : null;

    if (linkedMemberId) {
      const m = memberRepository.findById(linkedMemberId);
      if (m) {
        memberRepository.update(m.id, { is_brand_ambassador: true, updated_at: new Date().toISOString() });
      }
    } else {
      // Auto register to master members.json
      const newMember = memberRepository.create({
        name: display_name.trim(),
        entity_type: 'Staff',
        categories: ['Official BA'],
        role: 'Official BA',
        ign_tag: roblox_username.trim(),
        discord_username: discord_username ? discord_username.trim() : '',
        bank_accounts: [],
        monthly_salary_idr: 0,
        joined_date: joined_date || new Date().toISOString().split('T')[0],
        status: 'active',
        is_brand_ambassador: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      linkedMemberId = newMember.id;
    }

    const payload = {
      member_id: linkedMemberId,
      display_name: display_name.trim(),
      roblox_username: roblox_username.trim(),
      roblox_user_id: roblox_user_id ? String(roblox_user_id).trim() : null,
      avatar_url: avatar_url ? avatar_url.trim() : null,
      title: title.trim(),
      short_intro: short_intro ? short_intro.trim() : '',
      bio: bio ? bio.trim() : '',
      nickname: nickname ? nickname.trim() : '',
      motto: motto ? motto.trim() : '',
      favorite_game: favorite_game ? favorite_game.trim() : '',
      specialty: specialty ? specialty.trim() : '',
      joined_date: joined_date || new Date().toISOString().split('T')[0],
      display_order: display_order ? Number(display_order) : 1,
      status: status || 'public',
      is_featured: !!is_featured,
      instagram: instagram ? instagram.trim() : null,
      tiktok: tiktok ? tiktok.trim() : null,
      youtube: youtube ? youtube.trim() : null,
      discord_username: discord_username ? discord_username.trim() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };

    const created = brandAmbassadorRepository.create(payload);
    loggerService.logActivity(req.user.id, 'CREATE_BRAND_AMBASSADOR', 'BrandAmbassador', created.id, { name: created.display_name });

    res.status(201).json({ success: true, data: created, message: 'Brand Ambassador created & synced successfully.' });
  } catch (err) {
    console.error('Error creating brand ambassador:', err);
    res.status(500).json({ success: false, message: err.message || 'Error creating brand ambassador' });
  }
};

export const updateBrandAmbassador = (req, res) => {
  try {
    const { id } = req.params;
    const existing = brandAmbassadorRepository.findById(id);
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ success: false, message: 'Brand Ambassador not found' });
    }

    const {
      member_id, display_name, roblox_username, roblox_user_id, avatar_url,
      title, short_intro, bio, nickname, motto, favorite_game,
      specialty, joined_date, display_order, status, is_featured,
      instagram, tiktok, youtube, discord_username
    } = req.body;

    let targetMemberId = member_id !== undefined ? (member_id ? Number(member_id) : null) : existing.member_id;

    if (targetMemberId) {
      const m = memberRepository.findById(targetMemberId);
      if (m && !m.is_brand_ambassador) {
        memberRepository.update(m.id, { is_brand_ambassador: true, updated_at: new Date().toISOString() });
      }
    }

    const payload = {
      member_id: targetMemberId,
      display_name: display_name !== undefined ? display_name.trim() : existing.display_name,
      roblox_username: roblox_username !== undefined ? roblox_username.trim() : existing.roblox_username,
      roblox_user_id: roblox_user_id !== undefined ? (roblox_user_id ? String(roblox_user_id).trim() : null) : existing.roblox_user_id,
      avatar_url: avatar_url !== undefined ? (avatar_url ? avatar_url.trim() : null) : existing.avatar_url,
      title: title !== undefined ? title.trim() : existing.title,
      short_intro: short_intro !== undefined ? short_intro.trim() : existing.short_intro,
      bio: bio !== undefined ? bio.trim() : existing.bio,
      nickname: nickname !== undefined ? nickname.trim() : existing.nickname,
      motto: motto !== undefined ? motto.trim() : existing.motto,
      favorite_game: favorite_game !== undefined ? favorite_game.trim() : existing.favorite_game,
      specialty: specialty !== undefined ? specialty.trim() : existing.specialty,
      joined_date: joined_date !== undefined ? joined_date : existing.joined_date,
      display_order: display_order !== undefined ? Number(display_order) : existing.display_order,
      status: status !== undefined ? status : existing.status,
      is_featured: is_featured !== undefined ? !!is_featured : existing.is_featured,
      instagram: instagram !== undefined ? (instagram ? instagram.trim() : null) : existing.instagram,
      tiktok: tiktok !== undefined ? (tiktok ? tiktok.trim() : null) : existing.tiktok,
      youtube: youtube !== undefined ? (youtube ? youtube.trim() : null) : existing.youtube,
      discord_username: discord_username !== undefined ? (discord_username ? discord_username.trim() : null) : existing.discord_username,
      updated_at: new Date().toISOString()
    };

    const updated = brandAmbassadorRepository.update(id, payload);
    loggerService.logActivity(req.user.id, 'UPDATE_BRAND_AMBASSADOR', 'BrandAmbassador', id, { name: updated.display_name });

    res.json({ success: true, data: updated, message: 'Brand Ambassador updated successfully.' });
  } catch (err) {
    console.error('Error updating brand ambassador:', err);
    res.status(500).json({ success: false, message: err.message || 'Error updating brand ambassador' });
  }
};

export const toggleFeaturedBrandAmbassador = (req, res) => {
  try {
    const { id } = req.params;
    const existing = brandAmbassadorRepository.findById(id);
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ success: false, message: 'Brand Ambassador not found' });
    }

    const newFeaturedState = !existing.is_featured;
    const updated = brandAmbassadorRepository.update(id, {
      is_featured: newFeaturedState,
      updated_at: new Date().toISOString()
    });

    loggerService.logActivity(req.user.id, 'TOGGLE_FEATURED_BRAND_AMBASSADOR', 'BrandAmbassador', id, { is_featured: newFeaturedState });
    res.json({ success: true, data: updated, message: `Brand Ambassador is ${newFeaturedState ? 'now featured' : 'unfeatured'}.` });
  } catch (err) {
    console.error('Error toggling featured status:', err);
    res.status(500).json({ success: false, message: 'Error toggling featured status' });
  }
};

export const toggleStatusBrandAmbassador = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const existing = brandAmbassadorRepository.findById(id);
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ success: false, message: 'Brand Ambassador not found' });
    }

    const validStatuses = ['public', 'hidden', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be public, hidden, or archived.' });
    }

    const updated = brandAmbassadorRepository.update(id, {
      status,
      updated_at: new Date().toISOString()
    });

    loggerService.logActivity(req.user.id, 'TOGGLE_STATUS_BRAND_AMBASSADOR', 'BrandAmbassador', id, { status });
    res.json({ success: true, data: updated, message: `Status updated to ${status}.` });
  } catch (err) {
    console.error('Error toggling status:', err);
    res.status(500).json({ success: false, message: 'Error toggling status' });
  }
};

export const deleteBrandAmbassador = (req, res) => {
  try {
    const { id } = req.params;
    const existing = brandAmbassadorRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Brand Ambassador not found' });
    }

    // Soft delete / Archive
    const updated = brandAmbassadorRepository.update(id, {
      status: 'archived',
      deleted_at: new Date().toISOString()
    });

    loggerService.logActivity(req.user.id, 'ARCHIVE_BRAND_AMBASSADOR', 'BrandAmbassador', id, { name: existing.display_name });
    res.json({ success: true, message: 'Brand Ambassador archived successfully.' });
  } catch (err) {
    console.error('Error archiving brand ambassador:', err);
    res.status(500).json({ success: false, message: 'Error archiving brand ambassador' });
  }
};
