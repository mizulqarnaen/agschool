import { JsonRepository } from './baseRepository.js';

export class IncomeRepository extends JsonRepository {
  constructor() {
    super('incomes.json');
  }

  getFiltered({ category, source, dateFrom, dateTo }) {
    let incomes = this.readAll();
    if (category) incomes = incomes.filter(i => i.category.toLowerCase() === category.toLowerCase());
    if (source) incomes = incomes.filter(i => i.source.toLowerCase().includes(source.toLowerCase()));
    if (dateFrom) incomes = incomes.filter(i => new Date(i.transaction_date) >= new Date(dateFrom));
    if (dateTo) incomes = incomes.filter(i => new Date(i.transaction_date) <= new Date(dateTo));

    return incomes.sort((a, b) => {
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

export const incomeRepository = new IncomeRepository();
