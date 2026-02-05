const store = require('../data/store');

// ============================================
// GET ALL WORKOUT CATEGORIES
// ============================================
exports.getCategories = (req, res) => {
  res.json({
    success: true,
    data: { categories: store.workoutCategories },
  });
};

// ============================================
// GET ALL WORKOUTS/TEMPLATES
// ============================================
exports.getWorkouts = (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let workouts = store.workoutTemplates;

    if (category) {
      workouts = workouts.filter(w => w.category === category);
    }

    if (difficulty) {
      workouts = workouts.filter(w => w.difficulty === difficulty);
    }

    // Populate exercises
    const populatedWorkouts = workouts.map(w => ({
      ...w,
      exercises: w.exercises.map(ex => ({
        ...ex,
        exercise: store.getExerciseById(ex.exerciseId),
      })),
    }));

    res.json({
      success: true,
      data: { workouts: populatedWorkouts },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching workouts',
    });
  }
};

// ============================================
// GET WORKOUT BY ID
// ============================================
exports.getWorkoutById = (req, res) => {
  try {
    const { id } = req.params;
    const workout = store.getWorkoutWithExercises(id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    res.json({
      success: true,
      data: { workout },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching workout',
    });
  }
};

// ============================================
// GET EXERCISES
// ============================================
exports.getExercises = (req, res) => {
  try {
    const { category, muscleGroup, difficulty } = req.query;
    
    let exercises = store.exercises;

    if (category) {
      exercises = exercises.filter(e => e.category === category);
    }

    if (muscleGroup) {
      exercises = exercises.filter(e => e.muscleGroup === muscleGroup);
    }

    if (difficulty) {
      exercises = exercises.filter(e => e.difficulty === difficulty);
    }

    res.json({
      success: true,
      data: { exercises },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exercises',
    });
  }
};

// ============================================
// GET WORKOUTS BY CATEGORY
// ============================================
exports.getWorkoutsByCategory = (req, res) => {
  try {
    const { category } = req.params;
    
    const workouts = store.workoutTemplates.filter(w => w.category === category);
    
    const populatedWorkouts = workouts.map(w => ({
      ...w,
      exercises: w.exercises.map(ex => ({
        ...ex,
        exercise: store.getExerciseById(ex.exerciseId),
      })),
    }));

    res.json({
      success: true,
      data: { 
        category: store.workoutCategories.find(c => c.id === category),
        workouts: populatedWorkouts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching workouts',
    });
  }
};

// ============================================
// START WORKOUT SESSION
// ============================================
exports.startWorkout = (req, res) => {
  try {
    const { userId, workoutId, customExercises } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required',
      });
    }

    let workout = null;
    let exercises = [];

    if (workoutId) {
      workout = store.getWorkoutWithExercises(workoutId);
      exercises = workout?.exercises || [];
    } else if (customExercises) {
      exercises = customExercises.map(ex => ({
        ...ex,
        exercise: store.getExerciseById(ex.exerciseId),
      }));
    }

    const sessionId = store.generateId();
    const session = {
      id: sessionId,
      userId,
      workoutId,
      workoutName: workout?.name || 'Custom Workout',
      exercises: exercises.map(ex => ({
        ...ex,
        completed: false,
        setsCompleted: [],
      })),
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      currentExerciseIndex: 0,
      totalDuration: 0,
      caloriesBurned: 0,
    };

    store.workoutSessions.set(sessionId, session);

    res.json({
      success: true,
      message: 'Workout started',
      data: { session },
    });
  } catch (error) {
    console.error('Error starting workout:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting workout',
    });
  }
};

