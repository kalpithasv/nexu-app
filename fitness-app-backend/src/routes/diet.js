const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');

// GET /api/diet/meals - Get available meals
router.get('/meals', dietController.getMeals);

// GET /api/diet/:userId - Get user diet plan
router.get('/:userId', dietController.getDietPlan);

// GET /api/diet/:userId/log - Get daily meal log
router.get('/:userId/log', dietController.getDailyLog);

// POST /api/diet/:userId/log-meal - Log a meal
router.post('/:userId/log-meal', dietController.logMeal);

// DELETE /api/diet/:userId/log/:entryId - Delete meal log entry
router.delete('/:userId/log/:entryId', dietController.deleteMealLog);

// POST /api/diet/:userId/log-water - Log water intake
router.post('/:userId/log-water', dietController.logWater);

// GET /api/diet/:userId/water - Get water log
router.get('/:userId/water', dietController.getWaterLog);

// GET /api/diet/:userId/progress - Get nutrition progress
router.get('/:userId/progress', dietController.getProgress);

module.exports = router;
