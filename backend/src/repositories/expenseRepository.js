import { JsonRepository } from './baseRepository.js';

export class ExpenseRepository extends JsonRepository {
  constructor() {
    super('expenses.json');
  }

  getFiltered({ category, eventId, dateFrom, dateTo }) {
    let expenses = this.readAll();
    if (category) expenses = expenses.filter(e => e.category.toLowerCase() === category.toLowerCase());
    if (eventId) expenses = expenses.filter(e => Number(e.related_event_id) === Number(eventId));
    if (dateFrom) expenses = expenses.filter(e => new Date(e.transaction_date) >= new Date(dateFrom));
    if (dateTo) expenses = expenses.filter(e => new Date(e.transaction_date) <= new Date(dateTo));

    return expenses.sort((a, b) => {
      const dateA = a.transaction_date ? new Date(a.transaction_date).getTime() : 0;
      const dateB = b.transaction_date ? new Date(b.transaction_date).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;

      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;

      return (b.id || 0) - (a.id || 0);
    });
  }
}

export const expenseRepository = new ExpenseRepository();
