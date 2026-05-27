import { Router } from 'express';
import assignmentRoutes from './assignment.routes.js';
import groupRoutes from './group.routes.js';

const router = Router();

router.use('/assignments', assignmentRoutes);
router.use('/groups', groupRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
