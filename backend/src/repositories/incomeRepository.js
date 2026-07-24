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

    return incomes.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }
}

export const incomeRepository = new IncomeRepository();
