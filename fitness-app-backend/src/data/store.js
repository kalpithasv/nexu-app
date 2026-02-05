// In-memory data store for development/testing
// Replace with MongoDB/PostgreSQL for production

const bcrypt = require('bcryptjs');

// ============================================
// IN-MEMORY DATABASE
// ============================================

const users = new Map();
const workoutSessions = new Map();
const mealLogs = new Map();
const waterLogs = new Map();
const healthAssessments = new Map();

// ============================================
// SEED DEMO USER
// ============================================
const seedDemoUser = async () => {
  const hashedPassword = await bcrypt.hash('demo123', 10);
  users.set('demo@fitpulse.ai', {
    id: 'demo-user-001',
    email: 'demo@fitpulse.ai',
    password: hashedPassword,
    name: 'Demo User',
    subscriptionPlan: 'premium',
    isOnboarded: true,
    createdAt: new Date().toISOString(),
    stats: {
      totalWorkouts: 47,
      currentStreak: 5,
      caloriesBurned: 12450,
      minutesWorked: 1250,
    },
  });
};
seedDemoUser();

// ============================================
// SEED DATA - Sample workouts and exercises
// ============================================

const workoutCategories = [
  {
    id: 'strength',
    name: 'Strength Training',
    icon: '💪',
    color: '#FF6B6B',
    description: 'Build muscle and increase strength',
  },
  {
    id: 'cardio',
    name: 'Cardio',
    icon: '🏃',
    color: '#4ECDC4',
    description: 'Improve endurance and burn calories',
  },
  {
    id: 'yoga',
    name: 'Yoga & Flexibility',
    icon: '🧘',
    color: '#A78BFA',
    description: 'Increase flexibility and reduce stress',
  },
  {
    id: 'hiit',
    name: 'HIIT',
    icon: '⚡',
    color: '#FFD60A',
    description: 'High intensity interval training',
  },
  {
    id: 'core',
    name: 'Core & Abs',
    icon: '🎯',
    color: '#F97316',
    description: 'Strengthen your core muscles',
  },
  {
    id: 'stretching',
    name: 'Stretching',
    icon: '🤸',
    color: '#10B981',
    description: 'Improve mobility and recovery',
  },
];

