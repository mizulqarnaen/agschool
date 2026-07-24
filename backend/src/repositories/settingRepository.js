import { JsonRepository } from './baseRepository.js';

export class SettingRepository extends JsonRepository {
  constructor() {
    super('settings.json');
  }

  getSettingsMap() {
    const settings = this.readAll();
    const map = {};
    settings.forEach(s => {
      map[s.setting_key] = s.setting_value;
    });
    return map;
  }

  updateSettingsMap(updates) {
    const settings = this.readAll();
    Object.keys(updates).forEach(key => {
      const existing = settings.find(s => s.setting_key === key);
      if (existing) {
        existing.setting_value = String(updates[key]);
        existing.updated_at = new Date().toISOString();
      } else {
        settings.push({
          id: settings.length + 1,
          setting_key: key,
          setting_value: String(updates[key]),
          updated_at: new Date().toISOString()
        });
      }
    });
    this.saveAll(settings);
    return this.getSettingsMap();
  }
}

export const settingRepository = new SettingRepository();
