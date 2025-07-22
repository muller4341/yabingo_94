// routes/cartelas.js

import { Router } from 'express';
import { readFileSync } from 'fs';
const cartelas = JSON.parse(readFileSync(new URL('../data/cartela.json', import.meta.url)));

const router = Router();

// GET all Cartelas
router.get('/', (req, res) => {
  res.json(cartelas);
});

// GET single Cartela by number
router.get('/:number', (req, res) => {
  const number = parseInt(req.params.number);
  const cartela = cartelas.find(c => c.cartelaNumber === number);
  if (cartela) {
    res.json(cartela);
  } else {
    res.status(404).json({ message: 'Cartela not found' });
  }
});

export default router;
