import express from 'express';
import { FinanceController } from '../controllers/finance.controller.js';

const router = express.Router();

router.get('/:companyId/expenses', FinanceController.getExpenses);
router.post('/:companyId/expenses', FinanceController.createExpense);
router.delete('/:companyId/expenses/:id', FinanceController.deleteExpense);

router.get('/:companyId', FinanceController.getFinanceData);
router.put('/:companyId', FinanceController.updateFinanceData);

export default router;



