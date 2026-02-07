import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../utils/colors';
import { usePlan } from '../../hooks/usePlan';
import { useAuth } from '../../context/AuthContext';

// ──────────────────────────────────────────────
// Sample Data
// ──────────────────────────────────────────────

const STREAK_DATA = {
  current: 5,
  longest: 12,
  weekDays: [
    { label: 'M', active: true },
    { label: 'T', active: true },
    { label: 'W', active: true },
    { label: 'T', active: false },
    { label: 'F', active: true },
    { label: 'S', active: true },
    { label: 'S', active: false },
  ],
};

const STATS = [
  { icon: 'activity' as const, label: 'Total Workouts', value: '24', tint: '#14B8A6' },
  { icon: 'clock' as const, label: 'Total Minutes', value: '580', tint: '#3B82F6' },
  { icon: 'zap' as const, label: 'Calories Burned', value: '8,540', tint: '#F97316' },
  { icon: 'bar-chart' as const, label: 'Avg per Session', value: '41 min', tint: '#A855F7' },
];

const WEEKLY_ACTIVITY = [
  { day: 'Mon', minutes: 45 },
  { day: 'Tue', minutes: 30 },
  { day: 'Wed', minutes: 60 },
  { day: 'Thu', minutes: 0 },
  { day: 'Fri', minutes: 50 },
  { day: 'Sat', minutes: 75 },
  { day: 'Sun', minutes: 20 },
];

const PERSONAL_RECORDS = [
  { icon: 'award' as const, value: '80 kg', label: 'Heaviest Lift' },
  { icon: 'clock' as const, value: '75 min', label: 'Longest Workout' },
  { icon: 'zap' as const, value: '520 cal', label: 'Most Calories' },
];

const RECENT_WORKOUTS = [
  {
    id: '1',
    name: 'Upper Body Power',
    date: 'Feb 4, 2026',
    duration: '45 min',
    calories: '320 cal',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    name: 'HIIT Cardio Blast',
    date: 'Feb 3, 2026',
    duration: '30 min',
    calories: '410 cal',
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    name: 'Leg Day Strength',
    date: 'Feb 2, 2026',
    duration: '50 min',
    calories: '380 cal',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=100&h=100&fit=crop',
  },
  {
    id: '4',
    name: 'Core & Abs Circuit',
    date: 'Jan 31, 2026',
    duration: '25 min',
    calories: '210 cal',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&h=100&fit=crop',
  },
  {
    id: '5',
    name: 'Full Body Functional',
    date: 'Jan 30, 2026',
    duration: '55 min',
    calories: '450 cal',
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=100&h=100&fit=crop',
  },
  {
    id: '6',
    name: 'Yoga & Mobility',
    date: 'Jan 28, 2026',
    duration: '40 min',
    calories: '180 cal',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100&h=100&fit=crop',
  },
];

