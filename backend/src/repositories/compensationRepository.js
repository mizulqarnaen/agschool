import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { memberRepository } from './memberRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/compensations.json');

class CompensationRepository {
  async _readData() {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') {
        const initial = { campaigns: [], records: [] };
        await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2));
        return initial;
      }
      throw err;
    }
  }

  async _writeData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  // --- Campaign Methods ---
  async getAllCampaigns() {
    const data = await this._readData();
    return data.campaigns || [];
  }

  async getCampaignById(id) {
    const campaigns = await this.getAllCampaigns();
    return campaigns.find(c => c.id === id) || null;
  }

  async createCampaign(campaignData) {
    const data = await this._readData();
    const newCampaign = {
      id: `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: campaignData.name || 'Compensation Campaign',
      description: campaignData.description || '',
      default_amount: Number(campaignData.default_amount || 0),
      is_published: campaignData.is_published ?? true,
      created_at: new Date().toISOString()
    };
    data.campaigns = [newCampaign, ...(data.campaigns || [])];
    await this._writeData(data);
    return newCampaign;
  }

  async updateCampaign(id, updateData) {
    const data = await this._readData();
    const idx = (data.campaigns || []).findIndex(c => c.id === id);
    if (idx === -1) return null;

    data.campaigns[idx] = {
      ...data.campaigns[idx],
      ...updateData,
      default_amount: updateData.default_amount !== undefined ? Number(updateData.default_amount) : data.campaigns[idx].default_amount,
      updated_at: new Date().toISOString()
    };
    await this._writeData(data);
    return data.campaigns[idx];
  }

  async deleteCampaign(id) {
    const data = await this._readData();
    data.campaigns = (data.campaigns || []).filter(c => c.id !== id);
    data.records = (data.records || []).filter(r => r.campaign_id !== id);
    await this._writeData(data);
    return true;
  }

  // --- Record Methods (with dynamic Member Join) ---
  async getAllRecords() {
    const data = await this._readData();
    const members = memberRepository.readAll() || [];
    const memberMap = new Map(members.map(m => [m.id, m]));

    return (data.records || []).map(r => {
      const member = memberMap.get(r.member_id) || {};
      return {
        ...r,
        full_name: member.full_name || r.full_name || 'Member Komunitas',
        discord_username: member.discord_username || r.discord_username || '',
        roblox_username: member.roblox_username || r.roblox_username || '',
        tiktok_username: member.tiktok_username || r.tiktok_username || '',
        avatar_url: member.avatar_url || null,
        bank_name: member.bank_name || '',
        bank_account_number: member.bank_account_number || ''
      };
    });
  }

  async getRecordsByCampaign(campaignId) {
    const records = await this.getAllRecords();
    return records.filter(r => r.campaign_id === campaignId);
  }

  async createRecord(recordData) {
    const data = await this._readData();
    const newRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      campaign_id: recordData.campaign_id,
      member_id: recordData.member_id,
      amount: Number(recordData.amount || 0),
      payment_status: recordData.payment_status || 'Pending', // Pending, Processing, Completed
      payment_date: recordData.payment_date || null,
      notes: recordData.notes || '',
      created_at: new Date().toISOString()
    };
    data.records = [newRecord, ...(data.records || [])];
    await this._writeData(data);
    return newRecord;
  }

  async updateRecord(id, updateData) {
    const data = await this._readData();
    const idx = (data.records || []).findIndex(r => r.id === id);
    if (idx === -1) return null;

    data.records[idx] = {
      ...data.records[idx],
      ...updateData,
      amount: updateData.amount !== undefined ? Number(updateData.amount) : data.records[idx].amount,
      updated_at: new Date().toISOString()
    };
    await this._writeData(data);
    return data.records[idx];
  }

  async deleteRecord(id) {
    const data = await this._readData();
    data.records = (data.records || []).filter(r => r.id !== id);
    await this._writeData(data);
    return true;
  }
}

export default new CompensationRepository();
