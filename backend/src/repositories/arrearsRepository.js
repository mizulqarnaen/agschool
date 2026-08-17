import { JsonRepository } from './baseRepository.js';
import memberRepository from './memberRepository.js';

class ArrearsRepository extends JsonRepository {
  constructor() {
    super('arrears.json');
  }

  // Read all arrears with Member directory join and automatic DESCENDING sort by total_amount
  getAllWithMembers(filters = {}) {
    const records = this.readAll();
    const members = memberRepository.readAll();

    let result = records.map(record => {
      const matchedMember = members.find(m => Number(m.id) === Number(record.member_id));
      let rolesStr = record.role || '';
      if (!rolesStr && matchedMember) {
        if (Array.isArray(matchedMember.roles) && matchedMember.roles.length > 0) {
          rolesStr = matchedMember.roles.join(', ');
        } else if (matchedMember.role) {
          rolesStr = matchedMember.role;
        }
      }

      return {
        ...record,
        full_name: record.full_name || matchedMember?.full_name || matchedMember?.ign_tag || 'Staff / Member',
        discord_username: record.discord_username || matchedMember?.discord_username || '',
        roblox_username: record.roblox_username || matchedMember?.roblox_username || '',
        role: rolesStr || 'Staff',
        juli_amount: Number(record.juli_amount || 0),
        agustus_amount: Number(record.agustus_amount || 0),
        total_amount: Number(record.total_amount !== undefined ? record.total_amount : (Number(record.juli_amount || 0) + Number(record.agustus_amount || 0))),
        currency: record.currency || 'IDR'
      };
    });

    // Apply Status Filter if provided
    if (filters.status) {
      const sFilter = String(filters.status).trim().toLowerCase();
      result = result.filter(r => String(r.status || '').trim().toLowerCase() === sFilter);
    }

    // Apply Search Query if provided (searches full_name, discord_username, roblox_username, role, notes)
    if (filters.search) {
      const q = String(filters.search).trim().toLowerCase();
      result = result.filter(r =>
        (r.full_name || '').toLowerCase().includes(q) ||
        (r.discord_username || '').toLowerCase().includes(q) ||
        (r.roblox_username || '').toLowerCase().includes(q) ||
        (r.role || '').toLowerCase().includes(q) ||
        (r.notes || '').toLowerCase().includes(q)
      );
    }

    // Multi-tier DESCENDING sorting by Total Arrears Amount (highest first)
    result.sort((a, b) => {
      if (b.total_amount !== a.total_amount) {
        return b.total_amount - a.total_amount;
      }
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });

    return result;
  }

  // Calculate summary statistics
  getSummaryStats() {
    const all = this.getAllWithMembers();
    const total_amount = all.reduce((sum, r) => sum + (r.total_amount || 0), 0);
    const total_juli = all.reduce((sum, r) => sum + (r.juli_amount || 0), 0);
    const total_agustus = all.reduce((sum, r) => sum + (r.agustus_amount || 0), 0);
    const total_recipients = all.length;
    const pending_count = all.filter(r => r.status === 'Pending' || !r.status).length;
    const processing_count = all.filter(r => r.status === 'Processing').length;
    const paid_count = all.filter(r => r.status === 'Paid' || r.status === 'Completed').length;

    return {
      total_amount,
      total_juli,
      total_agustus,
      total_recipients,
      pending_count,
      processing_count,
      paid_count
    };
  }
}

export const arrearsRepository = new ArrearsRepository();
