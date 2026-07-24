import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

export class JsonRepository {
  constructor(fileName) {
    this.filePath = path.join(DATA_DIR, fileName);
    this.ensureFileExists();
  }

  ensureFileExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf8');
    }
  }

  readAll(includeDeleted = false) {
    try {
      this.ensureFileExists();
      const content = fs.readFileSync(this.filePath, 'utf8');
      const items = JSON.parse(content || '[]');
      if (includeDeleted) return items;
      return items.filter(item => !item.deleted_at);
    } catch (err) {
      console.error(`Error reading ${this.filePath}:`, err);
      return [];
    }
  }

  saveAll(items) {
    const tempPath = `${this.filePath}.tmp`;
    try {
      fs.writeFileSync(tempPath, JSON.stringify(items, null, 2), 'utf8');
      fs.renameSync(tempPath, this.filePath);
      return true;
    } catch (err) {
      console.error(`Error saving ${this.filePath}:`, err);
      if (fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch (_) {}
      }
      return false;
    }
  }

  findById(id) {
    const items = this.readAll(true);
    return items.find(item => item.id === Number(id) && !item.deleted_at) || null;
  }

  create(data) {
    const items = this.readAll(true);
    const maxId = items.reduce((max, item) => (item.id > max ? item.id : max), 0);
    const newItem = {
      id: maxId + 1,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    };
    items.push(newItem);
    this.saveAll(items);
    return newItem;
  }

  update(id, updateData) {
    const items = this.readAll(true);
    const index = items.findIndex(item => item.id === Number(id) && !item.deleted_at);
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    items[index] = updatedItem;
    this.saveAll(items);
    return updatedItem;
  }

  softDelete(id) {
    const items = this.readAll(true);
    const index = items.findIndex(item => item.id === Number(id) && !item.deleted_at);
    if (index === -1) return false;

    items[index].deleted_at = new Date().toISOString();
    items[index].updated_at = new Date().toISOString();
    return this.saveAll(items);
  }
}
