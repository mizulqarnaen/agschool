import { JsonRepository } from './baseRepository.js';
import { memberRepository } from './memberRepository.js';

export class BrandAmbassadorRepository extends JsonRepository {
  constructor() {
    super('brand_ambassadors.json');
    this.autoLinkExistingData();
  }

  autoLinkExistingData() {
    try {
      const ambassadors = this.readAll();
      const members = memberRepository.readAll();
      let ambassadorsUpdated = false;

      for (const ba of ambassadors) {
        if (ba.deleted_at) continue;

        let linkedMember = null;
        if (ba.member_id) {
          linkedMember = members.find(m => m.id === ba.member_id);
        }

        if (!linkedMember) {
          // Try matching by roblox_username / ign_tag or display_name / name
          const rUser = (ba.roblox_username || '').toLowerCase().trim();
          const dName = (ba.display_name || '').toLowerCase().trim();

          linkedMember = members.find(m =>
            (m.ign_tag || '').toLowerCase().trim() === rUser ||
            (m.name || '').toLowerCase().trim() === dName
          );

          if (linkedMember) {
            ba.member_id = linkedMember.id;
            ambassadorsUpdated = true;
          } else {
            // Auto-create master member in members.json
            const newMember = memberRepository.create({
              name: ba.display_name || ba.roblox_username,
              entity_type: 'Staff',
              categories: ['Official BA'],
              role: 'Official BA',
              ign_tag: ba.roblox_username || '',
              discord_username: ba.discord_username || '',
              bank_accounts: [],
              monthly_salary_idr: 0,
              joined_date: ba.joined_date || new Date().toISOString().split('T')[0],
              status: 'active',
              is_brand_ambassador: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

            ba.member_id = newMember.id;
            ambassadorsUpdated = true;
          }
        }

        if (linkedMember && !linkedMember.is_brand_ambassador) {
          memberRepository.update(linkedMember.id, { is_brand_ambassador: true, updated_at: new Date().toISOString() });
        }
      }

      if (ambassadorsUpdated) {
        this.writeAll(ambassadors);
      }
    } catch (err) {
      console.error('Error during autoLinkExistingData:', err);
    }
  }

  resolveLinkedData(ba) {
    if (!ba.member_id) return ba;
    const member = memberRepository.findById(ba.member_id);
    if (!member) return ba;

    return {
      ...ba,
      display_name: ba.display_name || member.name,
      roblox_username: ba.roblox_username || member.ign_tag || member.name,
      discord_username: ba.discord_username || member.discord_username || '',
      joined_date: ba.joined_date || member.joined_date || ''
    };
  }

  getPublicBAs(filters = {}) {
    let list = this.readAll().filter(b => b.status === 'public' && !b.deleted_at);

    list = list.map(b => this.resolveLinkedData(b));

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(b =>
        (b.display_name || '').toLowerCase().includes(q) ||
        (b.roblox_username || '').toLowerCase().includes(q) ||
        (b.title || '').toLowerCase().includes(q) ||
        (b.specialty || '').toLowerCase().includes(q)
      );
    }

    if (filters.featured_only === 'true' || filters.featured_only === true) {
      list = list.filter(b => b.is_featured);
    }

    if (filters.role) {
      const r = filters.role.toLowerCase();
      list = list.filter(b => (b.title || '').toLowerCase().includes(r));
    }

    // Sort by is_featured DESC -> display_order ASC -> joined_date DESC -> id DESC
    return list.sort((a, b) => {
      if (b.is_featured !== a.is_featured) {
        return b.is_featured ? 1 : -1;
      }
      const orderA = a.display_order ?? 999;
      const orderB = b.display_order ?? 999;
      if (orderA !== orderB) return orderA - orderB;

      const dateA = a.joined_date ? new Date(a.joined_date).getTime() : 0;
      const dateB = b.joined_date ? new Date(b.joined_date).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;

      return (b.id || 0) - (a.id || 0);
    });
  }

  getInternalBAs(filters = {}) {
    let list = this.readAll().filter(b => !b.deleted_at);

    list = list.map(b => this.resolveLinkedData(b));

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(b =>
        (b.display_name || '').toLowerCase().includes(q) ||
        (b.roblox_username || '').toLowerCase().includes(q) ||
        (b.title || '').toLowerCase().includes(q)
      );
    }

    if (filters.status) {
      list = list.filter(b => b.status === filters.status);
    }

    return list.sort((a, b) => {
      const orderA = a.display_order ?? 999;
      const orderB = b.display_order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (b.id || 0) - (a.id || 0);
    });
  }

  resolveAvatarUrl(username, customUrl, userId) {
    if (customUrl && customUrl.trim()) {
      return customUrl.trim();
    }
    if (userId && String(userId).trim()) {
      return `https://thumbs.roblox.com/v1/users/avatar-headshot?userIds=${String(userId).trim()}&size=420x420&format=Png&isCircular=false`;
    }
    return `https://images.rbxcdn.com/30x30_icon_Roblox.png`;
  }
}

export const brandAmbassadorRepository = new BrandAmbassadorRepository();
