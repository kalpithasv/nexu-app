const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users/:id - Get user profile
router.get('/:id', userController.getProfile);

// PUT /api/users/:id - Update user profile
router.put('/:id', userController.updateProfile);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

// POST /api/users/health-assessment - Save health assessment
router.post('/health-assessment', userController.saveHealthAssessment);

// GET /api/users/:id/health-assessment - Get health assessment
router.get('/:id/health-assessment', userController.getHealthAssessment);

// GET /api/users/:id/stats - Get user stats
router.get('/:id/stats', userController.getStats);

module.exports = router;
