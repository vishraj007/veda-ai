import { Router } from 'express';
import * as groupCtrl from '../controllers/group.controller.js';

const router = Router();

// Group CRUD
router.post('/', groupCtrl.createGroup);
router.get('/', groupCtrl.listGroups);
router.get('/:id', groupCtrl.getGroup);
router.put('/:id', groupCtrl.updateGroup);
router.delete('/:id', groupCtrl.deleteGroup);

// Student management
router.post('/:id/students', groupCtrl.addStudent);
router.post('/:id/students/import', groupCtrl.importStudents);
router.delete('/:id/students/:studentId', groupCtrl.removeStudent);

// Paper assignment
router.post('/:id/papers', groupCtrl.assignPaper);
router.delete('/:id/papers/:assignmentId', groupCtrl.unassignPaper);

export default router;
