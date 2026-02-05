import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, PrimaryButton, ProgressBar } from '../../components/Button';
import { COLORS } from '../../utils/colors';
import { WORKOUT_CATEGORIES } from '../../utils/constants';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View>
            <Text style={styles.greeting}>Hello, Sarah</Text>
            <Text style={styles.plan}>⚡ Current Plan: Shred & Tone</Text>
          </View>
        </View>
        <Text style={styles.notificationIcon}>🔔</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Workout</Text>
        <Card onPress={() => navigation.navigate('Workout')}>
          <View style={styles.workoutCard}>
            <View style={styles.workoutImage}>
              <Text style={styles.workoutIcon}>💪</Text>
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>Upper Body Power</Text>
              <Text style={styles.workoutMeta}>Day 14 • Week 3</Text>
              <View style={styles.workoutFooter}>
                <Text style={styles.duration}>45m</Text>
                <PrimaryButton
                  title="Start Workout ▶"
                  onPress={() => navigation.navigate('Workout')}
                />
              </View>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Progress</Text>
          <Text style={styles.viewDetails}>View Details</Text>
        </View>

        <View style={styles.progressGrid}>
          <Card style={styles.progressCard}>
            <Text style={styles.progressIcon}>🔥</Text>
            <Text style={styles.progressLabel}>Calories</Text>
            <Text style={styles.progressValue}>480 / 640</Text>
            <ProgressBar progress={75} color={COLORS.primary} />
          </Card>

          <Card style={styles.progressCard}>
            <Text style={styles.progressIcon}>⏱️</Text>
            <Text style={styles.progressLabel}>Minutes</Text>
            <Text style={styles.progressValue}>45 / 90</Text>
            <ProgressBar progress={50} color={COLORS.primary} />
          </Card>
        </View>
      </View>

      <View style={styles.aiTipContainer}>
        <View style={styles.aiTip}>
          <Text style={styles.aiIcon}>🤖</Text>
          <View>
            <Text style={styles.aiTitle}>AI Coach Tip</Text>
            <Text style={styles.aiText}>Remember to hydrate before your Upper Body session today!</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export const WorkoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(45);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.workoutHeader}>
        <Text style={styles.backButton} onPress={() => navigation.goBack()}>←</Text>
        <Text style={styles.workoutTitle}>HIIT Cardio</Text>
        <Text style={styles.menuIcon}>⋯</Text>
      </View>

      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoIcon}>▶</Text>
          <Text style={styles.videoText}>Video Player</Text>
        </View>
      </View>

      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>High Knees</Text>
        <Text style={styles.exerciseDescription}>Keep your core right and lift knees as high as possible!</Text>
      </View>

      <View style={styles.timerContainer}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')}</Text>
          <Text style={styles.timerLabel}>REMAINING</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.playButton]}>
          <Text style={styles.controlIcon}>{isRunning ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.upcomingSection}>
        <Text style={styles.upcomingLabel}>UP NEXT</Text>
        <Text style={styles.nextExercise}>Run in Place</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill}></View>
        </View>
        <View style={styles.timeInfo}>
          <Text style={styles.elapsedTime}>5:12 Elapsed</Text>
          <Text style={styles.totalTime}>14:30 Total</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export const DietScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.menuIcon}>☰</Text>
        <Text style={styles.dietTitle}>AI Diet Coach</Text>
        <Text style={styles.saveIcon}>📱</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <Card>
          <Text style={styles.label}>Calories</Text>
          <Text style={styles.value}>1,300 / 2,000 kcal</Text>
          <ProgressBar progress={65} color={COLORS.primary} />
        </Card>

        <View style={styles.macroContainer}>
          <Card style={styles.macroCard}>
            <Text style={styles.macroIcon}>🥚</Text>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>95g</Text>
            <Text style={styles.macroGoal}>/ 150g</Text>
          </Card>
          <Card style={styles.macroCard}>
            <Text style={styles.macroIcon}>🌾</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>120g</Text>
            <Text style={styles.macroGoal}>/ 200g</Text>
          </Card>
          <Card style={styles.macroCard}>
            <Text style={styles.macroIcon}>🥑</Text>
            <Text style={styles.macroLabel}>Fats</Text>
            <Text style={styles.macroValue}>45g</Text>
            <Text style={styles.macroGoal}>/ 70g</Text>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Meals</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        <Card>
          <View style={styles.mealItem}>
            <View style={styles.mealImagePlaceholder}>
              <Text style={styles.mealIcon}>🥞</Text>
            </View>
            <View style={styles.mealDetails}>
              <View style={styles.mealStatus}>
                <Text style={styles.statusBadge}>✓ Eaten</Text>
              </View>
              <Text style={styles.mealTime}>Breakfast • 8:00 AM</Text>
              <Text style={styles.mealName}>Avocado Toast & Eggs</Text>
              <Text style={styles.mealDesc}>Wholegrain toast topped with smashed avocado, poached egg, and chili flakes.</Text>
              <Text style={styles.mealCalories}>🔥 450 kcal  •  22g Protein</Text>
            </View>
          </View>
        </Card>

        <Card>
          <View style={styles.mealItem}>
            <View style={styles.mealImagePlaceholder}>
              <Text style={styles.mealIcon}>🥗</Text>
            </View>
            <View style={styles.mealDetails}>
              <Text style={styles.mealTime}>Lunch • 1:00 PM (Next)</Text>
              <Text style={styles.mealName}>Grilled Chicken Salad</Text>
              <Text style={styles.mealDesc}>Fresh greens, cherry tomatoes, cucumber, grilled chicken breast, balsamic vinaigrette.</Text>
              <Text style={styles.mealCalories}>🔥 520 kcal  •  45g Protein</Text>
              <Text style={styles.addButton}>+</Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.backButton}>←</Text>
        <Text style={styles.profileTitle}>Profile</Text>
        <Text style={styles.menuIcon}>⋯</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.largeAvatar}>
          <Text style={styles.largeAvatarText}>👤</Text>
        </View>
        <View style={styles.profileBadge}>
          <Text style={styles.badgeText}>👑 PRO</Text>
        </View>
        <Text style={styles.profileName}>Alex Johnson</Text>
        <Text style={styles.joinDate}>Joined January 2023</Text>

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>820</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>78kg</Text>
            <Text style={styles.statLabel}>Weight</Text>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <Card>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>👑</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Subscription</Text>
              <Text style={styles.menuItemSubtitle}>Premium Active</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </View>
        </Card>

        <Card>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>👤</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Personal Info</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </View>
        </Card>

        <Card>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>💳</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Payment Methods</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <Card>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>🔔</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Notifications</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </View>
        </Card>

        <Card>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>🏥</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Health Sync</Text>
              <Text style={styles.menuItemSubtitle}>Apple Health Connected</Text>
            </View>
            <Text style={styles.toggleIcon}>✓</Text>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <Card>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>❓</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Help Center</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </View>
        </Card>

        <Card>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemIcon}>🚪</Text>
            <View style={styles.menuItemContent}>
              <Text style={styles.logoutTitle}>Log Out</Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export const WorkoutCategoriesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.backButton}>←</Text>
        <Text style={styles.sectionTitle}>Workout Categories</Text>
      </View>

      <View style={styles.gridContainer}>
        {WORKOUT_CATEGORIES.map((category) => (
          <Card
            key={category.id}
            onPress={() => navigation.navigate('Workout')}
            style={styles.categoryCard}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryCount}>{category.count} Workouts</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.secondary,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.accent,
  },
  plan: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
  },
  notificationIcon: {
    fontSize: 24,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.accent,
  },
  viewDetails: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
  },
  workoutCard: {
    flexDirection: 'row',
    gap: 12,
  },
  workoutImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutIcon: {
    fontSize: 32,
  },
  workoutInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
  workoutMeta: {
    fontSize: 12,
    color: COLORS.gray,
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  progressCard: {
    flex: 1,
    alignItems: 'center',
  },
  progressIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
  },
  aiTipContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  aiTip: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  aiIcon: {
    fontSize: 28,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  aiText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    fontSize: 24,
    color: COLORS.accent,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.accent,
  },
  menuIcon: {
    fontSize: 20,
  },
  videoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  videoPlaceholder: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    fontSize: 64,
    color: COLORS.primary,
  },
  videoText: {
    color: COLORS.gray,
    marginTop: 12,
  },
  exerciseInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
  timerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 214, 10, 0.1)',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  timerLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  controlButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: COLORS.accent,
  },
  playButton: {
    backgroundColor: COLORS.primary,
    width: 80,
  },
  controlIcon: {
    fontSize: 28,
    color: COLORS.secondary,
  },
  upcomingSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  upcomingLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  nextExercise: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.darkGray,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '35%',
    backgroundColor: COLORS.primary,
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  elapsedTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  totalTime: {
    fontSize: 12,
    color: COLORS.accent,
  },
  dietTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.accent,
  },
  saveIcon: {
    fontSize: 24,
    color: COLORS.accent,
  },
  label: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 8,
  },
  macroContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  macroCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
  },
  macroIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
  },
  macroGoal: {
    fontSize: 12,
    color: COLORS.gray,
  },
  mealItem: {
    flexDirection: 'row',
    gap: 12,
  },
  mealImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 32,
  },
  mealDetails: {
    flex: 1,
  },
  mealStatus: {
    marginBottom: 4,
  },
  statusBadge: {
    fontSize: 11,
    backgroundColor: COLORS.darkGray,
    color: COLORS.gray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  mealTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 4,
  },
  mealDesc: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  mealCalories: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  addButton: {
    fontSize: 20,
    color: COLORS.primary,
    marginTop: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.accent,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeAvatarText: {
    fontSize: 56,
  },
  profileBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: -12,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  joinDate: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemIcon: {
    fontSize: 24,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.accent,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  menuItemArrow: {
    fontSize: 20,
    color: COLORS.gray,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.error,
  },
  toggleIcon: {
    fontSize: 20,
    color: COLORS.primary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  categoryCard: {
    width: '48%',
    marginHorizontal: '1%',
    marginVertical: 8,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
  },
  categoryCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
});
