import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { validate } from '../middleware/validation.js';
import { createAssignmentSchema } from '@vedaai/shared';
import * as ctrl from '../controllers/assignment.controller.js';

const router = Router();

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), 'uploads')),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, and JPEG are allowed.'));
    }
  },
});

// Routes
router.post('/', upload.single('file'), validate(createAssignmentSchema), ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.delete('/:id', ctrl.deleteAssignment);
router.post('/:id/regenerate', ctrl.regenerate);
router.get('/:id/paper', ctrl.getPaper);
router.get('/:id/pdf', ctrl.downloadPdf);

export default router;
