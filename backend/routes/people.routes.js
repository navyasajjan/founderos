
import { Router } from 'express';
import { PeopleController } from '../controllers/people.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', protect, PeopleController.listPeople);
router.post('/', protect, PeopleController.createPerson);
router.put('/:id', protect, PeopleController.updatePerson);
router.delete('/:id', protect, PeopleController.deletePerson);

router.get('/roles', protect, PeopleController.listRoles);
router.post('/roles', protect, PeopleController.createRole);
router.put('/roles/:id', protect, PeopleController.updateRole);
router.delete('/roles/:id', protect, PeopleController.deleteRole);

export default router;
