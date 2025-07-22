import { Router } from 'express';
import { saveSelectedCartelas, getMostRecentSelectedCartela } from '../controllers/selectedCartelas.js';

const router = Router();

// POST /api/selectedcartelas
router.post('/', saveSelectedCartelas);

// GET /api/selectedcartelas/recent
router.get('/recent', getMostRecentSelectedCartela);

export default router; 