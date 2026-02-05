const store = require('../data/store');

// ============================================
// GET DIET PLAN FOR USER
// ============================================
exports.getDietPlan = (req, res) => {
  try {
    const { userId } = req.params;

    const user = store.users.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's calorie goal
    const dailyCalorieGoal = user.profile?.dailyCalorieGoal || 2000;
    
    // Generate a diet plan based on user's goals
    const goal = user.profile?.fitnessGoal || 'maintain';
    
    // Calculate macros based on goal
    let proteinRatio, carbRatio, fatRatio;
    
    if (goal === 'lose_weight') {
      proteinRatio = 0.35;
      carbRatio = 0.35;
      fatRatio = 0.30;
    } else if (goal === 'gain_muscle') {
      proteinRatio = 0.30;
      carbRatio = 0.45;
      fatRatio = 0.25;
    } else {
      proteinRatio = 0.25;
      carbRatio = 0.50;
      fatRatio = 0.25;
    }

    const macroGoals = {
      calories: dailyCalorieGoal,
      protein: Math.round((dailyCalorieGoal * proteinRatio) / 4), // 4 cal per gram
      carbs: Math.round((dailyCalorieGoal * carbRatio) / 4),
      fat: Math.round((dailyCalorieGoal * fatRatio) / 9), // 9 cal per gram
      fiber: 30,
      water: 8, // glasses
    };

    // Select meals based on calorie budget
    const breakfastBudget = dailyCalorieGoal * 0.25;
    const lunchBudget = dailyCalorieGoal * 0.35;
    const dinnerBudget = dailyCalorieGoal * 0.30;
    const snackBudget = dailyCalorieGoal * 0.10;

    const breakfasts = store.mealDatabase.filter(m => m.category === 'breakfast');
    const lunches = store.mealDatabase.filter(m => m.category === 'lunch');
    const dinners = store.mealDatabase.filter(m => m.category === 'dinner');
    const snacks = store.mealDatabase.filter(m => m.category === 'snack');

    // Generate 7-day meal plan
    const weekPlan = [];
    for (let day = 0; day < 7; day++) {
      weekPlan.push({
        day: day,
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        meals: {
          breakfast: breakfasts[day % breakfasts.length],
          lunch: lunches[day % lunches.length],
          dinner: dinners[day % dinners.length],
          snacks: [snacks[day % snacks.length]],
        },
      });
    }

    res.json({
      success: true,
      data: {
        macroGoals,
        weekPlan,
        todaysPlan: weekPlan[0],
      },
    });
  } catch (error) {
    console.error('Error fetching diet plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching diet plan',
    });
  }
};

// ============================================
// LOG MEAL
// ============================================
exports.logMeal = (req, res) => {
  try {
    const { userId } = req.params;
    const { mealId, customMeal, mealType, servings = 1 } = req.body;

    let meal;
    if (mealId) {
      meal = store.mealDatabase.find(m => m.id === mealId);
      if (!meal) {
        return res.status(404).json({
          success: false,
          message: 'Meal not found',
        });
      }
    } else if (customMeal) {
      meal = {
        id: store.generateId(),
        ...customMeal,
        isCustom: true,
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide mealId or customMeal',
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const logKey = `${userId}-${today}`;

    let dailyLog = store.mealLogs.get(logKey) || {
      userId,
      date: today,
      meals: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    };

    const logEntry = {
      id: store.generateId(),
      meal,
      mealType: mealType || meal.category,
      servings,
      loggedAt: new Date().toISOString(),
      calories: Math.round(meal.calories * servings),
      protein: Math.round(meal.protein * servings),
      carbs: Math.round(meal.carbs * servings),
      fat: Math.round(meal.fat * servings),
      fiber: Math.round((meal.fiber || 0) * servings),
    };

    dailyLog.meals.push(logEntry);

    // Update totals
    dailyLog.totals.calories += logEntry.calories;
    dailyLog.totals.protein += logEntry.protein;
    dailyLog.totals.carbs += logEntry.carbs;
    dailyLog.totals.fat += logEntry.fat;
    dailyLog.totals.fiber += logEntry.fiber;

    store.mealLogs.set(logKey, dailyLog);

    res.json({
      success: true,
      message: 'Meal logged successfully',
      data: {
        entry: logEntry,
        dailyTotals: dailyLog.totals,
      },
    });
  } catch (error) {
    console.error('Error logging meal:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging meal',
    });
  }
};

// ============================================
// GET DAILY MEAL LOG
// ============================================
exports.getDailyLog = (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logKey = `${userId}-${targetDate}`;

    const dailyLog = store.mealLogs.get(logKey) || {
      userId,
      date: targetDate,
      meals: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    };

    // Get user's goals for comparison
    const user = store.users.get(userId);
    const dailyCalorieGoal = user?.profile?.dailyCalorieGoal || 2000;

    res.json({
      success: true,
      data: {
        log: dailyLog,
        goals: {
          calories: dailyCalorieGoal,
          protein: Math.round(dailyCalorieGoal * 0.25 / 4),
          carbs: Math.round(dailyCalorieGoal * 0.50 / 4),
          fat: Math.round(dailyCalorieGoal * 0.25 / 9),
        },
        remaining: {
          calories: dailyCalorieGoal - dailyLog.totals.calories,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily log',
    });
  }
};

// ============================================
// DELETE MEAL LOG ENTRY
// ============================================
exports.deleteMealLog = (req, res) => {
  try {
    const { userId, entryId } = req.params;
    const { date } = req.query;
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logKey = `${userId}-${targetDate}`;

    const dailyLog = store.mealLogs.get(logKey);
    if (!dailyLog) {
      return res.status(404).json({
        success: false,
        message: 'Log not found',
      });
    }

    const entryIndex = dailyLog.meals.findIndex(m => m.id === entryId);
    if (entryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found',
      });
    }

    const entry = dailyLog.meals[entryIndex];
    
    // Subtract from totals
    dailyLog.totals.calories -= entry.calories;
    dailyLog.totals.protein -= entry.protein;
    dailyLog.totals.carbs -= entry.carbs;
    dailyLog.totals.fat -= entry.fat;
    dailyLog.totals.fiber -= entry.fiber;

    dailyLog.meals.splice(entryIndex, 1);
    store.mealLogs.set(logKey, dailyLog);

    res.json({
      success: true,
      message: 'Meal deleted',
      data: { dailyTotals: dailyLog.totals },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting meal',
    });
  }
};

