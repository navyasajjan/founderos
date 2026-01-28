import express from 'express';
import { DecisionsController } from '../controllers/decisions.controller.js';

const router = express.Router();

router.get('/:companyId', DecisionsController.list);
router.post('/:companyId', DecisionsController.create);
router.put('/:companyId/:id', DecisionsController.update);
router.delete('/:companyId/:id', DecisionsController.delete);

export default router;
