
import { Router } from 'express';
import { CompaniesController } from '../controllers/companies.controller.js';

import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', protect, CompaniesController.list);
router.post('/', protect, CompaniesController.create);
router.put('/:id', protect, CompaniesController.update);
router.delete('/:id', protect, CompaniesController.delete);

export default router;
