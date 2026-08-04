import express from 'express';
import {
  getInternalBrandAmbassadors,
  createBrandAmbassador,
  updateBrandAmbassador,
  toggleFeaturedBrandAmbassador,
  toggleStatusBrandAmbassador,
  deleteBrandAmbassador
} from '../controllers/brandAmbassadorController.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Allow internal team roles to access Brand Ambassadors
router.use(authorizeRoles('administrator', 'admin', 'secretary', 'finance', 'staff', 'manager', 'maintainer'));

router.get('/', getInternalBrandAmbassadors);
router.post('/', createBrandAmbassador);
router.put('/:id', updateBrandAmbassador);
router.put('/:id/featured', toggleFeaturedBrandAmbassador);
router.put('/:id/status', toggleStatusBrandAmbassador);
router.delete('/:id', deleteBrandAmbassador);

export default router;
