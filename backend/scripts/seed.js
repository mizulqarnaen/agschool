import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const writeJsonIfMissing = (fileName, data) => {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Seeded ${fileName}`);
  }
};

const runSeed = async () => {
  // Roles
  writeJsonIfMissing('roles.json', [
    { id: 1, name: 'Administrator', slug: 'administrator', description: 'Full system management and governance' },
    { id: 2, name: 'Finance Team', slug: 'finance', description: 'Manages operational income, expenses, and member payouts' },
    { id: 3, name: 'Secretary', slug: 'secretary', description: 'Manages community events, posters, and prize distributions' }
  ]);

  // Default Password Hashing
  const adminPasswordHash = await bcrypt.hash('Password123!', 10);
  const financePasswordHash = await bcrypt.hash('Finance123!', 10);
  const secretaryPasswordHash = await bcrypt.hash('Secretary123!', 10);

  // Users
  writeJsonIfMissing('users.json', [
    {
      id: 1,
      username: 'admin',
      email: 'admin@agschool.com',
      full_name: 'System Administrator',
      password_hash: adminPasswordHash,
      role_id: 1,
      role_slug: 'administrator',
      status: 'active',
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      id: 2,
      username: 'finance',
      email: 'finance@agschool.com',
      full_name: 'Finance Manager',
      password_hash: financePasswordHash,
      role_id: 2,
      role_slug: 'finance',
      status: 'active',
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      id: 3,
      username: 'secretary',
      email: 'secretary@agschool.com',
      full_name: 'School Secretary',
      password_hash: secretaryPasswordHash,
      role_id: 3,
      role_slug: 'secretary',
      status: 'active',
      last_login_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ]);

  // Members
  writeJsonIfMissing('members.json', [
    {
      id: 1,
      full_name: 'Alex Tan',
      email: 'alex@agschool.com',
      phone: '+65 9123 4567',
      bank_name: 'DBS Bank',
      bank_account_number: '120-94812-3',
      bank_account_name: 'Alex Tan',
      category: 'BA',
      status: 'active',
      joined_date: '2025-01-15',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      id: 2,
      full_name: 'Brenda Lim',
      email: 'brenda@agschool.com',
      phone: '+65 9234 5678',
      bank_name: 'OCBC Bank',
      bank_account_number: '588-12349-1',
      bank_account_name: 'Brenda Lim',
      category: 'Caster',
      status: 'active',
      joined_date: '2025-02-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      id: 3,
      full_name: 'Charlie Wong',
      email: 'charlie@agschool.com',
      phone: '+65 9345 6789',
      bank_name: 'UOB Bank',
      bank_account_number: '392-10492-8',
      bank_account_name: 'Charlie Wong',
      category: 'Maintainer',
      status: 'active',
      joined_date: '2025-03-10',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ]);

  // Settings
  writeJsonIfMissing('settings.json', [
    { setting_key: 'org_name', setting_value: 'AG School' },
    { setting_key: 'contact_email', setting_value: 'contact@agschool.com' },
    { setting_key: 'exchange_rate_sgd_idr', setting_value: '11800.00' },
    { setting_key: 'default_currency', setting_value: 'SGD' }
  ]);

  // Events
  writeJsonIfMissing('events.json', [
    {
      id: 1,
      title: 'AG School Valorant Championship 2026',
      description: 'The premier community tournament featuring top regional teams competing for glory and prizes.',
      poster_url: null,
      event_type: 'Tournament',
      start_date: '2026-08-10',
      end_date: '2026-08-12',
      registration_status: 'Open',
      event_status: 'Scheduled',
      total_prize_pool: 2500.00,
      created_by_user_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      id: 2,
      title: 'AG School Summer Esports Workshop',
      description: 'Educational workshop covering shoutcasting, team management, and match analysis.',
      poster_url: null,
      event_type: 'Workshop',
      start_date: '2026-07-01',
      end_date: '2026-07-02',
      registration_status: 'Closed',
      event_status: 'Completed',
      total_prize_pool: 500.00,
      created_by_user_id: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ]);

  // Prizes
  writeJsonIfMissing('prizes.json', [
    {
      id: 1,
      event_id: 1,
      prize_title: 'Champion',
      winner_name: 'Team Alpha',
      reward_description: 'SGD 1,500 + Trophy',
      payment_status: 'Processing',
      payment_date: null,
      internal_notes: 'Awaiting final bank verification',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      id: 2,
      event_id: 1,
      prize_title: 'Runner-Up',
      winner_name: 'Team Omega',
      reward_description: 'SGD 1,000',
      payment_status: 'Unpaid',
      payment_date: null,
      internal_notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      id: 3,
      event_id: 2,
      prize_title: 'Best Presenter Award',
      winner_name: 'Brenda Lim',
      reward_description: 'SGD 500 Gift Voucher',
      payment_status: 'Paid',
      payment_date: '2026-07-03',
      internal_notes: 'Paid via bank transfer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ]);

  // Incomes
  writeJsonIfMissing('incomes.json', [
    {
      id: 1,
      transaction_date: '2026-07-10',
      category: 'Sponsorship',
      source: 'Global Tech Corp',
      description: 'Title Sponsorship for Valorant Championship',
      amount: 5000.00,
      currency: 'SGD',
      notes: 'Sponsorship payment received in full.',
      recorded_by_user_id: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ]);

  // Expenses
  writeJsonIfMissing('expenses.json', [
    {
      id: 1,
      transaction_date: '2026-07-12',
      category: 'Logistics',
      description: 'Stage rental & lighting setup',
      amount: 1200.00,
      currency: 'SGD',
      related_event_id: 1,
      notes: 'Invoice #8841',
      recorded_by_user_id: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ]);

  // Internal Payments
  writeJsonIfMissing('payments.json', [
    {
      id: 1,
      member_id: 2,
      payment_category: 'Caster payment',
      amount: 300.00,
      currency: 'SGD',
      status: 'Paid',
      payment_date: '2026-07-03',
      notes: 'Casting fee for Summer Workshop',
      recorded_by_user_id: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ]);

  // Activity Logs
  writeJsonIfMissing('logs.json', []);

  console.log('Seeding process completed successfully!');
};

runSeed();
