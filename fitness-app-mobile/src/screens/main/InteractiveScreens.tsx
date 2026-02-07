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
  Image,
  ImageBackground,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton, ProgressBar, TextInput } from '../../components/Button';
import { NexuLogo } from '../../components/NexuLogo';
import { COLORS } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import { useWorkout } from '../../context/WorkoutContext';
import { useDiet } from '../../context/DietContext';
import { apiClient } from '../../services/api';
import { usePlan } from '../../hooks/usePlan';
import { getPlanName } from '../../utils/planAccess';

const { width } = Dimensions.get('window');

// ============================================
// HOME SCREEN - Professional Fitness Dashboard
// ============================================

// Workout category images (Unsplash — lightweight, free)
const CATEGORY_IMAGES: Record<string, string> = {
  chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
  back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&q=80',
  legs: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=80',
  cardio: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80',
  fullbody: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=80',
  core: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
  yoga: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
  arms: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80',
  shoulders: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80',
};

const FEATURED_WORKOUT_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80';
const HERO_IMAGE = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80';

// Sample workouts for display
const SAMPLE_WORKOUTS = [
  { id: '1', name: 'Full Body Burn', category: 'fullbody', duration: 45, calories: 420, difficulty: 'Intermediate', isPremium: false, image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=80' },
  { id: '2', name: 'HIIT Cardio Blast', category: 'cardio', duration: 30, calories: 350, difficulty: 'Advanced', isPremium: true, image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80' },
  { id: '3', name: 'Upper Body Strength', category: 'chest', duration: 40, calories: 280, difficulty: 'Intermediate', isPremium: false, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { id: '4', name: 'Yoga Flow', category: 'yoga', duration: 35, calories: 180, difficulty: 'Beginner', isPremium: false, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80' },
  { id: '5', name: 'Leg Day Power', category: 'legs', duration: 50, calories: 460, difficulty: 'Advanced', isPremium: true, image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=80' },
];

const WORKOUT_CATEGORIES_DATA = [
  { id: 'chest', name: 'Chest', count: 12 },
  { id: 'back', name: 'Back', count: 15 },
  { id: 'legs', name: 'Legs', count: 10 },
  { id: 'cardio', name: 'Cardio', count: 8 },
  { id: 'fullbody', name: 'Full Body', count: 20 },
  { id: 'core', name: 'Abs & Core', count: 14 },
  { id: 'yoga', name: 'Yoga', count: 6 },
];

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { categories, workouts, fetchCategories, fetchWorkouts, currentSession } = useWorkout();
  const { todaysTotals, macroGoals, fetchDietPlan, fetchTodaysLog, waterLog, logWater, fetchWaterLog } = useDiet();
  const { planName, isBasic, isPaid, features, tier } = usePlan();

  const [refreshing, setRefreshing] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(3);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'User';
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'N';
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // Featured workout of the day
  const featuredWorkout = SAMPLE_WORKOUTS[0];

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
      <View style={h.header}>
        <View style={h.headerLeft}>
          <View style={h.avatar}>
            <Text style={h.avatarText}>{initial}</Text>
          </View>
          <View>
            <Text style={h.greetingSmall}>{getGreeting()}</Text>
            <Text style={h.userName}>{firstName}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={h.planBadge}>
            <Feather name="award" size={12} color={COLORS.primary} />
            <Text style={h.planBadgeText}>{planName}</Text>
          </View>
          <TouchableOpacity style={h.bellButton}>
            <Feather name="bell" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== HERO / FEATURED WORKOUT CARD ===== */}
      <TouchableOpacity
        style={h.heroCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('WorkoutsTab')}
      >
        <ImageBackground
          source={{ uri: FEATURED_WORKOUT_IMAGE }}
          style={h.heroImage}
          imageStyle={{ borderRadius: 20 }}
        >
          <View style={h.heroOverlay}>
            <View style={h.heroBadge}>
              <Feather name="play-circle" size={14} color={COLORS.primary} />
              <Text style={h.heroBadgeText}>TODAY'S WORKOUT</Text>
            </View>
            <Text style={h.heroTitle}>{featuredWorkout.name}</Text>
            <Text style={h.heroSub}>{featuredWorkout.duration} min · {featuredWorkout.calories} cal · {featuredWorkout.difficulty}</Text>
            <View style={h.heroBtn}>
              <Text style={h.heroBtnText}>{isBasic ? 'Watch Now' : 'Start Workout'}</Text>
              <Feather name="arrow-right" size={16} color={COLORS.secondary} />
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* ===== UPGRADE BANNER (Basic plan only) ===== */}
      {isBasic && (
        <TouchableOpacity style={h.upgradeBanner} onPress={() => navigation.navigate('ProfileTab')} activeOpacity={0.85}>
          <View style={h.upgradeBannerIcon}>
            <Feather name="zap" size={20} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={h.upgradeBannerTitle}>Unlock Guided Workouts</Text>
            <Text style={h.upgradeBannerSub}>Get timers, rest periods & auto-next</Text>
          </View>
          <View style={h.upgradeBannerBtn}>
            <Text style={h.upgradeBannerBtnText}>Upgrade</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ===== QUICK STATS ===== */}
      <View style={h.statsRow}>
        <View style={h.statCard}>
          <View style={[h.statIconBg, { backgroundColor: 'rgba(255, 214, 10, 0.12)' }]}>
            <Feather name="activity" size={18} color={COLORS.primary} />
          </View>
          <Text style={h.statValue}>12</Text>
          <Text style={h.statLabel}>Workouts</Text>
        </View>
        <View style={h.statCard}>
          <View style={[h.statIconBg, { backgroundColor: 'rgba(255, 107, 107, 0.12)' }]}>
            <Feather name="zap" size={18} color="#FF6B6B" />
          </View>
          <Text style={h.statValue}>2,840</Text>
          <Text style={h.statLabel}>Calories</Text>
        </View>
        <View style={h.statCard}>
          <View style={[h.statIconBg, { backgroundColor: 'rgba(78, 205, 196, 0.12)' }]}>
            <Feather name="trending-up" size={18} color="#4ECDC4" />
          </View>
          <Text style={h.statValue}>5</Text>
          <Text style={h.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* ===== ACTIVE SESSION BANNER ===== */}
      {currentSession && (
        <TouchableOpacity
          style={h.sessionBanner}
          onPress={() => navigation.navigate('ActiveWorkout')}
          activeOpacity={0.85}
        >
          <Feather name="play-circle" size={28} color={COLORS.secondary} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={h.sessionTitle}>Workout in Progress</Text>
            <Text style={h.sessionName}>{currentSession.workoutName}</Text>
          </View>
          <Feather name="chevron-right" size={22} color={COLORS.secondary} />
        </TouchableOpacity>
      )}

      {/* ===== WORKOUT CATEGORIES (Horizontal Scroll) ===== */}
      <View style={h.section}>
        <View style={h.sectionHeader}>
          <Text style={h.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('WorkoutsTab')}>
            <Text style={h.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={WORKOUT_CATEGORIES_DATA}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={h.categoryCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('WorkoutsTab')}
            >
              <Image
                source={{ uri: CATEGORY_IMAGES[item.id] || CATEGORY_IMAGES.fullbody }}
                style={h.categoryImage}
              />
              <View style={h.categoryOverlay}>
                <Text style={h.categoryName}>{item.name}</Text>
                <Text style={h.categoryCount}>{item.count} workouts</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ===== RECOMMENDED WORKOUTS ===== */}
      <View style={h.section}>
        <View style={h.sectionHeader}>
          <Text style={h.sectionTitle}>Recommended</Text>
          <TouchableOpacity onPress={() => navigation.navigate('WorkoutsTab')}>
            <Text style={h.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {SAMPLE_WORKOUTS.slice(0, 3).map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={h.workoutListItem}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('WorkoutsTab')}
          >
            <Image source={{ uri: workout.image }} style={h.workoutListImage} />
            <View style={h.workoutListBody}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Text style={h.workoutListName}>{workout.name}</Text>
                {workout.isPremium && !features.canAccessPremiumWorkouts && (
                  <View style={h.lockBadge}>
                    <Feather name="lock" size={10} color={COLORS.primary} />
                  </View>
                )}
              </View>
              <Text style={h.workoutListMeta}>
                {workout.duration} min · {workout.calories} cal · {workout.difficulty}
              </Text>
            </View>
            <TouchableOpacity style={h.playBtn}>
              <Feather name="play" size={16} color={COLORS.secondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== WATER TRACKER ===== */}
      <View style={h.section}>
        <View style={h.sectionHeader}>
          <Text style={h.sectionTitle}>Water Intake</Text>
          <Text style={h.waterCount}>{waterGlasses}/8 glasses</Text>
        </View>
        <View style={h.waterCard}>
          <View style={h.waterBarBg}>
            <View style={[h.waterBarFill, { width: `${Math.min((waterGlasses / 8) * 100, 100)}%` }]} />
          </View>
          <View style={h.waterRow}>
            <View style={h.waterDots}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={[h.waterDot, i < waterGlasses && h.waterDotFilled]} />
              ))}
            </View>
            <TouchableOpacity
              style={h.addWaterBtn}
              onPress={() => setWaterGlasses(Math.min(waterGlasses + 1, 8))}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={16} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ===== QUICK ACTIONS ===== */}
      <View style={h.section}>
        <Text style={h.sectionTitle}>Quick Actions</Text>
        <View style={h.actionsRow}>
          {[
            { icon: 'activity' as const, label: 'Workouts', color: COLORS.primary, bg: 'rgba(255,214,10,0.12)', nav: 'WorkoutsTab' },
            { icon: 'bar-chart-2' as const, label: 'Progress', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', nav: 'ProgressTab' },
            { icon: 'user' as const, label: 'Profile', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', nav: 'ProfileTab' },
            { icon: 'award' as const, label: 'Goals', color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)', nav: 'ProfileTab' },
          ].map((action) => (
            <TouchableOpacity key={action.label} style={h.actionCard} onPress={() => navigation.navigate(action.nav)} activeOpacity={0.8}>
              <View style={[h.actionIcon, { backgroundColor: action.bg }]}>
                <Feather name={action.icon} size={20} color={action.color} />
              </View>
              <Text style={h.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ===== MOTIVATIONAL FOOTER ===== */}
      <View style={h.motiveCard}>
        <Feather name="sun" size={20} color={COLORS.primary} />
        <Text style={h.motiveText}>"The only bad workout is the one that didn't happen."</Text>
      </View>
    </ScrollView>
  );
};

// ---- HOME STYLES ----
const h = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 44, paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 19, fontFamily: 'Kanit_700Bold', color: COLORS.secondary },
  greetingSmall: { fontSize: 12, fontFamily: 'Montserrat_400Regular', color: COLORS.gray500 },
  userName: { fontSize: 18, fontFamily: 'Kanit_600SemiBold', color: COLORS.text, marginTop: -1 },
  planBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,214,10,0.1)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 4,
  },
  planBadgeText: { fontSize: 11, fontFamily: 'Montserrat_600SemiBold', color: COLORS.primary },
  bellButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.gray800,
    alignItems: 'center', justifyContent: 'center',
  },

  // Hero card
  heroCard: { marginHorizontal: 20, marginBottom: 16, borderRadius: 20, overflow: 'hidden' },
  heroImage: { width: '100%', height: 200 },
  heroOverlay: {
    flex: 1, justifyContent: 'flex-end', padding: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8,
  },
  heroBadgeText: { fontSize: 10, fontFamily: 'Montserrat_700Bold', color: COLORS.primary, letterSpacing: 1 },
  heroTitle: { fontSize: 22, fontFamily: 'Kanit_700Bold', color: '#fff', marginBottom: 2 },
  heroSub: { fontSize: 13, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, alignSelf: 'flex-start',
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
  },
  heroBtnText: { fontSize: 14, fontFamily: 'Kanit_600SemiBold', color: COLORS.secondary },

  // Upgrade banner
  upgradeBanner: {
    marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2A2200', borderWidth: 1, borderColor: 'rgba(255,214,10,0.2)',
  },
  upgradeBannerIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,214,10,0.15)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  upgradeBannerTitle: { fontSize: 14, fontFamily: 'Kanit_600SemiBold', color: COLORS.primary },
  upgradeBannerSub: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: COLORS.gray500, marginTop: 1 },
  upgradeBannerBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 7, marginLeft: 8,
  },
  upgradeBannerBtnText: { fontSize: 12, fontFamily: 'Kanit_600SemiBold', color: COLORS.secondary },

  // Stats
  statsRow: {
    flexDirection: 'row', marginHorizontal: 20, gap: 10, marginBottom: 20,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 16, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray800,
  },
  statIconBg: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  statValue: { fontSize: 20, fontFamily: 'Kanit_700Bold', color: COLORS.text },
  statLabel: { fontSize: 11, fontFamily: 'Montserrat_500Medium', color: COLORS.gray500, marginTop: 2 },

  // Session
  sessionBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary,
    marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 20,
  },
  sessionTitle: { fontSize: 12, fontFamily: 'Montserrat_600SemiBold', color: COLORS.secondary, opacity: 0.7 },
  sessionName: { fontSize: 16, fontFamily: 'Kanit_600SemiBold', color: COLORS.secondary },

  // Sections
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'Kanit_600SemiBold', color: COLORS.text, paddingHorizontal: 0 },
  seeAll: { fontSize: 13, fontFamily: 'Montserrat_500Medium', color: COLORS.primary },

  // Categories
  categoryCard: {
    width: 130, height: 160, borderRadius: 16, marginRight: 12, overflow: 'hidden',
  },
  categoryImage: { width: '100%', height: '100%' },
  categoryOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 12, backgroundColor: 'rgba(0,0,0,0.55)',
  },
  categoryName: { fontSize: 14, fontFamily: 'Kanit_600SemiBold', color: '#fff' },
  categoryCount: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.7)' },

  // Workout list items
  workoutListItem: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12,
    backgroundColor: COLORS.card, borderRadius: 16, padding: 10,
    borderWidth: 1, borderColor: COLORS.gray800,
  },
  workoutListImage: { width: 64, height: 64, borderRadius: 12 },
  workoutListBody: { flex: 1, marginLeft: 14 },
  workoutListName: { fontSize: 15, fontFamily: 'Kanit_600SemiBold', color: COLORS.text },
  workoutListMeta: { fontSize: 12, fontFamily: 'Montserrat_400Regular', color: COLORS.gray500, marginTop: 2 },
  lockBadge: {
    backgroundColor: 'rgba(255,214,10,0.15)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8,
  },
  playBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  // Water
  waterCount: { fontSize: 13, fontFamily: 'Montserrat_500Medium', color: COLORS.gray400 },
  waterCard: {
    marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.gray800,
  },
  waterBarBg: { height: 8, backgroundColor: COLORS.gray800, borderRadius: 4, marginBottom: 12 },
  waterBarFill: { height: 8, backgroundColor: '#00BCD4', borderRadius: 4 },
  waterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  waterDots: { flexDirection: 'row', gap: 8 },
  waterDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.gray700,
  },
  waterDotFilled: { backgroundColor: '#00BCD4' },
  addWaterBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  // Quick actions
  actionsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginTop: 10 },
  actionCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 16, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray800,
  },
  actionIcon: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  actionLabel: { fontSize: 12, fontFamily: 'Montserrat_500Medium', color: COLORS.gray400 },

  // Motivational card
  motiveCard: {
    marginHorizontal: 20, marginBottom: 10, marginTop: 4, backgroundColor: COLORS.card,
    borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: COLORS.gray800,
  },
  motiveText: {
    flex: 1, fontSize: 13, fontFamily: 'Montserrat_500Medium',
    color: COLORS.gray400, fontStyle: 'italic', lineHeight: 20,
  },
});

