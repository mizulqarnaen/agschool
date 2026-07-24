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

    return expenses.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }
}

export const expenseRepository = new ExpenseRepository();
