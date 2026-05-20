const express = require('express');
const router = express.Router();
const {
  getThreats,
  createThreat,
  updateThreat,
  deleteThreat,
  getThreatStats
} = require('../controllers/threatController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

router.get('/stats', getThreatStats);
router.get('/', getThreats);
router.post('/', createThreat);
router.put('/:id', updateThreat);
router.delete('/:id', deleteThreat);

module.exports = router;
