// ============================================
// Nexu Fitness - Interactive Main Screens
// Complete with real state management and API integration
// ============================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton, ProgressBar, TextInput } from '../../components/Button';
import { NexuLogo } from '../../components/NexuLogo';
import { COLORS } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { useDiet } from '../../context/DietContext';
import { apiClient } from '../../services/api';

const { width } = Dimensions.get('window');

// ============================================
// HOME SCREEN - Professional Dashboard
// ============================================
export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { categories, workouts, fetchCategories, fetchWorkouts, currentSession } = useWorkout();
  const { todaysTotals, macroGoals, fetchDietPlan, fetchTodaysLog, waterLog, logWater, fetchWaterLog } = useDiet();

  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState({
    totalWorkouts: 0,
    currentStreak: 0,
    totalCaloriesBurned: 0,
  });
  const [todaysWorkout, setTodaysWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load data in the background — don't block the dashboard render
  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Fire-and-forget: load data in background, don't block UI
      const promises: Promise<any>[] = [];

      // Only call these if the context functions exist and backend is available
      if (fetchCategories) promises.push(fetchCategories().catch(() => {}));
      if (fetchWorkouts) promises.push(fetchWorkouts().catch(() => {}));
      if (fetchDietPlan) promises.push(fetchDietPlan(user.id).catch(() => {}));
      if (fetchTodaysLog) promises.push(fetchTodaysLog(user.id).catch(() => {}));
      if (fetchWaterLog) promises.push(fetchWaterLog(user.id).catch(() => {}));

      await Promise.all(promises);

      // Try to fetch stats from backend, but don't block on failure
      try {
        const statsResponse = await apiClient.get<{ stats: any }>(`/users/${user.id}/stats`);
        if (statsResponse.success && statsResponse.data) {
          setUserStats(statsResponse.data.stats || {});
        }
      } catch {
        // Backend not available — use defaults silently
      }
    } catch (error) {
      // Silently handle — dashboard still shows with default data
    }
  }, [user?.id]);

  // Pick a today's workout when workouts are available
  useEffect(() => {
    if (workouts && workouts.length > 0 && !todaysWorkout) {
      setTodaysWorkout(workouts[Math.floor(Math.random() * workouts.length)]);
    }
  }, [workouts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogWater = async () => {
    if (user?.id) {
      await logWater(user.id, 1);
    }
  };

  const calorieProgress = macroGoals?.calories
    ? Math.min((todaysTotals.calories / macroGoals.calories) * 100, 100)
    : 0;
  const proteinProgress = macroGoals?.protein
    ? Math.min((todaysTotals.protein / macroGoals.protein) * 100, 100)
    : 0;
  const carbsProgress = macroGoals?.carbs
    ? Math.min((todaysTotals.carbs / macroGoals.carbs) * 100, 100)
    : 0;
  const fatProgress = macroGoals?.fat
    ? Math.min((todaysTotals.fat / macroGoals.fat) * 100, 100)
    : 0;
  const waterGlasses = waterLog?.glasses || 0;
  const waterProgress = Math.min((waterGlasses / 8) * 100, 100);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* ===== HEADER ===== */}
      <View style={homeStyles.header}>
        <View style={homeStyles.headerLeft}>
          <View style={homeStyles.avatar}>
            <Text style={homeStyles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'N'}
            </Text>
          </View>
          <View>
            <Text style={homeStyles.greetingSmall}>{getGreeting()}</Text>
            <Text style={homeStyles.userName}>{user?.name?.split(' ')[0] || 'User'}</Text>
          </View>
        </View>
        <TouchableOpacity style={homeStyles.bellButton}>
          <Feather name="bell" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* ===== ACTIVE SESSION BANNER ===== */}
      {currentSession && (
        <TouchableOpacity
          style={homeStyles.sessionBanner}
          onPress={() => navigation.navigate('ActiveWorkout')}
          activeOpacity={0.85}
        >
          <Feather name="play-circle" size={28} color={COLORS.secondary} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={homeStyles.sessionTitle}>Workout in Progress</Text>
            <Text style={homeStyles.sessionName}>{currentSession.workoutName}</Text>
          </View>
          <Feather name="chevron-right" size={22} color={COLORS.secondary} />
        </TouchableOpacity>
      )}

      {/* ===== STATS ROW ===== */}
      <View style={homeStyles.statsRow}>
        <View style={homeStyles.statCard}>
          <View style={[homeStyles.statIconBg, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
            <Feather name="zap" size={20} color="#FF6B6B" />
          </View>
          <Text style={homeStyles.statValue}>{userStats.totalCaloriesBurned || 0}</Text>
          <Text style={homeStyles.statLabel}>Calories</Text>
        </View>
        <View style={homeStyles.statCard}>
          <View style={[homeStyles.statIconBg, { backgroundColor: 'rgba(255, 214, 10, 0.15)' }]}>
            <Feather name="target" size={20} color={COLORS.primary} />
          </View>
          <Text style={homeStyles.statValue}>{userStats.totalWorkouts || 0}</Text>
          <Text style={homeStyles.statLabel}>Workouts</Text>
        </View>
        <View style={homeStyles.statCard}>
          <View style={[homeStyles.statIconBg, { backgroundColor: 'rgba(78, 205, 196, 0.15)' }]}>
            <Feather name="trending-up" size={20} color="#4ECDC4" />
          </View>
          <Text style={homeStyles.statValue}>{userStats.currentStreak || 0}</Text>
          <Text style={homeStyles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* ===== TODAY'S WORKOUT ===== */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Today's Workout</Text>
          <TouchableOpacity onPress={() => navigation.navigate('WorkoutsTab')}>
            <Text style={homeStyles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {todaysWorkout ? (
          <TouchableOpacity
            style={homeStyles.workoutCard}
            onPress={() => navigation.navigate('WorkoutDetail', { workout: todaysWorkout })}
            activeOpacity={0.85}
          >
            <View style={homeStyles.workoutBanner}>
              <Text style={{ fontSize: 44 }}>
                {todaysWorkout.category === 'strength' ? '💪' :
                 todaysWorkout.category === 'cardio' ? '🏃' :
                 todaysWorkout.category === 'yoga' ? '🧘' : '⚡'}
              </Text>
            </View>
            <View style={homeStyles.workoutBody}>
              <Text style={homeStyles.workoutCategory}>{todaysWorkout.category?.toUpperCase()}</Text>
              <Text style={homeStyles.workoutName}>{todaysWorkout.name}</Text>
              <View style={homeStyles.workoutMeta}>
                <View style={homeStyles.metaChip}>
                  <Feather name="clock" size={13} color={COLORS.gray400} />
                  <Text style={homeStyles.metaText}>{todaysWorkout.duration} min</Text>
                </View>
                <View style={homeStyles.metaChip}>
                  <Feather name="zap" size={13} color={COLORS.gray400} />
                  <Text style={homeStyles.metaText}>{todaysWorkout.calories} cal</Text>
                </View>
                <View style={homeStyles.metaChip}>
                  <Feather name="bar-chart-2" size={13} color={COLORS.gray400} />
                  <Text style={homeStyles.metaText}>{todaysWorkout.difficulty}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={homeStyles.startBtn}
                onPress={() => navigation.navigate('WorkoutDetail', { workout: todaysWorkout })}
                activeOpacity={0.8}
              >
                <Text style={homeStyles.startBtnText}>Start Workout</Text>
                <Feather name="arrow-right" size={18} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={homeStyles.emptyWorkout}
            onPress={() => navigation.navigate('WorkoutsTab')}
            activeOpacity={0.8}
          >
            <View style={homeStyles.emptyIconBg}>
              <Feather name="plus" size={28} color={COLORS.primary} />
            </View>
            <Text style={homeStyles.emptyTitle}>No workout planned</Text>
            <Text style={homeStyles.emptySub}>Tap to pick a workout</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== NUTRITION OVERVIEW ===== */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Nutrition</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DietTab')}>
            <Text style={homeStyles.seeAll}>Details</Text>
          </TouchableOpacity>
        </View>

        <View style={homeStyles.nutritionCard}>
          {/* Calorie ring placeholder */}
          <View style={homeStyles.calorieRow}>
            <View style={homeStyles.calorieCircle}>
              <Text style={homeStyles.calorieNumber}>{todaysTotals.calories}</Text>
              <Text style={homeStyles.calorieUnit}>kcal</Text>
            </View>
            <View style={homeStyles.calorieRight}>
              <Text style={homeStyles.calorieGoal}>
                of {macroGoals?.calories || 2000} kcal goal
              </Text>
              <ProgressBar progress={calorieProgress} color={COLORS.primary} height={6} />
              <Text style={homeStyles.caloriePercent}>{Math.round(calorieProgress)}% complete</Text>
            </View>
          </View>

          {/* Macros */}
          <View style={homeStyles.macroGrid}>
            <View style={homeStyles.macroCard}>
              <View style={homeStyles.macroTop}>
                <View style={[homeStyles.macroDot, { backgroundColor: '#FF6B6B' }]} />
                <Text style={homeStyles.macroName}>Protein</Text>
              </View>
              <Text style={homeStyles.macroVal}>{todaysTotals.protein}g</Text>
              <ProgressBar progress={proteinProgress} color="#FF6B6B" height={4} />
            </View>
            <View style={homeStyles.macroCard}>
              <View style={homeStyles.macroTop}>
                <View style={[homeStyles.macroDot, { backgroundColor: '#4ECDC4' }]} />
                <Text style={homeStyles.macroName}>Carbs</Text>
              </View>
              <Text style={homeStyles.macroVal}>{todaysTotals.carbs}g</Text>
              <ProgressBar progress={carbsProgress} color="#4ECDC4" height={4} />
            </View>
            <View style={homeStyles.macroCard}>
              <View style={homeStyles.macroTop}>
                <View style={[homeStyles.macroDot, { backgroundColor: '#A78BFA' }]} />
                <Text style={homeStyles.macroName}>Fat</Text>
              </View>
              <Text style={homeStyles.macroVal}>{todaysTotals.fat}g</Text>
              <ProgressBar progress={fatProgress} color="#A78BFA" height={4} />
            </View>
          </View>
        </View>
      </View>

      {/* ===== WATER INTAKE ===== */}
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>Water</Text>
          <Text style={homeStyles.waterCount}>{waterGlasses}/8 glasses</Text>
        </View>

        <View style={homeStyles.waterCard}>
          <View style={homeStyles.waterBarBg}>
            <View style={[homeStyles.waterBarFill, { width: `${waterProgress}%` }]} />
          </View>
          <View style={homeStyles.waterRow}>
            <View style={homeStyles.waterDots}>
              {[...Array(8)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    homeStyles.waterDot,
                    i < waterGlasses && homeStyles.waterDotFilled,
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity style={homeStyles.addWaterBtn} onPress={handleLogWater} activeOpacity={0.8}>
              <Feather name="plus" size={18} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ===== QUICK ACTIONS ===== */}
      <View style={homeStyles.section}>
        <Text style={homeStyles.sectionTitle}>Quick Actions</Text>
        <View style={homeStyles.actionsRow}>
          <TouchableOpacity
            style={homeStyles.actionCard}
            onPress={() => navigation.navigate('WorkoutsTab')}
            activeOpacity={0.8}
          >
            <View style={[homeStyles.actionIcon, { backgroundColor: 'rgba(255, 214, 10, 0.12)' }]}>
              <Feather name="activity" size={22} color={COLORS.primary} />
            </View>
            <Text style={homeStyles.actionLabel}>Workouts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={homeStyles.actionCard}
            onPress={() => navigation.navigate('DietTab')}
            activeOpacity={0.8}
          >
            <View style={[homeStyles.actionIcon, { backgroundColor: 'rgba(78, 205, 196, 0.12)' }]}>
              <Feather name="heart" size={22} color="#4ECDC4" />
            </View>
            <Text style={homeStyles.actionLabel}>Nutrition</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={homeStyles.actionCard}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.8}
          >
            <View style={[homeStyles.actionIcon, { backgroundColor: 'rgba(167, 139, 250, 0.12)' }]}>
              <Feather name="user" size={22} color="#A78BFA" />
            </View>
            <Text style={homeStyles.actionLabel}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={homeStyles.actionCard}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.8}
          >
            <View style={[homeStyles.actionIcon, { backgroundColor: 'rgba(255, 107, 107, 0.12)' }]}>
              <Feather name="award" size={22} color="#FF6B6B" />
            </View>
            <Text style={homeStyles.actionLabel}>Goals</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// ---- HOME-SPECIFIC STYLES ----
const homeStyles = StyleSheet.create({
  loadingText: {
    color: COLORS.gray500,
    fontFamily: 'Montserrat_400Regular',
    marginTop: 16,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.secondary,
  },
  greetingSmall: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.text,
    marginTop: -2,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray800,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Active session
  sessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: COLORS.secondary,
  },
  sessionName: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.secondary,
    opacity: 0.7,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.gray800,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
    marginTop: 2,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.primary,
  },

  // Workout card
  workoutCard: {
    backgroundColor: COLORS.gray800,
    borderRadius: 20,
    overflow: 'hidden',
  },
  workoutBanner: {
    height: 100,
    backgroundColor: 'rgba(255, 214, 10, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutBody: {
    padding: 18,
  },
  workoutCategory: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  workoutName: {
    fontSize: 20,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.text,
    marginBottom: 12,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray700,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray400,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 50,
    gap: 8,
  },
  startBtnText: {
    fontSize: 16,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.secondary,
  },

  // Empty workout
  emptyWorkout: {
    backgroundColor: COLORS.gray800,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray700,
    borderStyle: 'dashed',
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 214, 10, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
  },

  // Nutrition card
  nutritionCard: {
    backgroundColor: COLORS.gray800,
    borderRadius: 20,
    padding: 20,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  calorieNumber: {
    fontSize: 24,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.primary,
    lineHeight: 28,
  },
  calorieUnit: {
    fontSize: 11,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
    marginTop: -4,
  },
  calorieRight: {
    flex: 1,
  },
  calorieGoal: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.text,
    marginBottom: 8,
  },
  caloriePercent: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
    marginTop: 6,
  },

  // Macros
  macroGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  macroCard: {
    flex: 1,
    backgroundColor: COLORS.gray700,
    borderRadius: 14,
    padding: 14,
  },
  macroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  macroName: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.gray400,
  },
  macroVal: {
    fontSize: 18,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.text,
    marginBottom: 8,
  },

  // Water
  waterCard: {
    backgroundColor: COLORS.gray800,
    borderRadius: 20,
    padding: 18,
  },
  waterCount: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.gray400,
  },
  waterBarBg: {
    height: 8,
    backgroundColor: COLORS.gray700,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  waterBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  waterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waterDots: {
    flexDirection: 'row',
    gap: 8,
  },
  waterDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray700,
    borderWidth: 1,
    borderColor: COLORS.gray600,
  },
  waterDotFilled: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  addWaterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick actions
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.gray800,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.gray400,
  },
});

