import { JsonRepository } from '../repositories/baseRepository.js';

class LoggerService extends JsonRepository {
  constructor() {
    super('logs.json');
  }

  logActivity(userId, action, moduleName, entityId = null, details = null) {
    try {
      this.create({
        user_id: userId ? Number(userId) : null,
        action,
        module: moduleName,
        entity_id: entityId ? Number(entityId) : null,
        details_json: details ? JSON.stringify(details) : null,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to record activity log:', err);
    }
  }

  getLogs(limit = 100) {
    const logs = this.readAll(true);
    return logs.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    }).slice(0, limit);
  }
}

export const loggerService = new LoggerService();