const exercises = [
  // Strength Training
  { id: 'ex1', name: 'Barbell Squat', category: 'strength', muscleGroup: 'legs', equipment: 'barbell', difficulty: 'intermediate', caloriesPerMin: 8, instructions: 'Stand with feet shoulder-width apart. Lower your body by bending knees and hips. Keep chest up and back straight. Push through heels to return to start.' },
  { id: 'ex2', name: 'Bench Press', category: 'strength', muscleGroup: 'chest', equipment: 'barbell', difficulty: 'intermediate', caloriesPerMin: 7, instructions: 'Lie on bench, grip barbell slightly wider than shoulders. Lower bar to chest, then press up to starting position.' },
  { id: 'ex3', name: 'Deadlift', category: 'strength', muscleGroup: 'back', equipment: 'barbell', difficulty: 'advanced', caloriesPerMin: 9, instructions: 'Stand with feet hip-width apart, barbell over mid-foot. Bend at hips and knees, grip bar. Lift by extending hips and knees together.' },
  { id: 'ex4', name: 'Pull-ups', category: 'strength', muscleGroup: 'back', equipment: 'pullup bar', difficulty: 'intermediate', caloriesPerMin: 8, instructions: 'Hang from bar with overhand grip. Pull yourself up until chin is over bar. Lower with control.' },
  { id: 'ex5', name: 'Dumbbell Rows', category: 'strength', muscleGroup: 'back', equipment: 'dumbbell', difficulty: 'beginner', caloriesPerMin: 6, instructions: 'Place one knee and hand on bench. Hold dumbbell in other hand, pull to hip. Lower with control.' },
  { id: 'ex6', name: 'Shoulder Press', category: 'strength', muscleGroup: 'shoulders', equipment: 'dumbbell', difficulty: 'beginner', caloriesPerMin: 5, instructions: 'Hold dumbbells at shoulder height. Press overhead until arms are straight. Lower with control.' },
  { id: 'ex7', name: 'Bicep Curls', category: 'strength', muscleGroup: 'arms', equipment: 'dumbbell', difficulty: 'beginner', caloriesPerMin: 4, instructions: 'Stand with dumbbells at sides. Curl weights to shoulders, keeping elbows stationary. Lower slowly.' },
  { id: 'ex8', name: 'Tricep Dips', category: 'strength', muscleGroup: 'arms', equipment: 'bench', difficulty: 'beginner', caloriesPerMin: 5, instructions: 'Place hands on bench behind you. Lower body by bending elbows. Push back up to start.' },
  { id: 'ex9', name: 'Lunges', category: 'strength', muscleGroup: 'legs', equipment: 'bodyweight', difficulty: 'beginner', caloriesPerMin: 6, instructions: 'Step forward with one leg, lowering hips until both knees are bent 90 degrees. Push back to start.' },
  { id: 'ex10', name: 'Leg Press', category: 'strength', muscleGroup: 'legs', equipment: 'machine', difficulty: 'beginner', caloriesPerMin: 7, instructions: 'Sit in machine with feet on platform. Push platform away by extending legs. Return with control.' },
  
  // Cardio
  { id: 'ex11', name: 'Running', category: 'cardio', muscleGroup: 'full body', equipment: 'none', difficulty: 'beginner', caloriesPerMin: 12, instructions: 'Maintain a steady pace. Land mid-foot and keep arms relaxed. Breathe rhythmically.' },
  { id: 'ex12', name: 'Cycling', category: 'cardio', muscleGroup: 'legs', equipment: 'bike', difficulty: 'beginner', caloriesPerMin: 10, instructions: 'Maintain steady cadence of 80-100 RPM. Keep core engaged and back straight.' },
  { id: 'ex13', name: 'Jump Rope', category: 'cardio', muscleGroup: 'full body', equipment: 'jump rope', difficulty: 'beginner', caloriesPerMin: 14, instructions: 'Jump with both feet, keeping jumps small. Use wrists to turn rope, not arms.' },
  { id: 'ex14', name: 'Rowing', category: 'cardio', muscleGroup: 'full body', equipment: 'rowing machine', difficulty: 'intermediate', caloriesPerMin: 11, instructions: 'Push with legs first, then pull with arms. Return by extending arms, then bending knees.' },
  { id: 'ex15', name: 'Stair Climber', category: 'cardio', muscleGroup: 'legs', equipment: 'stair machine', difficulty: 'intermediate', caloriesPerMin: 10, instructions: 'Step naturally without holding rails. Keep posture upright and core engaged.' },
  
  // HIIT
  { id: 'ex16', name: 'Burpees', category: 'hiit', muscleGroup: 'full body', equipment: 'none', difficulty: 'intermediate', caloriesPerMin: 15, instructions: 'From standing, drop to squat with hands on floor. Jump feet back to plank. Do push-up. Jump feet forward and jump up with arms overhead.' },
  { id: 'ex17', name: 'Mountain Climbers', category: 'hiit', muscleGroup: 'core', equipment: 'none', difficulty: 'beginner', caloriesPerMin: 12, instructions: 'Start in plank position. Alternate driving knees toward chest rapidly while keeping hips down.' },
  { id: 'ex18', name: 'Box Jumps', category: 'hiit', muscleGroup: 'legs', equipment: 'plyo box', difficulty: 'intermediate', caloriesPerMin: 13, instructions: 'Stand facing box. Jump onto box landing softly with both feet. Step down and repeat.' },
  { id: 'ex19', name: 'Kettlebell Swings', category: 'hiit', muscleGroup: 'full body', equipment: 'kettlebell', difficulty: 'intermediate', caloriesPerMin: 14, instructions: 'Hinge at hips, swing kettlebell between legs. Drive hips forward to swing bell to chest height.' },
  { id: 'ex20', name: 'Battle Ropes', category: 'hiit', muscleGroup: 'upper body', equipment: 'battle ropes', difficulty: 'intermediate', caloriesPerMin: 13, instructions: 'Hold rope ends in each hand. Create waves by alternating arm movements rapidly.' },
  
  // Core
  { id: 'ex21', name: 'Plank', category: 'core', muscleGroup: 'core', equipment: 'none', difficulty: 'beginner', caloriesPerMin: 4, instructions: 'Hold push-up position with body in straight line. Engage core and hold.' },
  { id: 'ex22', name: 'Crunches', category: 'core', muscleGroup: 'core', equipment: 'none', difficulty: 'beginner', caloriesPerMin: 5, instructions: 'Lie on back with knees bent. Curl shoulders toward hips, keeping lower back on floor.' },
  { id: 'ex23', name: 'Russian Twists', category: 'core', muscleGroup: 'core', equipment: 'none', difficulty: 'beginner', caloriesPerMin: 6, instructions: 'Sit with knees bent, lean back slightly. Rotate torso side to side, touching floor each side.' },
  { id: 'ex24', name: 'Leg Raises', category: 'core', muscleGroup: 'core', equipment: 'none', difficulty: 'intermediate', caloriesPerMin: 5, instructions: 'Lie flat, hands under hips. Raise legs to 90 degrees, lower slowly without touching floor.' },
  { id: 'ex25', name: 'Dead Bug', category: 'core', muscleGroup: 'core', equipment: 'none', difficulty: 'beginner', caloriesPerMin: 4, instructions: 'Lie on back, arms up, knees bent 90°. Lower opposite arm and leg, return, alternate.' },
  
  // Yoga
  { id: 'ex26', name: 'Downward Dog', category: 'yoga', muscleGroup: 'full body', equipment: 'mat', difficulty: 'beginner', caloriesPerMin: 3, instructions: 'From hands and knees, lift hips up and back. Press heels toward floor, keep spine long.' },
  { id: 'ex27', name: 'Warrior I', category: 'yoga', muscleGroup: 'legs', equipment: 'mat', difficulty: 'beginner', caloriesPerMin: 3, instructions: 'Step one foot forward into lunge. Raise arms overhead, square hips forward.' },
  { id: 'ex28', name: 'Tree Pose', category: 'yoga', muscleGroup: 'legs', equipment: 'mat', difficulty: 'beginner', caloriesPerMin: 2, instructions: 'Stand on one leg, place other foot on inner thigh. Bring hands to prayer or overhead.' },
  { id: 'ex29', name: 'Child\'s Pose', category: 'yoga', muscleGroup: 'back', equipment: 'mat', difficulty: 'beginner', caloriesPerMin: 2, instructions: 'Kneel, sit back on heels. Fold forward, arms extended or by sides.' },
  { id: 'ex30', name: 'Sun Salutation', category: 'yoga', muscleGroup: 'full body', equipment: 'mat', difficulty: 'intermediate', caloriesPerMin: 5, instructions: 'Flow through mountain pose, forward fold, plank, cobra, downward dog sequence.' },
  
  // Stretching
  { id: 'ex31', name: 'Hamstring Stretch', category: 'stretching', muscleGroup: 'legs', equipment: 'none', difficulty: 'beginner', caloriesPerMin: 2, instructions: 'Sit with one leg extended. Reach toward toes, keeping back straight. Hold 30 seconds.' },
  { id: 'ex32', name: 'Quad Stretch', category: 'stretching', muscleGroup: 'legs', equipment: 'none', difficulty: 'beginner', caloriesPerMin: 2, instructions: 'Stand on one leg, pull other heel toward glutes. Hold 30 seconds each side.' },
  { id: 'ex33', name: 'Hip Flexor Stretch', category: 'stretching', muscleGroup: 'hips', equipment: 'none', difficulty: 'beginner', caloriesPerMin: 2, instructions: 'Kneel on one knee, other foot forward. Push hips forward gently. Hold 30 seconds.' },
  { id: 'ex34', name: 'Chest Stretch', category: 'stretching', muscleGroup: 'chest', equipment: 'none', difficulty: 'beginner', caloriesPerMin: 2, instructions: 'Stand in doorway, arms on frame at 90°. Step through doorway to stretch chest.' },
  { id: 'ex35', name: 'Shoulder Stretch', category: 'stretching', muscleGroup: 'shoulders', equipment: 'none', difficulty: 'beginner', caloriesPerMin: 2, instructions: 'Bring one arm across chest. Use other arm to press it closer. Hold 30 seconds.' },
];

