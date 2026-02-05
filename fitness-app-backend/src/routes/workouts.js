const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

// GET /api/workouts/categories - Get all categories
router.get('/categories', workoutController.getCategories);

// GET /api/workouts/exercises - Get all exercises
router.get('/exercises', workoutController.getExercises);

// GET /api/workouts - Get all workout templates
router.get('/', workoutController.getWorkouts);

// GET /api/workouts/category/:category - Get workouts by category
router.get('/category/:category', workoutController.getWorkoutsByCategory);

// GET /api/workouts/:id - Get workout by ID
router.get('/:id', workoutController.getWorkoutById);

// POST /api/workouts/start - Start a workout session
router.post('/start', workoutController.startWorkout);

// PUT /api/workouts/session/:sessionId - Update workout session
router.put('/session/:sessionId', workoutController.updateWorkoutSession);

// POST /api/workouts/:id/complete - Complete a workout
router.post('/:id/complete', workoutController.completeWorkout);

// DELETE /api/workouts/:id/cancel - Cancel a workout
router.delete('/:id/cancel', workoutController.cancelWorkout);

// GET /api/workouts/user/:userId/history - Get workout history
router.get('/user/:userId/history', workoutController.getWorkoutHistory);

// GET /api/workouts/user/:userId/active - Get active workout session
router.get('/user/:userId/active', workoutController.getActiveSession);

module.exports = router;
