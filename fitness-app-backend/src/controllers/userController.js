const store = require('../data/store');

// ============================================
// GET USER PROFILE
// ============================================
exports.getProfile = (req, res) => {
  try {
    const { id } = req.params;
    const user = store.users.get(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
    });
  }
};

// ============================================
// UPDATE USER PROFILE
// ============================================
exports.updateProfile = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = store.users.get(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'profile'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'profile') {
          user.profile = { ...user.profile, ...updates.profile };
        } else {
          user[key] = updates[key];
        }
      }
    });

    user.updatedAt = new Date().toISOString();
    store.users.set(id, user);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userWithoutPassword },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
};

// ============================================
// DELETE USER
// ============================================
exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;

    if (!store.users.has(id)) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    store.users.delete(id);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
    });
  }
};

// ============================================
// SAVE HEALTH ASSESSMENT
// ============================================
exports.saveHealthAssessment = (req, res) => {
  try {
    const userId = req.body.userId || req.headers['x-user-id'];
    const assessmentData = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required',
      });
    }

    const user = store.users.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Save assessment
    const assessment = {
      id: store.generateId(),
      userId,
      ...assessmentData,
      createdAt: new Date().toISOString(),
    };

    store.healthAssessments.set(userId, assessment);

    // Update user profile with assessment data
    user.profile = {
      ...user.profile,
      age: assessmentData.age,
      gender: assessmentData.gender,
      height: assessmentData.height,
      weight: assessmentData.weight,
      activityLevel: assessmentData.activityLevel,
      fitnessGoal: assessmentData.fitnessGoal,
      targetWeight: assessmentData.targetWeight,
      medicalConditions: assessmentData.medicalConditions,
      dietaryRestrictions: assessmentData.dietaryRestrictions,
    };

    // Calculate BMI
    if (assessmentData.height && assessmentData.weight) {
      const heightInMeters = assessmentData.height / 100;
      user.profile.bmi = (assessmentData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    // Calculate daily calorie needs (Mifflin-St Jeor equation)
    if (assessmentData.age && assessmentData.gender && assessmentData.height && assessmentData.weight) {
      let bmr;
      if (assessmentData.gender === 'male') {
        bmr = 10 * assessmentData.weight + 6.25 * assessmentData.height - 5 * assessmentData.age + 5;
      } else {
        bmr = 10 * assessmentData.weight + 6.25 * assessmentData.height - 5 * assessmentData.age - 161;
      }

      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9,
      };

      const tdee = Math.round(bmr * (activityMultipliers[assessmentData.activityLevel] || 1.55));
      
      // Adjust based on goal
      let targetCalories = tdee;
      if (assessmentData.fitnessGoal === 'lose_weight') {
        targetCalories = tdee - 500;
      } else if (assessmentData.fitnessGoal === 'gain_muscle') {
        targetCalories = tdee + 300;
      }

      user.profile.dailyCalorieGoal = targetCalories;
      user.profile.tdee = tdee;
    }

    user.isOnboarded = true;
    user.updatedAt = new Date().toISOString();
    store.users.set(userId, user);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Health assessment saved',
      data: {
        user: userWithoutPassword,
        assessment,
      },
    });
  } catch (error) {
    console.error('Error saving assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving health assessment',
    });
  }
};

// ============================================
// GET HEALTH ASSESSMENT
// ============================================
exports.getHealthAssessment = (req, res) => {
  try {
    const { id } = req.params;
    const assessment = store.healthAssessments.get(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Health assessment not found',
      });
    }

    res.json({
      success: true,
      data: { assessment },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching health assessment',
    });
  }
};

// ============================================
// GET USER STATS
// ============================================
exports.getStats = (req, res) => {
  try {
    const { id } = req.params;
    const user = store.users.get(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get workout history
    const workoutHistory = Array.from(store.workoutSessions.values())
      .filter(w => w.userId === id)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    // Calculate weekly stats
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyWorkouts = workoutHistory.filter(
      w => new Date(w.completedAt) >= oneWeekAgo
    );

    const weeklyStats = {
      workouts: weeklyWorkouts.length,
      minutes: weeklyWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      calories: weeklyWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
    };

    res.json({
      success: true,
      data: {
        stats: user.stats,
        weeklyStats,
        recentWorkouts: workoutHistory.slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
    });
  }
};