const workoutTemplates = [
  {
    id: 'wt1',
    name: 'Full Body Strength',
    category: 'strength',
    duration: 45,
    difficulty: 'intermediate',
    calories: 350,
    exercises: [
      { exerciseId: 'ex1', sets: 4, reps: 10, restSeconds: 90 },
      { exerciseId: 'ex2', sets: 4, reps: 10, restSeconds: 90 },
      { exerciseId: 'ex4', sets: 3, reps: 8, restSeconds: 60 },
      { exerciseId: 'ex6', sets: 3, reps: 12, restSeconds: 60 },
      { exerciseId: 'ex9', sets: 3, reps: 12, restSeconds: 60 },
    ],
  },
  {
    id: 'wt2',
    name: 'Upper Body Focus',
    category: 'strength',
    duration: 40,
    difficulty: 'intermediate',
    calories: 280,
    exercises: [
      { exerciseId: 'ex2', sets: 4, reps: 10, restSeconds: 90 },
      { exerciseId: 'ex4', sets: 4, reps: 8, restSeconds: 90 },
      { exerciseId: 'ex5', sets: 3, reps: 12, restSeconds: 60 },
      { exerciseId: 'ex6', sets: 3, reps: 12, restSeconds: 60 },
      { exerciseId: 'ex7', sets: 3, reps: 15, restSeconds: 45 },
      { exerciseId: 'ex8', sets: 3, reps: 12, restSeconds: 45 },
    ],
  },
  {
    id: 'wt3',
    name: 'Lower Body Power',
    category: 'strength',
    duration: 50,
    difficulty: 'intermediate',
    calories: 400,
    exercises: [
      { exerciseId: 'ex1', sets: 5, reps: 8, restSeconds: 120 },
      { exerciseId: 'ex3', sets: 4, reps: 6, restSeconds: 120 },
      { exerciseId: 'ex9', sets: 4, reps: 12, restSeconds: 60 },
      { exerciseId: 'ex10', sets: 3, reps: 15, restSeconds: 60 },
    ],
  },
  {
    id: 'wt4',
    name: 'HIIT Blast',
    category: 'hiit',
    duration: 25,
    difficulty: 'advanced',
    calories: 320,
    exercises: [
      { exerciseId: 'ex16', sets: 4, reps: 10, restSeconds: 30 },
      { exerciseId: 'ex17', sets: 4, reps: 30, restSeconds: 20 },
      { exerciseId: 'ex18', sets: 4, reps: 12, restSeconds: 30 },
      { exerciseId: 'ex19', sets: 4, reps: 15, restSeconds: 30 },
    ],
  },
  {
    id: 'wt5',
    name: 'Core Crusher',
    category: 'core',
    duration: 20,
    difficulty: 'beginner',
    calories: 150,
    exercises: [
      { exerciseId: 'ex21', sets: 3, reps: 60, restSeconds: 30 },
      { exerciseId: 'ex22', sets: 3, reps: 20, restSeconds: 30 },
      { exerciseId: 'ex23', sets: 3, reps: 20, restSeconds: 30 },
      { exerciseId: 'ex24', sets: 3, reps: 15, restSeconds: 30 },
      { exerciseId: 'ex25', sets: 3, reps: 16, restSeconds: 30 },
    ],
  },
  {
    id: 'wt6',
    name: 'Morning Yoga Flow',
    category: 'yoga',
    duration: 30,
    difficulty: 'beginner',
    calories: 100,
    exercises: [
      { exerciseId: 'ex30', sets: 5, reps: 1, restSeconds: 10 },
      { exerciseId: 'ex26', sets: 3, reps: 30, restSeconds: 10 },
      { exerciseId: 'ex27', sets: 2, reps: 30, restSeconds: 10 },
      { exerciseId: 'ex28', sets: 2, reps: 30, restSeconds: 10 },
      { exerciseId: 'ex29', sets: 2, reps: 60, restSeconds: 0 },
    ],
  },
  {
    id: 'wt7',
    name: 'Cardio Endurance',
    category: 'cardio',
    duration: 40,
    difficulty: 'intermediate',
    calories: 450,
    exercises: [
      { exerciseId: 'ex11', sets: 1, reps: 20, restSeconds: 60 },
      { exerciseId: 'ex12', sets: 1, reps: 15, restSeconds: 60 },
      { exerciseId: 'ex13', sets: 3, reps: 100, restSeconds: 60 },
    ],
  },
  {
    id: 'wt8',
    name: 'Recovery Stretch',
    category: 'stretching',
    duration: 15,
    difficulty: 'beginner',
    calories: 50,
    exercises: [
      { exerciseId: 'ex31', sets: 2, reps: 30, restSeconds: 10 },
      { exerciseId: 'ex32', sets: 2, reps: 30, restSeconds: 10 },
      { exerciseId: 'ex33', sets: 2, reps: 30, restSeconds: 10 },
      { exerciseId: 'ex34', sets: 2, reps: 30, restSeconds: 10 },
      { exerciseId: 'ex35', sets: 2, reps: 30, restSeconds: 10 },
    ],
  },
];

