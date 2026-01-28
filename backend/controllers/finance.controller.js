import { FinanceService } from '../services/finance.service.js';

export const FinanceController = {
  getExpenses: async (req, res) =>
    res.json(await FinanceService.getExpenses(req.params.companyId)),

  createExpense: async (req, res) =>
    res
      .status(201)
      .json(await FinanceService.createExpense(req.params.companyId, req.body)),

  deleteExpense: async (req, res) => {
    await FinanceService.deleteExpense(req.params.companyId, req.params.id);
    res.status(204).send();
  },

  getFinanceData: async (req, res) =>
    res.json(await FinanceService.getFinanceData(req.params.companyId)),

  updateFinanceData: async (req, res) =>
    res.json(
      await FinanceService.updateFinanceData(req.params.companyId, req.body)
    )
};