const TOTAL_WEEKLY_MINUTES = WEEKLY_ACTIVITY.reduce((sum, d) => sum + d.minutes, 0);

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export const ProgressScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { planName } = usePlan();

  const maxMinutes = Math.max(...WEEKLY_ACTIVITY.map((d) => d.minutes), 1);
  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0 ... Sun=6

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ────────────── Header ────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => {}}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="calendar" size={22} color={COLORS.gray400} />
        </TouchableOpacity>
      </View>

      {/* ────────────── Streak Hero Card ────────────── */}
      <View style={styles.streakCard}>
        <View style={styles.streakTop}>
          <View style={styles.streakIconCircle}>
            <Feather name="zap" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.streakTextBlock}>
            <Text style={styles.streakTitle}>{STREAK_DATA.current} Day Streak</Text>
            <Text style={styles.streakSubtitle}>
              Your longest streak: {STREAK_DATA.longest} days
            </Text>
          </View>
        </View>

        <View style={styles.streakDaysRow}>
          {STREAK_DATA.weekDays.map((d, i) => (
            <View key={i} style={styles.streakDayCol}>
              <View
                style={[
                  styles.streakDot,
                  d.active ? styles.streakDotActive : styles.streakDotInactive,
                ]}
              >
                {d.active && <Feather name="check" size={10} color="#1A1A1A" />}
              </View>
              <Text
                style={[
                  styles.streakDayLabel,
                  d.active && { color: COLORS.primary },
                ]}
              >
                {d.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ────────────── Stats 2x2 Grid ────────────── */}
      <View style={styles.statsGrid}>
        {STATS.map((stat, idx) => (
          <View key={idx} style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: stat.tint + '18' }]}>
              <Feather name={stat.icon} size={20} color={stat.tint} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ────────────── Weekly Activity Chart ────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>This Week</Text>
          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>{TOTAL_WEEKLY_MINUTES} min</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          {WEEKLY_ACTIVITY.map((day, index) => {
            const barHeight = day.minutes > 0 ? (day.minutes / maxMinutes) * 120 : 4;
            const isToday = index === todayIndex;
            return (
              <View key={day.day} style={styles.chartColumn}>
                <Text style={styles.chartMinuteLabel}>
                  {day.minutes > 0 ? day.minutes : ''}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor:
                          day.minutes > 0
                            ? isToday
                              ? COLORS.primary
                              : COLORS.primary + '88'
                            : COLORS.gray700,
                        opacity: day.minutes > 0 ? (isToday ? 1 : 0.7) : 0.3,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.chartDayLabel,
                    isToday && { color: COLORS.primary, fontFamily: 'Montserrat_700Bold' },
                  ]}
                >
                  {day.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ────────────── Personal Records ────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Personal Records</Text>
          <Feather name="trophy" size={16} color={COLORS.primary} />
        </View>

        <View style={styles.recordsRow}>
          {PERSONAL_RECORDS.map((rec, idx) => (
            <View key={idx} style={styles.recordItem}>
              <View style={styles.recordIconCircle}>
                <Feather name={rec.icon} size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.recordValue}>{rec.value}</Text>
              <Text style={styles.recordLabel}>{rec.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ────────────── Recent Workouts ────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.workoutList}>
        {RECENT_WORKOUTS.map((item) => (
          <View key={item.id} style={styles.workoutItem}>
            <Image source={{ uri: item.image }} style={styles.workoutImage} />
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{item.name}</Text>
              <Text style={styles.workoutDate}>{item.date}</Text>
            </View>
            <View style={styles.workoutMeta}>
              <Text style={styles.workoutDuration}>{item.duration}</Text>
              <Text style={styles.workoutCalories}>{item.calories}</Text>
            </View>
            <View style={styles.workoutCheck}>
              <Feather name="check-circle" size={18} color={COLORS.success} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// ──────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const STAT_CARD_WIDTH = (SCREEN_WIDTH - 40 - CARD_GAP) / 2;

const styles = StyleSheet.create({
  // ─── Layout ─────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 100,
  },

  // ─── Header ─────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    color: COLORS.text,
    fontFamily: 'Kanit_700Bold',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.gray800,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Streak Hero Card ──────────────────────
  streakCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#2D2D2D',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.gray800,
    ...SHADOWS.medium,
  },
  streakTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakTextBlock: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 22,
    color: COLORS.text,
    fontFamily: 'Kanit_700Bold',
    marginBottom: 2,
  },
  streakSubtitle: {
    fontSize: 13,
    color: COLORS.gray400,
    fontFamily: 'Montserrat_400Regular',
  },
  streakDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  streakDayCol: {
    alignItems: 'center',
    gap: 6,
  },
  streakDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDotActive: {
    backgroundColor: COLORS.primary,
  },
  streakDotInactive: {
    backgroundColor: COLORS.gray700,
    borderWidth: 1,
    borderColor: COLORS.gray600,
  },
  streakDayLabel: {
    fontSize: 11,
    color: COLORS.gray500,
    fontFamily: 'Montserrat_600SemiBold',
  },

  // ─── Stats 2x2 Grid ───────────────────────
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: CARD_GAP,
    marginBottom: 20,
  },
  statCard: {
    width: STAT_CARD_WIDTH,
    backgroundColor: '#2D2D2D',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray800,
    ...SHADOWS.small,
  },
  statIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    color: COLORS.text,
    fontFamily: 'Kanit_700Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray400,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
  },

  // ─── Shared Card ───────────────────────────
  card: {
    backgroundColor: '#2D2D2D',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.gray800,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 17,
    color: COLORS.text,
    fontFamily: 'Kanit_600SemiBold',
  },

  // ─── Week Badge ────────────────────────────
  weekBadge: {
    backgroundColor: COLORS.primary + '18',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  weekBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontFamily: 'Montserrat_700Bold',
  },

  // ─── Weekly Chart ──────────────────────────
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 170,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartMinuteLabel: {
    fontSize: 10,
    color: COLORS.gray400,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 6,
    height: 14,
  },
  barTrack: {
    width: '55%',
    maxWidth: 30,
    height: 124,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    minHeight: 4,
    borderRadius: 6,
  },
  chartDayLabel: {
    fontSize: 11,
    color: COLORS.gray500,
    fontFamily: 'Montserrat_500Medium',
    marginTop: 8,
  },

  // ─── Personal Records ─────────────────────
  recordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordItem: {
    flex: 1,
    alignItems: 'center',
  },
  recordIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordValue: {
    fontSize: 18,
    color: COLORS.text,
    fontFamily: 'Kanit_700Bold',
    marginBottom: 2,
  },
  recordLabel: {
    fontSize: 11,
    color: COLORS.gray400,
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
  },

  // ─── Section Header ───────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    color: COLORS.text,
    fontFamily: 'Kanit_600SemiBold',
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: 'Montserrat_600SemiBold',
  },

  // ─── Recent Workouts ──────────────────────
  workoutList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  workoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D2D',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.gray800,
    ...SHADOWS.small,
  },
  workoutImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.gray700,
    marginRight: 14,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 3,
  },
  workoutDate: {
    fontSize: 12,
    color: COLORS.gray500,
    fontFamily: 'Montserrat_400Regular',
  },
  workoutMeta: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  workoutDuration: {
    fontSize: 13,
    color: COLORS.text,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 3,
  },
  workoutCalories: {
    fontSize: 11,
    color: COLORS.primary,
    fontFamily: 'Montserrat_500Medium',
  },
  workoutCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressScreen;
