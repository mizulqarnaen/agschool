import { JsonRepository } from './baseRepository.js';

export class PaymentRepository extends JsonRepository {
  constructor() {
    super('payments.json');
  }

  getFiltered({ memberId, category, status, dateFrom, dateTo }) {
    let payments = this.readAll();
    if (memberId) payments = payments.filter(p => Number(p.member_id) === Number(memberId));
    if (category) payments = payments.filter(p => p.payment_category.toLowerCase() === category.toLowerCase());
    if (status) payments = payments.filter(p => p.status.toLowerCase() === status.toLowerCase());
    if (dateFrom) payments = payments.filter(p => new Date(p.created_at) >= new Date(dateFrom));
    if (dateTo) payments = payments.filter(p => new Date(p.created_at) <= new Date(dateTo));

    return payments.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });
  }
}

export const paymentRepository = new PaymentRepository();
