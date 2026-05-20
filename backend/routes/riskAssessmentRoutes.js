const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessment,
  createAssessment,
  deleteAssessment,
  getAssessmentStats
} = require('../controllers/riskAssessmentController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// GET /api/assessments/stats
router.get('/stats', getAssessmentStats);

// GET /api/assessments
router.get('/', getAssessments);

// GET /api/assessments/:id
router.get('/:id', getAssessment);

// POST /api/assessments
router.post('/', createAssessment);

// DELETE /api/assessments/:id
router.delete('/:id', deleteAssessment);

module.exports = router;
