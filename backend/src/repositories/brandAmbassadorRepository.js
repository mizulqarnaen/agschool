import { JsonRepository } from './baseRepository.js';

export class BrandAmbassadorRepository extends JsonRepository {
  constructor() {
    super('brand_ambassadors.json');
  }

  getPublicBAs(filters = {}) {
    let list = this.readAll().filter(b => b.status === 'public' && !b.deleted_at);

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
    // Default fallback or Roblox avatar placeholder
    return `https://images.rbxcdn.com/30x30_icon_Roblox.png`;
  }
}

export const brandAmbassadorRepository = new BrandAmbassadorRepository();