// ============================================
// LOG WATER INTAKE
// ============================================
exports.logWater = (req, res) => {
  try {
    const { userId } = req.params;
    const { glasses = 1 } = req.body;

    const today = new Date().toISOString().split('T')[0];
    const logKey = `${userId}-${today}`;

    let waterLog = store.waterLogs.get(logKey) || {
      userId,
      date: today,
      glasses: 0,
      goal: 8,
      logs: [],
    };

    waterLog.glasses += glasses;
    waterLog.logs.push({
      glasses,
      timestamp: new Date().toISOString(),
    });

    store.waterLogs.set(logKey, waterLog);

    res.json({
      success: true,
      message: `Water logged! ${waterLog.glasses}/${waterLog.goal} glasses today`,
      data: { waterLog },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging water',
    });
  }
};

// ============================================
// GET WATER LOG
// ============================================
exports.getWaterLog = (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    const logKey = `${userId}-${targetDate}`;

    const waterLog = store.waterLogs.get(logKey) || {
      userId,
      date: targetDate,
      glasses: 0,
      goal: 8,
      logs: [],
    };

    res.json({
      success: true,
      data: { waterLog },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching water log',
    });
  }
};

// ============================================
// GET ALL AVAILABLE MEALS
// ============================================
exports.getMeals = (req, res) => {
  try {
    const { category } = req.query;
    
    let meals = store.mealDatabase;
    if (category) {
      meals = meals.filter(m => m.category === category);
    }

    res.json({
      success: true,
      data: { meals },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching meals',
    });
  }
};

// ============================================
// GET NUTRITION PROGRESS
// ============================================
exports.getProgress = (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    const progress = [];
    
    for (let i = 0; i < Number(days); i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const logKey = `${userId}-${dateStr}`;
      
      const mealLog = store.mealLogs.get(logKey);
      const waterLog = store.waterLogs.get(logKey);
      
      progress.push({
        date: dateStr,
        calories: mealLog?.totals?.calories || 0,
        protein: mealLog?.totals?.protein || 0,
        carbs: mealLog?.totals?.carbs || 0,
        fat: mealLog?.totals?.fat || 0,
        water: waterLog?.glasses || 0,
        mealsLogged: mealLog?.meals?.length || 0,
      });
    }

    const user = store.users.get(userId);
    const dailyCalorieGoal = user?.profile?.dailyCalorieGoal || 2000;

    res.json({
      success: true,
      data: {
        progress: progress.reverse(),
        averages: {
          calories: Math.round(progress.reduce((a, b) => a + b.calories, 0) / progress.length),
          protein: Math.round(progress.reduce((a, b) => a + b.protein, 0) / progress.length),
          water: Math.round(progress.reduce((a, b) => a + b.water, 0) / progress.length * 10) / 10,
        },
        goals: {
          calories: dailyCalorieGoal,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
    });
  }
};