// Sample meal data
const mealDatabase = [
  // Breakfast
  { id: 'meal1', name: 'Oatmeal with Berries', category: 'breakfast', calories: 350, protein: 12, carbs: 58, fat: 8, fiber: 8, ingredients: ['oats', 'mixed berries', 'honey', 'almond milk'] },
  { id: 'meal2', name: 'Egg White Omelette', category: 'breakfast', calories: 280, protein: 28, carbs: 8, fat: 14, fiber: 2, ingredients: ['egg whites', 'spinach', 'tomatoes', 'feta cheese'] },
  { id: 'meal3', name: 'Greek Yogurt Parfait', category: 'breakfast', calories: 320, protein: 20, carbs: 42, fat: 8, fiber: 4, ingredients: ['greek yogurt', 'granola', 'honey', 'strawberries'] },
  { id: 'meal4', name: 'Avocado Toast', category: 'breakfast', calories: 380, protein: 12, carbs: 35, fat: 22, fiber: 10, ingredients: ['whole grain bread', 'avocado', 'eggs', 'cherry tomatoes'] },
  { id: 'meal5', name: 'Protein Smoothie Bowl', category: 'breakfast', calories: 420, protein: 30, carbs: 52, fat: 12, fiber: 8, ingredients: ['protein powder', 'banana', 'almond butter', 'berries', 'granola'] },
  
  // Lunch
  { id: 'meal6', name: 'Grilled Chicken Salad', category: 'lunch', calories: 450, protein: 42, carbs: 20, fat: 22, fiber: 6, ingredients: ['chicken breast', 'mixed greens', 'avocado', 'olive oil dressing'] },
  { id: 'meal7', name: 'Quinoa Buddha Bowl', category: 'lunch', calories: 520, protein: 18, carbs: 65, fat: 20, fiber: 12, ingredients: ['quinoa', 'chickpeas', 'roasted vegetables', 'tahini'] },
  { id: 'meal8', name: 'Turkey Wrap', category: 'lunch', calories: 420, protein: 32, carbs: 38, fat: 16, fiber: 4, ingredients: ['turkey breast', 'whole wheat tortilla', 'hummus', 'vegetables'] },
  { id: 'meal9', name: 'Salmon Poke Bowl', category: 'lunch', calories: 550, protein: 35, carbs: 55, fat: 18, fiber: 6, ingredients: ['salmon', 'sushi rice', 'edamame', 'seaweed', 'avocado'] },
  { id: 'meal10', name: 'Lentil Soup', category: 'lunch', calories: 380, protein: 22, carbs: 52, fat: 8, fiber: 16, ingredients: ['lentils', 'carrots', 'celery', 'tomatoes', 'spices'] },
  
  // Dinner
  { id: 'meal11', name: 'Grilled Salmon', category: 'dinner', calories: 480, protein: 45, carbs: 15, fat: 26, fiber: 4, ingredients: ['salmon fillet', 'asparagus', 'quinoa', 'lemon'] },
  { id: 'meal12', name: 'Chicken Stir Fry', category: 'dinner', calories: 420, protein: 38, carbs: 35, fat: 14, fiber: 6, ingredients: ['chicken', 'broccoli', 'bell peppers', 'brown rice', 'soy sauce'] },
  { id: 'meal13', name: 'Lean Beef Tacos', category: 'dinner', calories: 520, protein: 35, carbs: 42, fat: 22, fiber: 8, ingredients: ['lean ground beef', 'corn tortillas', 'lettuce', 'salsa', 'cheese'] },
  { id: 'meal14', name: 'Vegetable Curry', category: 'dinner', calories: 450, protein: 15, carbs: 55, fat: 20, fiber: 10, ingredients: ['mixed vegetables', 'coconut milk', 'curry spices', 'basmati rice'] },
  { id: 'meal15', name: 'Grilled Chicken Breast', category: 'dinner', calories: 380, protein: 48, carbs: 12, fat: 14, fiber: 4, ingredients: ['chicken breast', 'sweet potato', 'steamed broccoli'] },
  
  // Snacks
  { id: 'meal16', name: 'Protein Bar', category: 'snack', calories: 220, protein: 20, carbs: 25, fat: 8, fiber: 3, ingredients: ['protein blend', 'nuts', 'chocolate'] },
  { id: 'meal17', name: 'Apple with Almond Butter', category: 'snack', calories: 200, protein: 5, carbs: 28, fat: 10, fiber: 5, ingredients: ['apple', 'almond butter'] },
  { id: 'meal18', name: 'Greek Yogurt', category: 'snack', calories: 150, protein: 15, carbs: 12, fat: 4, fiber: 0, ingredients: ['greek yogurt'] },
  { id: 'meal19', name: 'Mixed Nuts', category: 'snack', calories: 180, protein: 6, carbs: 8, fat: 16, fiber: 2, ingredients: ['almonds', 'walnuts', 'cashews'] },
  { id: 'meal20', name: 'Protein Shake', category: 'snack', calories: 180, protein: 25, carbs: 8, fat: 4, fiber: 1, ingredients: ['whey protein', 'almond milk'] },
];

// ============================================
// EXPORT DATA AND HELPERS
// ============================================

module.exports = {
  users,
  workoutSessions,
  mealLogs,
  waterLogs,
  healthAssessments,
  workoutCategories,
  exercises,
  workoutTemplates,
  mealDatabase,
  
  // Helper to generate IDs
  generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),
  
  // Get exercise by ID with full details
  getExerciseById: (id) => exercises.find(e => e.id === id),
  
  // Get workout template with populated exercises
  getWorkoutWithExercises: (templateId) => {
    const template = workoutTemplates.find(w => w.id === templateId);
    if (!template) return null;
    
    return {
      ...template,
      exercises: template.exercises.map(ex => ({
        ...ex,
        exercise: exercises.find(e => e.id === ex.exerciseId),
      })),
    };
  },
};