// ============================================
// WORKOUT SCREEN - Categories & Workouts List
// ============================================
export const WorkoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { 
    categories, 
    workouts, 
    isLoading, 
    fetchCategories, 
    fetchWorkouts,
    workoutHistory,
    fetchHistory 
  } = useWorkout();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchWorkouts();
    if (user?.id) {
      fetchHistory(user.id);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts(selectedCategory || undefined);
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkouts(selectedCategory || undefined);
    setRefreshing(false);
  };

  const filteredWorkouts = selectedCategory 
    ? workouts.filter(w => w.category === selectedCategory)
    : workouts;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Workouts</Text>
        <TouchableOpacity onPress={() => navigation.navigate('WorkoutHistory')}>
          <Text style={styles.historyButton}>📋 History</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipActive,
              { borderColor: cat.color }
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[
              styles.categoryChipText,
              selectedCategory === cat.id && styles.categoryChipTextActive
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Workouts List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredWorkouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏋️</Text>
          <Text style={styles.emptyText}>No workouts found</Text>
          <Text style={styles.emptySubtext}>Try selecting a different category</Text>
        </View>
      ) : (
        <View style={styles.workoutsList}>
          {filteredWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutListCard}
              onPress={() => navigation.navigate('WorkoutDetail', { workout })}
            >
              <View style={[styles.workoutListImage, { backgroundColor: getCategoryColor(workout.category) }]}>
                <Text style={styles.workoutListIcon}>
                  {workout.category === 'strength' ? '💪' : 
                   workout.category === 'cardio' ? '🏃' : 
                   workout.category === 'yoga' ? '🧘' :
                   workout.category === 'hiit' ? '⚡' :
                   workout.category === 'core' ? '🎯' : '🤸'}
                </Text>
              </View>
              <View style={styles.workoutListInfo}>
                <Text style={styles.workoutListName}>{workout.name}</Text>
                <View style={styles.workoutListMeta}>
                  <Text style={styles.workoutListMetaText}>⏱️ {workout.duration} min</Text>
                  <Text style={styles.workoutListMetaText}>🔥 {workout.calories} cal</Text>
                </View>
                <View style={styles.workoutListFooter}>
                  <View style={[styles.difficultyBadge, getDifficultyStyle(workout.difficulty)]}>
                    <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                  </View>
                  <Text style={styles.exerciseCount}>{workout.exercises?.length || 0} exercises</Text>
                </View>
              </View>
              <Text style={styles.workoutListArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recent Workouts */}
      {workoutHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {workoutHistory.slice(0, 3).map((session) => (
            <View key={session.id} style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Text>✅</Text>
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyName}>{session.workoutName}</Text>
                <Text style={styles.historyMeta}>
                  {new Date(session.completedAt || '').toLocaleDateString()} • 
                  {Math.round((session.totalDuration || 0) / 60)} min • 
                  {session.caloriesBurned || 0} cal
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// ============================================
// WORKOUT DETAIL SCREEN
// ============================================
export const WorkoutDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { workout } = route.params;
  const { user } = useAuth();
  const { startWorkout, isLoading } = useWorkout();
  const [showExercises, setShowExercises] = useState(true);

  const handleStartWorkout = async () => {
    if (!user?.id) return;
    
    const session = await startWorkout(workout.id, user.id);
    if (session) {
      navigation.navigate('ActiveWorkout', { session, workout });
    } else {
      Alert.alert('Error', 'Failed to start workout. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.detailBanner, { backgroundColor: getCategoryColor(workout.category) }]}>
        <Text style={styles.detailIcon}>
          {workout.category === 'strength' ? '💪' : 
           workout.category === 'cardio' ? '🏃' : 
           workout.category === 'yoga' ? '🧘' : '⚡'}
        </Text>
        <Text style={styles.detailName}>{workout.name}</Text>
        <View style={styles.detailStats}>
          <View style={styles.detailStat}>
            <Text style={styles.detailStatValue}>{workout.duration}</Text>
            <Text style={styles.detailStatLabel}>minutes</Text>
          </View>
          <View style={styles.detailStatDivider} />
          <View style={styles.detailStat}>
            <Text style={styles.detailStatValue}>{workout.calories}</Text>
            <Text style={styles.detailStatLabel}>calories</Text>
          </View>
          <View style={styles.detailStatDivider} />
          <View style={styles.detailStat}>
            <Text style={styles.detailStatValue}>{workout.exercises?.length || 0}</Text>
            <Text style={styles.detailStatLabel}>exercises</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.exercisesHeader}
          onPress={() => setShowExercises(!showExercises)}
        >
          <Text style={styles.sectionTitle}>Exercises</Text>
          <Text style={styles.toggleIcon}>{showExercises ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {showExercises && workout.exercises?.map((ex: any, index: number) => (
          <View key={ex.exerciseId || index} style={styles.exerciseItem}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{ex.exercise?.name || 'Exercise'}</Text>
              <Text style={styles.exerciseMeta}>
                {ex.sets} sets × {ex.reps} reps • {ex.restSeconds}s rest
              </Text>
              {ex.exercise?.instructions && (
                <Text style={styles.exerciseInstructions} numberOfLines={2}>
                  {ex.exercise.instructions}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.startButtonContainer}>
        <PrimaryButton
          title={isLoading ? "Starting..." : "Start Workout 🚀"}
          onPress={handleStartWorkout}
          loading={isLoading}
        />
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

// ============================================
// ACTIVE WORKOUT SCREEN - Real-time tracking
// ============================================
export const ActiveWorkoutScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { session, workout } = route.params;
  const { logSet, completeExercise, completeWorkout, cancelWorkout, currentSession } = useWorkout();
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(Date.now());

  const exercises = currentSession?.exercises || session?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const totalSets = currentExercise?.sets || 3;

  // Main workout timer
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  // Rest timer
  useEffect(() => {
    if (isResting && restTimer > 0) {
      const interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isResting, restTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleLogSet = () => {
    const setData = {
      setNumber: currentSetIndex + 1,
      reps: parseInt(reps) || currentExercise?.reps || 10,
      weight: parseFloat(weight) || undefined,
      timestamp: new Date().toISOString(),
      completed: true,
    };

    logSet(currentExerciseIndex, setData);

    if (currentSetIndex + 1 >= totalSets) {
      // Move to next exercise
      completeExercise(currentExerciseIndex);
      if (currentExerciseIndex + 1 >= exercises.length) {
        // Workout complete
        setShowCompleteModal(true);
      } else {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSetIndex(0);
        setIsResting(true);
        setRestTimer(60); // Rest between exercises
      }
    } else {
      // Next set
      setCurrentSetIndex(prev => prev + 1);
      setIsResting(true);
      setRestTimer(currentExercise?.restSeconds || 60);
    }

    setReps('');
    setWeight('');
  };

  const handleFinishWorkout = async () => {
    const success = await completeWorkout(timer);
    if (success) {
      Alert.alert(
        '🎉 Workout Complete!',
        `Great job! You burned approximately ${Math.round(timer / 60 * 8)} calories in ${formatTime(timer)}.`,
        [{ text: 'Done', onPress: () => navigation.popToTop() }]
      );
    }
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      'Cancel Workout?',
      'Your progress will not be saved.',
      [
        { text: 'Continue Workout', style: 'cancel' },
        { 
          text: 'Cancel', 
          style: 'destructive',
          onPress: async () => {
            await cancelWorkout();
            navigation.goBack();
          }
        },
      ]
    );
  };

  if (!currentExercise) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>No exercise data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.activeHeader}>
        <TouchableOpacity onPress={handleCancelWorkout}>
          <Text style={styles.cancelText}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.activeTitle}>{workout?.name || 'Workout'}</Text>
        <TouchableOpacity onPress={() => setIsPaused(!isPaused)}>
          <Text style={styles.pauseText}>{isPaused ? '▶' : '⏸'}</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>
          Exercise {currentExerciseIndex + 1} of {exercises.length}
        </Text>
        <Text style={styles.timerText}>{formatTime(timer)}</Text>
      </View>
      <ProgressBar 
        progress={(currentExerciseIndex / exercises.length) * 100} 
        color={COLORS.primary} 
      />

      {/* Rest Screen */}
      {isResting ? (
        <View style={styles.restScreen}>
          <Text style={styles.restTitle}>Rest Time</Text>
          <View style={styles.restTimerCircle}>
            <Text style={styles.restTimerText}>{restTimer}</Text>
            <Text style={styles.restTimerLabel}>seconds</Text>
          </View>
          <Text style={styles.upNextLabel}>Up Next:</Text>
          <Text style={styles.upNextExercise}>
            {exercises[currentExerciseIndex]?.exercise?.name || 'Next Exercise'}
          </Text>
          <TouchableOpacity 
            style={styles.skipRestButton}
            onPress={() => setIsResting(false)}
          >
            <Text style={styles.skipRestText}>Skip Rest →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.exerciseScreen}>
          {/* Current Exercise */}
          <View style={styles.currentExercise}>
            <View style={styles.exerciseIconLarge}>
              <Text style={{ fontSize: 48 }}>
                {currentExercise.exercise?.muscleGroup === 'legs' ? '🦵' :
                 currentExercise.exercise?.muscleGroup === 'chest' ? '💪' :
                 currentExercise.exercise?.muscleGroup === 'back' ? '🔙' :
                 currentExercise.exercise?.muscleGroup === 'core' ? '🎯' : '🏋️'}
              </Text>
            </View>
            <Text style={styles.currentExerciseName}>
              {currentExercise.exercise?.name || 'Exercise'}
            </Text>
            <Text style={styles.currentExerciseTarget}>
              Set {currentSetIndex + 1} of {totalSets} • Target: {currentExercise.reps} reps
            </Text>
          </View>

          {/* Instructions */}
          {currentExercise.exercise?.instructions && (
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>💡 How to perform:</Text>
              <Text style={styles.instructionsText}>
                {currentExercise.exercise.instructions}
              </Text>
            </View>
          )}

          {/* Log Set */}
          <View style={styles.logSetCard}>
            <Text style={styles.logSetTitle}>Log this set</Text>
            <View style={styles.logSetInputs}>
              <View style={styles.logSetInput}>
                <Text style={styles.logSetLabel}>Reps</Text>
                <TextInput
                  placeholder={String(currentExercise.reps)}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.logSetInput}>
                <Text style={styles.logSetLabel}>Weight (kg)</Text>
                <TextInput
                  placeholder="0"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <PrimaryButton title="Complete Set ✓" onPress={handleLogSet} />
          </View>

          {/* Sets Progress */}
          <View style={styles.setsProgress}>
            {[...Array(totalSets)].map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.setDot,
                  i < currentSetIndex && styles.setDotComplete,
                  i === currentSetIndex && styles.setDotCurrent,
                ]}
              >
                <Text style={styles.setDotText}>
                  {i < currentSetIndex ? '✓' : i + 1}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Complete Modal */}
      <Modal visible={showCompleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>🎉</Text>
            <Text style={styles.modalTitle}>Workout Complete!</Text>
            <Text style={styles.modalStats}>
              Duration: {formatTime(timer)}{'\n'}
              Exercises: {exercises.length}{'\n'}
              Est. Calories: {Math.round(timer / 60 * 8)}
            </Text>
            <PrimaryButton title="Finish" onPress={handleFinishWorkout} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ============================================
// DIET SCREEN - Meal tracking & nutrition
// ============================================
export const DietScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { 
    todaysMeals, 
    todaysTotals, 
    macroGoals, 
    availableMeals,
    waterLog,
    isLoading,
    fetchTodaysLog,
    fetchAvailableMeals,
    logMeal,
    removeMealLog,
    logWater,
    fetchWaterLog,
  } = useDiet();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');

  useEffect(() => {
    if (user?.id) {
      fetchTodaysLog(user.id);
      fetchAvailableMeals();
      fetchWaterLog(user.id);
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await fetchTodaysLog(user.id);
    }
    setRefreshing(false);
  };

  const handleAddMeal = async (meal: any) => {
    if (user?.id) {
      const success = await logMeal(user.id, meal.id, selectedMealType);
      if (success) {
        setShowAddMeal(false);
        Alert.alert('Success', 'Meal logged successfully!');
      }
    }
  };

  const handleRemoveMeal = async (entryId: string) => {
    if (user?.id) {
      Alert.alert(
        'Remove Meal?',
        'This will remove the meal from your log.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => removeMealLog(user.id, entryId) },
        ]
      );
    }
  };

  const caloriesRemaining = (macroGoals?.calories || 2000) - todaysTotals.calories;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Nutrition</Text>
        <TouchableOpacity onPress={() => setShowAddMeal(true)}>
          <Text style={styles.addButton}>+ Add Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Calorie Summary */}
      <View style={styles.calorieCard}>
        <View style={styles.calorieCircle}>
          <Text style={styles.calorieMain}>{caloriesRemaining}</Text>
          <Text style={styles.calorieLabel}>remaining</Text>
        </View>
        <View style={styles.calorieDetails}>
          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabelSmall}>Goal</Text>
            <Text style={styles.calorieValue}>{macroGoals?.calories || 2000}</Text>
          </View>
          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabelSmall}>Food</Text>
            <Text style={styles.calorieValue}>- {todaysTotals.calories}</Text>
          </View>
          <View style={styles.calorieDivider} />
          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabelSmall}>Remaining</Text>
            <Text style={[styles.calorieValue, caloriesRemaining < 0 && styles.calorieNegative]}>
              {caloriesRemaining}
            </Text>
          </View>
        </View>
      </View>

      {/* Macros */}
      <View style={styles.macrosCard}>
        <Text style={styles.macrosTitle}>Macronutrients</Text>
        <View style={styles.macrosGrid}>
          <View style={styles.macroBox}>
            <View style={[styles.macroProgress, { backgroundColor: '#FF6B6B20' }]}>
              <View style={[
                styles.macroProgressFill, 
                { 
                  backgroundColor: '#FF6B6B',
                  width: `${Math.min((todaysTotals.protein / (macroGoals?.protein || 150)) * 100, 100)}%`
                }
              ]} />
            </View>
            <Text style={styles.macroName}>Protein</Text>
            <Text style={styles.macroAmount}>{todaysTotals.protein}g / {macroGoals?.protein || 150}g</Text>
          </View>
          <View style={styles.macroBox}>
            <View style={[styles.macroProgress, { backgroundColor: '#4ECDC420' }]}>
              <View style={[
                styles.macroProgressFill, 
                { 
                  backgroundColor: '#4ECDC4',
                  width: `${Math.min((todaysTotals.carbs / (macroGoals?.carbs || 200)) * 100, 100)}%`
                }
              ]} />
            </View>
            <Text style={styles.macroName}>Carbs</Text>
            <Text style={styles.macroAmount}>{todaysTotals.carbs}g / {macroGoals?.carbs || 200}g</Text>
          </View>
          <View style={styles.macroBox}>
            <View style={[styles.macroProgress, { backgroundColor: '#A78BFA20' }]}>
              <View style={[
                styles.macroProgressFill, 
                { 
                  backgroundColor: '#A78BFA',
                  width: `${Math.min((todaysTotals.fat / (macroGoals?.fat || 70)) * 100, 100)}%`
                }
              ]} />
            </View>
            <Text style={styles.macroName}>Fat</Text>
            <Text style={styles.macroAmount}>{todaysTotals.fat}g / {macroGoals?.fat || 70}g</Text>
          </View>
        </View>
      </View>

      {/* Water */}
      <View style={styles.waterSection}>
        <View style={styles.waterHeader}>
          <Text style={styles.sectionTitle}>💧 Water Intake</Text>
          <Text style={styles.waterCount}>{waterLog?.glasses || 0} / 8</Text>
        </View>
        <View style={styles.waterGlassRow}>
          {[...Array(8)].map((_, i) => (
            <TouchableOpacity 
              key={i} 
              style={[
                styles.waterGlassButton,
                i < (waterLog?.glasses || 0) && styles.waterGlassFilled
              ]}
              onPress={() => user?.id && logWater(user.id, 1)}
            >
              <Text style={styles.waterGlassIcon}>
                {i < (waterLog?.glasses || 0) ? '💧' : '○'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Today's Meals */}
      <View style={styles.mealsSection}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        
        {todaysMeals.length === 0 ? (
          <View style={styles.emptyMeals}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No meals logged yet</Text>
            <TouchableOpacity onPress={() => setShowAddMeal(true)}>
              <Text style={styles.emptyAction}>+ Log your first meal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          todaysMeals.map((entry) => (
            <View key={entry.id} style={styles.mealEntry}>
              <View style={styles.mealEntryIcon}>
                <Text style={{ fontSize: 24 }}>
                  {entry.type === 'breakfast' ? '🥞' :
                   entry.type === 'lunch' ? '🥗' :
                   entry.type === 'dinner' ? '🍽️' : '🍎'}
                </Text>
              </View>
              <View style={styles.mealEntryInfo}>
                <Text style={styles.mealEntryName}>{entry.name}</Text>
                <Text style={styles.mealEntryMeta}>
                  {entry.type} • {entry.calories} cal • {entry.protein}g protein
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveMeal(entry.id)}>
                <Text style={styles.mealEntryDelete}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Add Meal Modal */}
      <Modal visible={showAddMeal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.addMealModal}>
            <View style={styles.addMealHeader}>
              <Text style={styles.addMealTitle}>Add Meal</Text>
              <TouchableOpacity onPress={() => setShowAddMeal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal style={styles.mealTypeScroll}>
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.mealTypeChip, selectedMealType === type && styles.mealTypeChipActive]}
                  onPress={() => setSelectedMealType(type)}
                >
                  <Text style={[styles.mealTypeText, selectedMealType === type && styles.mealTypeTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={styles.mealsList}>
              {availableMeals
                .filter(m => m.type === selectedMealType || m.category === selectedMealType)
                .map((meal) => (
                  <TouchableOpacity
                    key={meal.id}
                    style={styles.mealOption}
                    onPress={() => handleAddMeal(meal)}
                  >
                    <View style={styles.mealOptionInfo}>
                      <Text style={styles.mealOptionName}>{meal.name}</Text>
                      <Text style={styles.mealOptionMeta}>
                        {meal.calories} cal • {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
                      </Text>
                    </View>
                    <Text style={styles.mealOptionAdd}>+</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// ============================================
// PROFILE SCREEN
// ============================================
export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      apiClient.get(`/users/${user.id}/stats`).then((res) => {
        if (res.success && res.data) {
          setStats(res.data);
        }
      });
    }
  }, [user?.id]);

  const handleSave = () => {
    updateUser({ name });
    setEditing(false);
    Alert.alert('Success', 'Profile updated!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const fitnessProfile = (user as any)?.fitnessProfile;

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: 'settings' as const, label: 'Settings', screen: 'Settings' },
        { icon: 'credit-card' as const, label: 'Subscription', screen: 'SubscriptionPlans' },
      ],
    },
    {
      title: 'Fitness',
      items: [
        { icon: 'bar-chart-2' as const, label: 'Health Data', screen: 'HealthData' },
        { icon: 'target' as const, label: 'Goals', screen: 'Goals' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle' as const, label: 'Help & Support', screen: 'HelpSupport' },
        { icon: 'file-text' as const, label: 'Terms & Privacy', screen: 'TermsPrivacy' },
      ],
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={profStyles.header}>
        <Text style={profStyles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={profStyles.profileCard}>
        <View style={profStyles.avatarRow}>
          <View style={profStyles.avatar}>
            <Text style={profStyles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'N'}
            </Text>
          </View>
          <View style={profStyles.userInfo}>
            {editing ? (
              <View style={profStyles.editRow}>
                <View style={profStyles.editInputWrap}>
                  <Feather name="edit-2" size={16} color={COLORS.gray500} style={{ marginRight: 8 }} />
                  <View style={{ flex: 1 }}>
                    {/* @ts-ignore */}
                    <TextInput
                      placeholder="Your name"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>
                <View style={profStyles.editActions}>
                  <TouchableOpacity onPress={() => setEditing(false)} style={profStyles.editCancel}>
                    <Feather name="x" size={18} color={COLORS.gray400} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSave} style={profStyles.editSave}>
                    <Feather name="check" size={18} color={COLORS.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={profStyles.userName}>{user?.name || 'User'}</Text>
                <Text style={profStyles.userEmail}>{user?.email}</Text>
              </>
            )}
          </View>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)} style={profStyles.editBtn}>
              <Feather name="edit-2" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Plan badge */}
        <View style={profStyles.planBadge}>
          <Feather
            name={user?.subscriptionPlan === 'premium' ? 'award' : 'star'}
            size={14}
            color={COLORS.primary}
          />
          <Text style={profStyles.planText}>
            {user?.subscriptionPlan === 'premium' ? 'Premium Plan' : 'Free Plan'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SubscriptionPlans')}>
            <Text style={profStyles.upgradeTxt}>
              {user?.subscriptionPlan === 'premium' ? 'Manage' : 'Upgrade'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={profStyles.statsGrid}>
        <View style={profStyles.statBox}>
          <Feather name="zap" size={18} color="#FF6B6B" />
          <Text style={profStyles.statNum}>{stats?.stats?.totalWorkouts || 0}</Text>
          <Text style={profStyles.statLbl}>Workouts</Text>
        </View>
        <View style={profStyles.statBox}>
          <Feather name="clock" size={18} color={COLORS.primary} />
          <Text style={profStyles.statNum}>{stats?.stats?.totalMinutes || 0}</Text>
          <Text style={profStyles.statLbl}>Minutes</Text>
        </View>
        <View style={profStyles.statBox}>
          <Feather name="trending-up" size={18} color="#4ECDC4" />
          <Text style={profStyles.statNum}>{stats?.stats?.totalCaloriesBurned || 0}</Text>
          <Text style={profStyles.statLbl}>Calories</Text>
        </View>
        <View style={profStyles.statBox}>
          <Feather name="award" size={18} color="#A78BFA" />
          <Text style={profStyles.statNum}>{stats?.stats?.currentStreak || 0}</Text>
          <Text style={profStyles.statLbl}>Streak</Text>
        </View>
      </View>

      {/* Body Metrics (from Firestore fitness profile) */}
      {fitnessProfile && (
        <View style={profStyles.metricsCard}>
          <Text style={profStyles.metricsTitle}>Body Metrics</Text>
          <View style={profStyles.metricsRow}>
            <View style={profStyles.metricItem}>
              <Text style={profStyles.metricVal}>{fitnessProfile.age}</Text>
              <Text style={profStyles.metricLbl}>Age</Text>
            </View>
            <View style={profStyles.metricDivider} />
            <View style={profStyles.metricItem}>
              <Text style={profStyles.metricVal}>{fitnessProfile.height}</Text>
              <Text style={profStyles.metricLbl}>cm</Text>
            </View>
            <View style={profStyles.metricDivider} />
            <View style={profStyles.metricItem}>
              <Text style={profStyles.metricVal}>{fitnessProfile.weight}</Text>
              <Text style={profStyles.metricLbl}>kg</Text>
            </View>
          </View>
        </View>
      )}

      {/* Menu Sections */}
      {menuSections.map((section, sIdx) => (
        <View key={sIdx} style={profStyles.menuSection}>
          <Text style={profStyles.menuSectionTitle}>{section.title}</Text>
          <View style={profStyles.menuCard}>
            {section.items.map((item, iIdx) => (
              <TouchableOpacity
                key={iIdx}
                style={[
                  profStyles.menuRow,
                  iIdx < section.items.length - 1 && profStyles.menuRowBorder,
                ]}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={profStyles.menuIconBg}>
                  <Feather name={item.icon} size={18} color={COLORS.text} />
                </View>
                <Text style={profStyles.menuLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={18} color={COLORS.gray600} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={profStyles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Feather name="log-out" size={18} color={COLORS.error} />
        <Text style={profStyles.logoutTxt}>Log Out</Text>
      </TouchableOpacity>

      <Text style={profStyles.version}>Nexu Fitness v1.0.0</Text>
    </ScrollView>
  );
};

// ---- PROFILE-SPECIFIC STYLES ----
const profStyles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.text,
  },

  // Profile card
  profileCard: {
    backgroundColor: COLORS.gray800,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.secondary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
    marginTop: 2,
  },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 214, 10, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Edit mode
  editRow: {
    flex: 1,
  },
  editInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray700,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  editCancel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editSave: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Plan badge
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 10, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    gap: 8,
  },
  planText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.text,
  },
  upgradeTxt: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: COLORS.primary,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.gray800,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statNum: {
    fontSize: 20,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.text,
  },
  statLbl: {
    fontSize: 11,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
  },

  // Body metrics
  metricsCard: {
    backgroundColor: COLORS.gray800,
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
  },
  metricsTitle: {
    fontSize: 16,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.text,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 26,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.primary,
  },
  metricLbl: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray700,
  },

  // Menu sections
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: COLORS.gray800,
    borderRadius: 18,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray700,
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.gray700,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.text,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  logoutTxt: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: COLORS.error,
  },

  // Version
  version: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray600,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
});

// ============================================
// HELPER FUNCTIONS
// ============================================
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    strength: '#FF6B6B',
    cardio: '#4ECDC4',
    yoga: '#A78BFA',
    hiit: '#FFD60A',
    core: '#F97316',
    stretching: '#10B981',
  };
  return colors[category] || COLORS.primary;
};

// ============================================
// SETTINGS SCREEN
// ============================================
export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <TouchableOpacity 
            style={[styles.toggle, notifications && styles.toggleActive]}
            onPress={() => setNotifications(!notifications)}
          >
            <View style={[styles.toggleCircle, notifications && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Workout Reminders</Text>
          <TouchableOpacity 
            style={[styles.toggle, workoutReminders && styles.toggleActive]}
            onPress={() => setWorkoutReminders(!workoutReminders)}
          >
            <View style={[styles.toggleCircle, workoutReminders && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Meal Reminders</Text>
          <TouchableOpacity 
            style={[styles.toggle, mealReminders && styles.toggleActive]}
            onPress={() => setMealReminders(!mealReminders)}
          >
            <View style={[styles.toggleCircle, mealReminders && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <TouchableOpacity 
            style={[styles.toggle, darkMode && styles.toggleActive]}
            onPress={() => setDarkMode(!darkMode)}
          >
            <View style={[styles.toggleCircle, darkMode && styles.toggleCircleActive]} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingButtonText}>Export Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingButton, styles.dangerButton]}>
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ============================================
// HEALTH DATA SCREEN
// ============================================
export const HealthDataScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState({
    height: '175',
    weight: '70',
    age: '25',
    bloodType: 'O+',
    allergies: 'None',
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Health Data</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.healthCard}>
        <Text style={styles.healthCardTitle}>Body Metrics</Text>
        <View style={styles.healthGrid}>
          <View style={styles.healthItem}>
            <Text style={styles.healthValue}>{healthData.height}</Text>
            <Text style={styles.healthLabel}>Height (cm)</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthValue}>{healthData.weight}</Text>
            <Text style={styles.healthLabel}>Weight (kg)</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthValue}>{healthData.age}</Text>
            <Text style={styles.healthLabel}>Age</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthValue}>22.9</Text>
            <Text style={styles.healthLabel}>BMI</Text>
          </View>
        </View>
      </View>

      <View style={styles.healthCard}>
        <Text style={styles.healthCardTitle}>Medical Info</Text>
        <View style={styles.healthInfoRow}>
          <Text style={styles.healthInfoLabel}>Blood Type</Text>
          <Text style={styles.healthInfoValue}>{healthData.bloodType}</Text>
        </View>
        <View style={styles.healthInfoRow}>
          <Text style={styles.healthInfoLabel}>Allergies</Text>
          <Text style={styles.healthInfoValue}>{healthData.allergies}</Text>
        </View>
      </View>

      <View style={styles.healthCard}>
        <Text style={styles.healthCardTitle}>Weekly Summary</Text>
        <View style={styles.weeklySummary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>🔥</Text>
            <Text style={styles.summaryValue}>2,450</Text>
            <Text style={styles.summaryLabel}>Avg Calories</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>💧</Text>
            <Text style={styles.summaryValue}>2.1L</Text>
            <Text style={styles.summaryLabel}>Avg Water</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryIcon}>😴</Text>
            <Text style={styles.summaryValue}>7.5h</Text>
            <Text style={styles.summaryLabel}>Avg Sleep</Text>
          </View>
        </View>
      </View>

      <PrimaryButton 
        title="Update Health Data" 
        onPress={() => Alert.alert('Coming Soon', 'Health data editing will be available soon!')}
        style={{ marginHorizontal: 20, marginTop: 20 }}
      />
    </ScrollView>
  );
};

// ============================================
// GOALS SCREEN
// ============================================
export const GoalsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [goals, setGoals] = useState([
    { id: 1, title: 'Lose Weight', target: '5 kg', progress: 60, icon: '⚖️' },
    { id: 2, title: 'Build Muscle', target: '3 kg lean mass', progress: 40, icon: '💪' },
    { id: 3, title: 'Run 5K', target: 'Under 25 min', progress: 75, icon: '🏃' },
    { id: 4, title: 'Daily Steps', target: '10,000 steps', progress: 80, icon: '👟' },
  ]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Goals</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.goalsContainer}>
        {goals.map((goal) => (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalTarget}>Target: {goal.target}</Text>
              </View>
              <Text style={styles.goalPercent}>{goal.progress}%</Text>
            </View>
            <ProgressBar progress={goal.progress} color={COLORS.primary} />
          </View>
        ))}
      </View>

      <PrimaryButton 
        title="+ Add New Goal" 
        onPress={() => Alert.alert('Coming Soon', 'Custom goals will be available soon!')}
        style={{ marginHorizontal: 20, marginTop: 20 }}
      />
    </ScrollView>
  );
};

// ============================================
// HELP & SUPPORT SCREEN
// ============================================
export const HelpSupportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const faqs = [
    { q: 'How do I change my workout plan?', a: 'Go to Workouts tab and select a new program from the categories.' },
    { q: 'How do I cancel my subscription?', a: 'Go to Profile > Subscription > Manage Subscription.' },
    { q: 'Can I sync with other fitness apps?', a: 'Yes! We support Apple Health and Google Fit integration.' },
    { q: 'How accurate are calorie calculations?', a: 'Our AI uses your metrics and activity to estimate calories burned.' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Help & Support</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.supportCard}>
        <Text style={styles.supportCardTitle}>Contact Us</Text>
        <TouchableOpacity style={styles.supportOption}>
          <Text style={styles.supportIcon}>📧</Text>
          <View>
            <Text style={styles.supportLabel}>Email Support</Text>
            <Text style={styles.supportValue}>support@nexufitness.com</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportOption}>
          <Text style={styles.supportIcon}>💬</Text>
          <View>
            <Text style={styles.supportLabel}>Live Chat</Text>
            <Text style={styles.supportValue}>Available 9 AM - 6 PM</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.faqSection}>
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{faq.q}</Text>
            <Text style={styles.faqAnswer}>{faq.a}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// ============================================
// TERMS & PRIVACY SCREEN
// ============================================
export const TermsPrivacyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Terms & Privacy</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.legalSection}>
        <TouchableOpacity style={styles.legalItem}>
          <Text style={styles.legalIcon}>📜</Text>
          <View style={styles.legalContent}>
            <Text style={styles.legalTitle}>Terms of Service</Text>
            <Text style={styles.legalDesc}>Read our terms and conditions</Text>
          </View>
          <Text style={styles.legalArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.legalItem}>
          <Text style={styles.legalIcon}>🔒</Text>
          <View style={styles.legalContent}>
            <Text style={styles.legalTitle}>Privacy Policy</Text>
            <Text style={styles.legalDesc}>How we handle your data</Text>
          </View>
          <Text style={styles.legalArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.legalItem}>
          <Text style={styles.legalIcon}>🍪</Text>
          <View style={styles.legalContent}>
            <Text style={styles.legalTitle}>Cookie Policy</Text>
            <Text style={styles.legalDesc}>Learn about cookies we use</Text>
          </View>
          <Text style={styles.legalArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.legalItem}>
          <Text style={styles.legalIcon}>⚖️</Text>
          <View style={styles.legalContent}>
            <Text style={styles.legalTitle}>GDPR Rights</Text>
            <Text style={styles.legalDesc}>Your data protection rights</Text>
          </View>
          <Text style={styles.legalArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.legalFooter}>
        Last updated: February 2026{'\n'}
        Nexu Fitness v1.0.0
      </Text>
    </ScrollView>
  );
};

const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return { backgroundColor: '#10B98120' };
    case 'intermediate': return { backgroundColor: '#F9731620' };
    case 'advanced': return { backgroundColor: '#EF444420' };
    default: return {};
  }
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  plan: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Active Session Banner
  activeSessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  activeSessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeSessionIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  activeSessionTitle: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  activeSessionText: {
    fontSize: 12,
    color: COLORS.secondary,
    opacity: 0.8,
  },
  activeSessionArrow: {
    fontSize: 20,
    color: COLORS.secondary,
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
    color: COLORS.primary,
  },

  // Workout Card
  workoutCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutImage: {
    height: 120,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutIcon: {
    fontSize: 48,
  },
  workoutInfo: {
    padding: 16,
  },
  workoutCategory: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 12,
  },
  emptyWorkoutCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Nutrition Card
  nutritionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calorieTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  calorieValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  macroRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  macroItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Water Card
  waterCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  waterGlasses: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  waterGlass: {
    marginHorizontal: 4,
  },
  waterIcon: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  waterFilled: {
    color: '#4ECDC4',
  },
  waterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  addWaterButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addWaterText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },

  // AI Tip
  aiTipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  aiIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  aiText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Screen Header
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  historyButton: {
    fontSize: 14,
    color: COLORS.primary,
  },
  addButton: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Categories
  categoriesScroll: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    backgroundColor: COLORS.card,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  categoryChipTextActive: {
    color: COLORS.secondary,
    fontWeight: '600',
  },

  // Workouts List
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  workoutsList: {
    paddingHorizontal: 20,
  },
  workoutListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  workoutListImage: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutListIcon: {
    fontSize: 32,
  },
  workoutListInfo: {
    flex: 1,
    padding: 12,
  },
  workoutListName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  workoutListMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  workoutListMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 12,
  },
  workoutListFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 11,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  exerciseCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  workoutListArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
    paddingRight: 16,
  },

  // History
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  historyMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Detail Screen
  detailHeader: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  detailBanner: {
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 20,
    borderRadius: 20,
  },
  detailIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  detailStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailStat: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  detailStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  detailStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  detailStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  exerciseMeta: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  exerciseInstructions: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  startButtonContainer: {
    padding: 20,
  },

  // Active Workout
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.card,
  },
  cancelText: {
    fontSize: 16,
    color: '#EF4444',
  },
  activeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  pauseText: {
    fontSize: 24,
    color: COLORS.primary,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  restScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  restTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
  },
  restTimerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  restTimerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  restTimerLabel: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  upNextLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  upNextExercise: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 24,
  },
  skipRestButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 24,
  },
  skipRestText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  exerciseScreen: {
    flex: 1,
    padding: 20,
  },
  currentExercise: {
    alignItems: 'center',
    marginBottom: 24,
  },
  exerciseIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentExerciseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  currentExerciseTarget: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  instructionsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  logSetCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  logSetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  logSetInputs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  logSetInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  logSetLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  setsProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  setDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  setDotComplete: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  setDotCurrent: {
    borderColor: COLORS.primary,
  },
  setDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: width - 64,
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  modalStats: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },

  // Diet Screen
  calorieCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  calorieCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  calorieMain: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  calorieLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  calorieDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  calorieLabelSmall: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  calorieDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  calorieNegative: {
    color: '#EF4444',
  },
  macrosCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  macrosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  macrosGrid: {
    flexDirection: 'row',
  },
  macroBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  macroProgress: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  macroAmount: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  waterSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  waterCount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  waterGlassRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterGlassButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterGlassFilled: {
    borderColor: '#4ECDC4',
    backgroundColor: '#4ECDC420',
  },
  waterGlassIcon: {
    fontSize: 18,
  },
  mealsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  emptyMeals: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyAction: {
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 12,
  },
  mealEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  mealEntryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealEntryInfo: {
    flex: 1,
  },
  mealEntryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  mealEntryMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mealEntryDelete: {
    fontSize: 16,
    color: COLORS.textSecondary,
    padding: 8,
  },
  addMealModal: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
  },
  addMealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  addMealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 20,
    color: COLORS.textSecondary,
    padding: 4,
  },
  mealTypeScroll: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mealTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  mealTypeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  mealTypeText: {
    color: COLORS.text,
  },
  mealTypeTextActive: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  mealsList: {
    padding: 16,
    maxHeight: 400,
  },
  mealOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mealOptionInfo: {
    flex: 1,
  },
  mealOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  mealOptionMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mealOptionAdd: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '600',
    padding: 8,
  },

  // Profile
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileNameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  profileBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  profileBadgeText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
  },
  editButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  editButtons: {
    flexDirection: 'row',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    marginRight: 12,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
  },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  saveButtonText: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  menuArrow: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    backgroundColor: '#EF444420',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 20,
  },
  // Settings Screen Styles
  settingsSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray600,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  settingButton: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#EF4444',
  },
  // Health Data Screen Styles
  healthCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  healthCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  healthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  healthItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  healthValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  healthLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  healthInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  healthInfoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  healthInfoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  weeklySummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  // Goals Screen Styles
  goalsContainer: {
    paddingHorizontal: 20,
  },
  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  goalTarget: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  goalPercent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Help & Support Screen Styles
  supportCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  supportCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  supportIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  supportLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  supportValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  faqSection: {
    paddingHorizontal: 20,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Terms & Privacy Screen Styles
  legalSection: {
    paddingHorizontal: 20,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  legalIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  legalContent: {
    flex: 1,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  legalDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  legalArrow: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  legalFooter: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 40,
    marginBottom: 40,
    lineHeight: 20,
  },
});

export default HomeScreen;
