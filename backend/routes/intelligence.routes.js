import { Router } from 'express';
import { IntelligenceController } from '../controllers/intelligence.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/assumptions', protect, IntelligenceController.getAssumptions);
router.post('/assumptions', protect, IntelligenceController.saveAssumption);
router.delete('/assumptions/:id', protect, IntelligenceController.deleteAssumption);

router.get('/risks', protect, IntelligenceController.getRisks);
router.post('/risks', protect, IntelligenceController.saveRisk);
router.delete('/risks/:id', protect, IntelligenceController.deleteRisk);

export default router;
