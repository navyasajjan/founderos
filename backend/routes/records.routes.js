import { Router } from 'express';
import { RecordsController } from '../controllers/records.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', protect, RecordsController.list);
router.get('/:id', protect, RecordsController.getOne);
router.post('/', protect, RecordsController.save);
router.put('/:id', protect, RecordsController.save);
router.delete('/:id', protect, RecordsController.delete);

export default router;
