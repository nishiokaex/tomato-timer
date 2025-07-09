import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTimerStore } from '../stores/TimerStore';
import { TimerDisplay } from '../components/TimerDisplay';
import { TimerTypeSelector } from '../components/TimerTypeSelector';
import { TimerType } from '../../domain/entities/Timer';

export const TimerScreen = () => {
  const { t } = useTranslation();
  const {
    currentTimer,
    createTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
    setError,
    clearError,
    error
  } = useTimerStore();

  useEffect(() => {
    if (!currentTimer) {
      console.log('タイマーがないため、新しいタイマーを作成します');
      createTimer(TimerType.POMODORO);
    }
  }, [currentTimer, createTimer]);

  useEffect(() => {
    if (error) {
      Alert.alert(t('error.title'), error, [
        { text: t('common.ok'), onPress: clearError }
      ]);
    }
  }, [error, clearError, t]);

  const handleTypeChange = (type) => {
    try {
      if (currentTimer && currentTimer.status === 'running') {
        Alert.alert(
          t('timer.changeTypeConfirm'),
          t('timer.changeTypeMessage'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { 
              text: t('common.ok'), 
              onPress: () => {
                stopTimer();
                createTimer(type);
              }
            }
          ]
        );
      } else {
        createTimer(type);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStart = () => {
    try {
      startTimer();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePause = () => {
    try {
      pauseTimer();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResume = () => {
    try {
      resumeTimer();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    try {
      // Web環境では確認ダイアログを省略
      resetTimer();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStop = () => {
    try {
      stopTimer();
    } catch (err) {
      setError(err.message);
    }
  };

  const isTimerRunning = currentTimer && currentTimer.status === 'running';

  return (
    <View style={styles.container}>
      <TimerTypeSelector
        currentType={currentTimer?.type}
        onTypeChange={handleTypeChange}
        disabled={isTimerRunning}
      />
      
      <TimerDisplay
        timer={currentTimer}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
        onStop={handleStop}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
});