// ============================================
// UPDATE WORKOUT SESSION (LOG EXERCISE)
// ============================================
exports.updateWorkoutSession = (req, res) => {
  try {
    const { sessionId } = req.params;
    const { exerciseIndex, setData, completed, duration } = req.body;

    const session = store.workoutSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found',
      });
    }

    // Log a set for an exercise
    if (exerciseIndex !== undefined && setData) {
      const exercise = session.exercises[exerciseIndex];
      if (exercise) {
        exercise.setsCompleted.push({
          ...setData,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Mark exercise as completed
    if (exerciseIndex !== undefined && completed) {
      const exercise = session.exercises[exerciseIndex];
      if (exercise) {
        exercise.completed = true;
        session.currentExerciseIndex = exerciseIndex + 1;
      }
    }

    // Update duration
    if (duration) {
      session.totalDuration = duration;
    }

    // Calculate calories burned
    session.caloriesBurned = session.exercises.reduce((total, ex) => {
      const exerciseData = ex.exercise;
      const setsCompleted = ex.setsCompleted.length;
      const avgTimePerSet = 2; // minutes
      return total + (exerciseData?.caloriesPerMin || 5) * setsCompleted * avgTimePerSet;
    }, 0);

    session.updatedAt = new Date().toISOString();
    store.workoutSessions.set(sessionId, session);

    res.json({
      success: true,
      data: { session },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating workout',
    });
  }
};

// ============================================
// COMPLETE WORKOUT
// ============================================
exports.completeWorkout = (req, res) => {
  try {
    const { id } = req.params;
    const { duration, notes, rating } = req.body;

    const session = store.workoutSessions.get(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found',
      });
    }

    // Mark all exercises as reviewed
    session.exercises.forEach(ex => {
      if (ex.setsCompleted.length > 0) {
        ex.completed = true;
      }
    });

    session.status = 'completed';
    session.completedAt = new Date().toISOString();
    session.totalDuration = duration || session.totalDuration;
    session.notes = notes;
    session.rating = rating;

    // Calculate final calories
    const totalMinutes = session.totalDuration / 60;
    if (!session.caloriesBurned) {
      session.caloriesBurned = Math.round(totalMinutes * 8); // Average 8 cal/min
    }

    store.workoutSessions.set(id, session);

    // Update user stats
    const user = store.users.get(session.userId);
    if (user) {
      user.stats.totalWorkouts += 1;
      user.stats.totalMinutes += Math.round(totalMinutes);
      user.stats.totalCaloriesBurned += session.caloriesBurned;
      user.stats.lastWorkoutDate = session.completedAt;

      // Update streak
      const lastWorkout = user.stats.lastWorkoutDate ? new Date(user.stats.lastWorkoutDate) : null;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (!lastWorkout || lastWorkout.toDateString() === yesterday.toDateString()) {
        user.stats.currentStreak += 1;
        if (user.stats.currentStreak > user.stats.longestStreak) {
          user.stats.longestStreak = user.stats.currentStreak;
        }
      } else if (lastWorkout.toDateString() !== today.toDateString()) {
        user.stats.currentStreak = 1;
      }

      store.users.set(session.userId, user);
    }

    res.json({
      success: true,
      message: 'Workout completed! Great job! 💪',
      data: { session },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing workout',
    });
  }
};

// ============================================
// GET WORKOUT HISTORY
// ============================================
exports.getWorkoutHistory = (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const history = Array.from(store.workoutSessions.values())
      .filter(s => s.userId === userId && s.status === 'completed')
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(Number(offset), Number(offset) + Number(limit));

    const total = Array.from(store.workoutSessions.values())
      .filter(s => s.userId === userId && s.status === 'completed').length;

    res.json({
      success: true,
      data: {
        history,
        total,
        hasMore: Number(offset) + history.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching workout history',
    });
  }
};

// ============================================
// GET ACTIVE WORKOUT SESSION
// ============================================
exports.getActiveSession = (req, res) => {
  try {
    const { userId } = req.params;

    const activeSession = Array.from(store.workoutSessions.values())
      .find(s => s.userId === userId && s.status === 'in_progress');

    res.json({
      success: true,
      data: { session: activeSession || null },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active session',
    });
  }
};

// ============================================
// CANCEL WORKOUT SESSION
// ============================================
exports.cancelWorkout = (req, res) => {
  try {
    const { id } = req.params;

    const session = store.workoutSessions.get(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found',
      });
    }

    session.status = 'cancelled';
    session.cancelledAt = new Date().toISOString();
    store.workoutSessions.set(id, session);

    res.json({
      success: true,
      message: 'Workout cancelled',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling workout',
    });
  }
};
