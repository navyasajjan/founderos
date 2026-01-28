import { Expense } from '../models/expense.model.js';
import { Finance } from '../models/finance.model.js';

export const FinanceService = {
  // -------- EXPENSES --------
  getExpenses: async (companyId) => {
    return await Expense.find({ companyId }).sort({ created_at: -1 });
  },

  createExpense: async (companyId, data) => {
    const expense = new Expense({ ...data, companyId });
    return await expense.save();
  },

  deleteExpense: async (companyId, id) => {
    await Expense.deleteOne({ _id: id, companyId });
    return true;
  },

  // -------- FINANCE --------
  getFinanceData: async (companyId) => {
    let finance = await Finance.findOne({ companyId });

    if (!finance) {
      finance = await Finance.create({ companyId, cashBalance: 0 });
    }

    return finance;
  },

  updateFinanceData: async (companyId, data) => {
    let finance = await Finance.findOne({ companyId });

    if (!finance) {
      finance = await Finance.create({ companyId, ...data });
    } else {
      Object.assign(finance, data);
      await finance.save();
    }

    return finance;
  }
};