// ============================================
// WORKOUT SCREEN - Categories & Workouts List
// ============================================
export const WorkoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { features } = usePlan();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  // All workouts data with images
  const ALL_WORKOUTS = [
    { id: '1', name: 'Full Body Burn', category: 'fullbody', duration: 45, calories: 420, difficulty: 'Intermediate', exercises: 8, isPremium: false, image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=80' },
    { id: '2', name: 'HIIT Cardio Blast', category: 'cardio', duration: 30, calories: 350, difficulty: 'Advanced', exercises: 6, isPremium: true, image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80' },
    { id: '3', name: 'Upper Body Power', category: 'chest', duration: 40, calories: 280, difficulty: 'Intermediate', exercises: 10, isPremium: false, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
    { id: '4', name: 'Morning Yoga Flow', category: 'yoga', duration: 35, calories: 180, difficulty: 'Beginner', exercises: 12, isPremium: false, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80' },
    { id: '5', name: 'Leg Day Destroyer', category: 'legs', duration: 50, calories: 460, difficulty: 'Advanced', exercises: 9, isPremium: true, image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=80' },
    { id: '6', name: 'Back & Biceps', category: 'back', duration: 42, calories: 310, difficulty: 'Intermediate', exercises: 8, isPremium: false, image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400&q=80' },
    { id: '7', name: 'Core Crusher', category: 'core', duration: 25, calories: 220, difficulty: 'Intermediate', exercises: 10, isPremium: false, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80' },
    { id: '8', name: 'Shoulder Sculpt', category: 'chest', duration: 35, calories: 250, difficulty: 'Beginner', exercises: 7, isPremium: false, image: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=400&q=80' },
    { id: '9', name: 'Sprint Intervals', category: 'cardio', duration: 20, calories: 300, difficulty: 'Advanced', exercises: 5, isPremium: true, image: 'https://images.unsplash.com/photo-1461896836934-bd45ba7ea814?w=400&q=80' },
    { id: '10', name: 'Stretch & Recovery', category: 'yoga', duration: 30, calories: 120, difficulty: 'Beginner', exercises: 14, isPremium: false, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80' },
  ];

  const CATEGORIES = [
    { id: 'chest', name: 'Chest', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&q=80' },
    { id: 'back', name: 'Back', image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=200&q=80' },
    { id: 'legs', name: 'Legs', image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=200&q=80' },
    { id: 'cardio', name: 'Cardio', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=200&q=80' },
    { id: 'fullbody', name: 'Full Body', image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=200&q=80' },
    { id: 'core', name: 'Core', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80' },
    { id: 'yoga', name: 'Yoga', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&q=80' },
  ];

  const filteredWorkouts = selectedCategory
    ? ALL_WORKOUTS.filter(w => w.category === selectedCategory)
    : ALL_WORKOUTS;

  const diffColor = (d: string) =>
    d === 'Beginner' ? '#10B981' : d === 'Intermediate' ? '#F59E0B' : '#EF4444';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <View style={w.header}>
        <View>
          <Text style={w.title}>Workouts</Text>
          <Text style={w.subtitle}>{filteredWorkouts.length} workouts available</Text>
        </View>
        <TouchableOpacity style={w.searchBtn}>
          <Feather name="search" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Featured Workout Banner */}
      <TouchableOpacity style={w.featuredCard} activeOpacity={0.9}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' }}
          style={w.featuredImage}
          imageStyle={{ borderRadius: 20 }}
        >
          <View style={w.featuredOverlay}>
            <View style={w.featuredBadge}>
              <Feather name="star" size={12} color={COLORS.primary} />
              <Text style={w.featuredBadgeText}>FEATURED</Text>
            </View>
            <Text style={w.featuredTitle}>30-Day Full Body Challenge</Text>
            <Text style={w.featuredSub}>Transform your body with our curated program</Text>
            <View style={w.featuredMeta}>
              <View style={w.featuredChip}>
                <Feather name="clock" size={12} color="#fff" />
                <Text style={w.featuredChipText}>30 Days</Text>
              </View>
              <View style={w.featuredChip}>
                <Feather name="zap" size={12} color="#fff" />
                <Text style={w.featuredChipText}>All Levels</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Category Filter (Horizontal scroll with images) */}
      <View style={w.section}>
        <Text style={w.sectionTitle}>Categories</Text>
      </View>
      <FlatList
        data={[{ id: null, name: 'All', image: null }, ...CATEGORIES]}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
        keyExtractor={(item) => item.id || 'all'}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              w.catChip,
              (selectedCategory === item.id || (!selectedCategory && !item.id)) && w.catChipActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
            activeOpacity={0.8}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={w.catChipImg} />
            ) : (
              <View style={[w.catChipImg, { backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }]}>
                <Feather name="grid" size={14} color={COLORS.secondary} />
              </View>
            )}
            <Text style={[
              w.catChipText,
              (selectedCategory === item.id || (!selectedCategory && !item.id)) && w.catChipTextActive,
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Workout List */}
      <View style={[w.section, { marginTop: 20 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={w.sectionTitle}>
            {selectedCategory ? CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All' : 'All'} Workouts
          </Text>
          <Text style={w.countBadge}>{filteredWorkouts.length}</Text>
        </View>
      </View>

      {filteredWorkouts.map((workout) => {
        const isLocked = workout.isPremium && !features.canAccessPremiumWorkouts;
        return (
          <TouchableOpacity
            key={workout.id}
            style={w.workoutCard}
            activeOpacity={0.85}
            onPress={() => {
              if (isLocked) {
                Alert.alert('Premium Workout', 'Upgrade your plan to access this workout.');
              } else {
                navigation.navigate('WorkoutDetail', { workout });
              }
            }}
          >
            <Image source={{ uri: workout.image }} style={w.workoutImg} />
            {isLocked && (
              <View style={w.lockOverlay}>
                <Feather name="lock" size={16} color={COLORS.primary} />
              </View>
            )}
            <View style={w.workoutBody}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={w.workoutName} numberOfLines={1}>{workout.name}</Text>
                {workout.isPremium && (
                  <View style={w.proBadge}>
                    <Text style={w.proBadgeText}>PRO</Text>
                  </View>
                )}
              </View>
              <View style={w.workoutMeta}>
                <View style={w.metaItem}>
                  <Feather name="clock" size={12} color={COLORS.gray500} />
                  <Text style={w.metaText}>{workout.duration} min</Text>
                </View>
                <View style={w.metaItem}>
                  <Feather name="zap" size={12} color={COLORS.gray500} />
                  <Text style={w.metaText}>{workout.calories} cal</Text>
                </View>
                <View style={w.metaItem}>
                  <Feather name="layers" size={12} color={COLORS.gray500} />
                  <Text style={w.metaText}>{workout.exercises} exercises</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <View style={[w.diffBadge, { backgroundColor: diffColor(workout.difficulty) + '20' }]}>
                  <View style={[w.diffDot, { backgroundColor: diffColor(workout.difficulty) }]} />
                  <Text style={[w.diffText, { color: diffColor(workout.difficulty) }]}>{workout.difficulty}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={COLORS.gray500} />
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {filteredWorkouts.length === 0 && (
        <View style={w.emptyState}>
          <Feather name="inbox" size={48} color={COLORS.gray600} />
          <Text style={w.emptyTitle}>No workouts found</Text>
          <Text style={w.emptySub}>Try a different category</Text>
        </View>
      )}
    </ScrollView>
  );
};

// ---- WORKOUT SCREEN STYLES ----
const w = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 60 : 44, paddingBottom: 8,
  },
  title: { fontSize: 28, fontFamily: 'Kanit_700Bold', color: COLORS.text },
  subtitle: { fontSize: 13, fontFamily: 'Montserrat_400Regular', color: COLORS.gray500, marginTop: -2 },
  searchBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.gray800,
    alignItems: 'center', justifyContent: 'center',
  },

  // Featured
  featuredCard: { marginHorizontal: 20, marginVertical: 16, borderRadius: 20, overflow: 'hidden' },
  featuredImage: { width: '100%', height: 180 },
  featuredOverlay: {
    flex: 1, justifyContent: 'flex-end', padding: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featuredBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginBottom: 8,
  },
  featuredBadgeText: { fontSize: 10, fontFamily: 'Montserrat_700Bold', color: COLORS.primary, letterSpacing: 1 },
  featuredTitle: { fontSize: 20, fontFamily: 'Kanit_700Bold', color: '#fff', marginBottom: 2 },
  featuredSub: { fontSize: 12, fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
  featuredMeta: { flexDirection: 'row', gap: 10 },
  featuredChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  featuredChipText: { fontSize: 11, fontFamily: 'Montserrat_500Medium', color: '#fff' },

  // Section
  section: { paddingHorizontal: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontFamily: 'Kanit_600SemiBold', color: COLORS.text },
  countBadge: {
    fontSize: 12, fontFamily: 'Montserrat_600SemiBold', color: COLORS.primary,
    backgroundColor: 'rgba(255,214,10,0.12)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10,
  },

  // Category chips
  catChip: {
    alignItems: 'center', marginRight: 12, paddingVertical: 8, paddingHorizontal: 4,
    borderRadius: 16, borderWidth: 2, borderColor: 'transparent', width: 72,
  },
  catChipActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(255,214,10,0.08)' },
  catChipImg: { width: 48, height: 48, borderRadius: 24, marginBottom: 6 },
  catChipText: { fontSize: 11, fontFamily: 'Montserrat_500Medium', color: COLORS.gray500, textAlign: 'center' },
  catChipTextActive: { color: COLORS.primary, fontFamily: 'Montserrat_600SemiBold' },

  // Workout cards
  workoutCard: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 12,
    backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.gray800,
  },
  workoutImg: { width: 100, height: 110 },
  lockOverlay: {
    position: 'absolute', left: 0, top: 0, width: 100, height: 110,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  workoutBody: { flex: 1, padding: 12, justifyContent: 'center' },
  workoutName: { fontSize: 15, fontFamily: 'Kanit_600SemiBold', color: COLORS.text, flex: 1 },
  proBadge: {
    backgroundColor: 'rgba(255,214,10,0.15)', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 1, marginLeft: 8,
  },
  proBadgeText: { fontSize: 9, fontFamily: 'Montserrat_700Bold', color: COLORS.primary, letterSpacing: 0.5 },
  workoutMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, fontFamily: 'Montserrat_400Regular', color: COLORS.gray500 },
  diffBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  diffText: { fontSize: 11, fontFamily: 'Montserrat_600SemiBold' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontFamily: 'Kanit_600SemiBold', color: COLORS.text, marginTop: 16 },
  emptySub: { fontSize: 13, fontFamily: 'Montserrat_400Regular', color: COLORS.gray500, marginTop: 4 },
});

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
  const { planName, planId, isBasic, isPaid, tier } = usePlan();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');

  // Sample stats data (no API call)
  const stats = {
    workouts: 24,
    minutes: 580,
    calories: 8540,
    streak: 5,
  };

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

  const tierColor =
    tier === 0 ? '#9CA3AF' :
    tier === 1 ? '#3B82F6' :
    tier === 2 ? '#EAB308' :
    '#F59E0B';

  const tierBg =
    tier === 0 ? 'rgba(156, 163, 175, 0.10)' :
    tier === 1 ? 'rgba(59, 130, 246, 0.10)' :
    tier === 2 ? 'rgba(234, 179, 8, 0.10)' :
    'rgba(245, 158, 11, 0.12)';

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: 'settings' as const, label: 'Settings', screen: 'Settings', color: '#A78BFA' },
        { icon: 'credit-card' as const, label: 'Subscription', screen: 'SubscriptionPlans', color: COLORS.primary },
      ],
    },
    {
      title: 'Fitness',
      items: [
        { icon: 'bar-chart-2' as const, label: 'Health Data', screen: 'HealthData', color: '#4ECDC4' },
        { icon: 'target' as const, label: 'Goals', screen: 'Goals', color: '#FF6B6B' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle' as const, label: 'Help & Support', screen: 'HelpSupport', color: '#3B82F6' },
        { icon: 'file-text' as const, label: 'Terms & Privacy', screen: 'TermsPrivacy', color: COLORS.gray400 },
      ],
    },
  ];

  const statsData = [
    { icon: 'activity' as const, value: stats.workouts.toString(), label: 'Workouts', color: '#4ECDC4' },
    { icon: 'clock' as const, value: stats.minutes.toString(), label: 'Minutes', color: '#3B82F6' },
    { icon: 'zap' as const, value: stats.calories.toLocaleString(), label: 'Calories', color: '#F59E0B' },
    { icon: 'trending-up' as const, value: `${stats.streak}`, label: 'Day Streak', color: COLORS.primary },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.secondary }}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={profStyles.header}>
        <Text style={profStyles.headerTitle}>Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={profStyles.headerSettingsBtn}
          activeOpacity={0.7}
        >
          <Feather name="settings" size={22} color={COLORS.gray400} />
        </TouchableOpacity>
      </View>

      {/* Profile Hero Card */}
      <View style={profStyles.heroCard}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' }}
          style={profStyles.heroCover}
          imageStyle={profStyles.heroCoverImage}
        >
          <View style={profStyles.heroCoverOverlay} />
        </ImageBackground>

        <View style={profStyles.heroBody}>
          <View style={profStyles.avatarWrap}>
            <View style={profStyles.avatar}>
              <Text style={profStyles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'N'}
              </Text>
            </View>
          </View>

          {editing ? (
            <View style={profStyles.editContainer}>
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
              <TouchableOpacity
                onPress={() => setEditing(true)}
                style={profStyles.editProfileBtn}
                activeOpacity={0.7}
              >
                <Feather name="edit-2" size={14} color={COLORS.primary} />
                <Text style={profStyles.editProfileTxt}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Plan Badge Card */}
      <View style={[profStyles.planCard, { borderColor: tierColor + '30' }]}>
        <View style={[profStyles.planIconWrap, { backgroundColor: tierBg }]}>
          <Feather
            name={tier >= 2 ? 'award' : tier === 1 ? 'star' : 'user'}
            size={20}
            color={tierColor}
          />
        </View>
        <View style={profStyles.planInfo}>
          <Text style={profStyles.planLabel}>Current Plan</Text>
          <Text style={[profStyles.planName, { color: tierColor }]}>{planName}</Text>
        </View>
        {isPaid ? (
          <View style={profStyles.planActiveBadge}>
            <View style={profStyles.planActiveDot} />
            <Text style={profStyles.planActiveText}>Active</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('SubscriptionPlans')}
            style={[profStyles.planUpgradeBtn, { backgroundColor: tierColor }]}
            activeOpacity={0.8}
          >
            <Feather name="arrow-up-right" size={14} color={COLORS.secondary} />
            <Text style={profStyles.planUpgradeTxt}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Grid 2x2 */}
      <View style={profStyles.statsGrid}>
        {statsData.map((stat, idx) => (
          <View key={idx} style={profStyles.statCard}>
            <View style={[profStyles.statIconWrap, { backgroundColor: stat.color + '18' }]}>
              <Feather name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={profStyles.statValue}>{stat.value}</Text>
            <Text style={profStyles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Body Metrics Card */}
      {fitnessProfile && (
        <View style={profStyles.metricsCard}>
          <View style={profStyles.metricsHeader}>
            <Feather name="heart" size={18} color={COLORS.primary} />
            <Text style={profStyles.metricsTitle}>Body Metrics</Text>
          </View>
          <View style={profStyles.metricsRow}>
            <View style={profStyles.metricItem}>
              <Text style={profStyles.metricValue}>{fitnessProfile.age}</Text>
              <Text style={profStyles.metricLabel}>Age</Text>
            </View>
            <View style={profStyles.metricDivider} />
            <View style={profStyles.metricItem}>
              <Text style={profStyles.metricValue}>{fitnessProfile.height}</Text>
              <Text style={profStyles.metricLabel}>Height (cm)</Text>
            </View>
            <View style={profStyles.metricDivider} />
            <View style={profStyles.metricItem}>
              <Text style={profStyles.metricValue}>{fitnessProfile.weight}</Text>
              <Text style={profStyles.metricLabel}>Weight (kg)</Text>
            </View>
          </View>
          {fitnessProfile.gender && (
            <View style={profStyles.genderRow}>
              <Feather
                name={fitnessProfile.gender === 'male' ? 'user' : 'user'}
                size={14}
                color={COLORS.gray400}
              />
              <Text style={profStyles.genderText}>
                {fitnessProfile.gender.charAt(0).toUpperCase() + fitnessProfile.gender.slice(1)}
              </Text>
            </View>
          )}
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
                activeOpacity={0.6}
              >
                <View style={[profStyles.menuIconBg, { backgroundColor: item.color + '15' }]}>
                  <Feather name={item.icon} size={18} color={item.color} />
                </View>
                <Text style={profStyles.menuLabel}>{item.label}</Text>
                <Feather name="chevron-right" size={18} color={COLORS.gray600} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={profStyles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <View style={profStyles.logoutIconWrap}>
          <Feather name="log-out" size={18} color={COLORS.error} />
        </View>
        <Text style={profStyles.logoutTxt}>Log Out</Text>
        <Feather name="chevron-right" size={18} color={'rgba(239, 68, 68, 0.4)'} />
      </TouchableOpacity>

      {/* Version */}
      <Text style={profStyles.version}>Nexu Fitness v1.0.0</Text>
    </ScrollView>
  );
};

// ---- PROFILE-SPECIFIC STYLES ----
const profStyles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerSettingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.gray800,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Card
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray800,
  },
  heroCover: {
    height: 120,
    width: '100%',
  },
  heroCoverImage: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  heroCoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 26, 0.45)',
  },
  heroBody: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    marginTop: -40,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.card,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.secondary,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
    marginTop: 2,
    textAlign: 'center',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 10, 0.25)',
    backgroundColor: 'rgba(255, 214, 10, 0.06)',
  },
  editProfileTxt: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: COLORS.primary,
  },

  // Edit mode
  editContainer: {
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  editInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray700,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.gray800,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  editCancel: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray700,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray800,
  },
  editSave: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Plan Badge Card
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.gray800,
  },
  planIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  planName: {
    fontSize: 17,
    fontFamily: 'Kanit_600SemiBold',
    marginTop: 2,
  },
  planActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.10)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  planActiveText: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: COLORS.success,
  },
  planUpgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  planUpgradeTxt: {
    fontSize: 13,
    fontFamily: 'Montserrat_700Bold',
    color: COLORS.secondary,
  },

  // Stats Grid 2x2
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.gray800,
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 26,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.gray500,
    marginTop: 2,
  },

  // Body Metrics
  metricsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.gray800,
  },
  metricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  metricsTitle: {
    fontSize: 17,
    fontFamily: 'Kanit_600SemiBold',
    color: COLORS.text,
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
  metricValue: {
    fontSize: 28,
    fontFamily: 'Kanit_700Bold',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: COLORS.gray500,
    marginTop: 4,
  },
  metricDivider: {
    width: 1,
    height: 44,
    backgroundColor: COLORS.gray700,
    borderRadius: 1,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray700,
  },
  genderText: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: COLORS.gray400,
  },

  // Menu Sections
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray800,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray700,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 13,
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
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.12)',
  },
  logoutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logoutTxt: {
    flex: 1,
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
    marginTop: 24,
    marginBottom: 10,
    letterSpacing: 0.3,
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
