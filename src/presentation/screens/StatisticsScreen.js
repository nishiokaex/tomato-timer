import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTimerStore } from '../stores/TimerStore';

export const StatisticsScreen = () => {
  const { t } = useTranslation();
  const { getStatistics } = useTimerStore();
  
  let statistics;
  try {
    statistics = getStatistics();
  } catch (error) {
    console.error('統計データの取得に失敗しました:', error);
    statistics = {
      today: { count: 0, totalTime: 0 },
      thisWeek: { count: 0, totalTime: 0 },
      thisMonth: { count: 0, totalTime: 0 },
      averageTime: 0,
      streak: 0,
      bestStreak: 0
    };
  }
  
  // 統計データが不正な場合のフォールバック
  if (!statistics || typeof statistics !== 'object') {
    statistics = {
      today: { count: 0, totalTime: 0 },
      thisWeek: { count: 0, totalTime: 0 },
      thisMonth: { count: 0, totalTime: 0 },
      averageTime: 0,
      streak: 0,
      bestStreak: 0
    };
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}時間 ${minutes}分`;
    }
    return `${minutes}分`;
  };

  const StatCard = ({ title, value, subtitle, color = '#2196F3' }) => (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </View>
  );

  const SectionTitle = ({ title }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('statistics.title')}</Text>
      </View>

      <SectionTitle title={t('statistics.today')} />
      <View style={styles.cardRow}>
        <StatCard
          title={t('statistics.completedPomodoros')}
          value={statistics.today.count}
          subtitle={t('timer.sessions')}
          color="#4CAF50"
        />
        <StatCard
          title={t('statistics.totalTime')}
          value={formatTime(statistics.today.totalTime)}
          color="#FF9800"
        />
      </View>

      <SectionTitle title={t('statistics.thisWeek')} />
      <View style={styles.cardRow}>
        <StatCard
          title={t('statistics.completedPomodoros')}
          value={statistics.thisWeek.count}
          subtitle={t('timer.sessions')}
          color="#4CAF50"
        />
        <StatCard
          title={t('statistics.totalTime')}
          value={formatTime(statistics.thisWeek.totalTime)}
          color="#FF9800"
        />
      </View>

      <SectionTitle title={t('statistics.thisMonth')} />
      <View style={styles.cardRow}>
        <StatCard
          title={t('statistics.completedPomodoros')}
          value={statistics.thisMonth.count}
          subtitle={t('timer.sessions')}
          color="#4CAF50"
        />
        <StatCard
          title={t('statistics.totalTime')}
          value={formatTime(statistics.thisMonth.totalTime)}
          color="#FF9800"
        />
      </View>

      <SectionTitle title="全体統計" />
      <View style={styles.cardRow}>
        <StatCard
          title={t('statistics.completedPomodoros')}
          value={statistics.total.count}
          subtitle={t('timer.sessions')}
          color="#4CAF50"
        />
        <StatCard
          title={t('statistics.totalTime')}
          value={formatTime(statistics.total.totalTime)}
          color="#FF9800"
        />
      </View>

      <View style={styles.cardRow}>
        <StatCard
          title={t('statistics.averageTime')}
          value={formatTime(statistics.total.averageTime)}
          subtitle="1セッション平均"
          color="#9C27B0"
        />
        <StatCard
          title={t('statistics.streak')}
          value={statistics.streak}
          subtitle="連続日数"
          color="#2196F3"
        />
      </View>

      <View style={styles.fullWidthCard}>
        <StatCard
          title={t('statistics.bestStreak')}
          value={statistics.bestStreak}
          subtitle="最高連続記録（日）"
          color="#FF5722"
        />
      </View>

      <View style={styles.motivationalSection}>
        <Text style={styles.motivationalTitle}>🍅 頑張っていますね！</Text>
        <Text style={styles.motivationalText}>
          {statistics.total.count > 0 
            ? `これまでに${statistics.total.count}回のポモドーロを完了しました。素晴らしい成果です！`
            : 'ポモドーロテクニックを始めましょう。集中力を高める第一歩です！'
          }
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  fullWidthCard: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  motivationalSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  motivationalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  motivationalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});