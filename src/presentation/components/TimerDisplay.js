import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

export const TimerDisplay = ({ 
  timer, 
  onStart, 
  onPause, 
  onResume, 
  onReset, 
  onStop 
}) => {
  const { t } = useTranslation();


  if (!timer || typeof timer.getFormattedTime !== 'function') {
    return (
      <View style={styles.container}>
        <Text style={styles.noTimer}>{t('timer.noTimer')}</Text>
      </View>
    );
  }

  const timeFormat = timer.getFormattedTime();
  const progress = timer.getProgress();

  const getTimerTypeText = () => {
    switch (timer.type) {
      case 'pomodoro':
        return t('timer.pomodoro');
      case 'shortBreak':
        return t('timer.shortBreak');
      case 'longBreak':
        return t('timer.longBreak');
      default:
        return t('timer.pomodoro');
    }
  };

  const getStatusColor = () => {
    switch (timer.status) {
      case 'running':
        return '#4CAF50';
      case 'paused':
        return '#FF9800';
      case 'completed':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const renderControls = () => {
    switch (timer.status) {
      case 'idle':
        return (
          <TouchableOpacity style={[styles.button, styles.startButton]} onPress={onStart}>
            <Text style={styles.buttonText}>{t('timer.start')}</Text>
          </TouchableOpacity>
        );
      case 'running':
        return (
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={[styles.button, styles.pauseButton]} onPress={onPause}>
              <Text style={styles.buttonText}>{t('timer.pause')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={onReset}>
              <Text style={styles.buttonText}>{t('timer.reset')}</Text>
            </TouchableOpacity>
          </View>
        );
      case 'paused':
        return (
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={[styles.button, styles.resumeButton]} onPress={onResume}>
              <Text style={styles.buttonText}>{t('timer.resume')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={onReset}>
              <Text style={styles.buttonText}>{t('timer.reset')}</Text>
            </TouchableOpacity>
          </View>
        );
      case 'completed':
        return (
          <View style={styles.controlsContainer}>
            <Text style={styles.completedText}>{t('timer.completed')}</Text>
            <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={onReset}>
              <Text style={styles.buttonText}>{t('timer.reset')}</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerType}>{getTimerTypeText()}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${progress}%`, backgroundColor: getStatusColor() }
              ]} 
            />
          </View>
        </View>

        <Text style={[styles.timeDisplay, { color: getStatusColor() }]}>
          {timeFormat.total}
        </Text>

        <Text style={styles.timeRemaining}>
          {t('timer.timeRemaining')}: {timeFormat.minutes}{t('timer.minutes')} {timeFormat.seconds}{t('timer.seconds')}
        </Text>
      </View>

      <View style={styles.controls}>
        {renderControls()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerType: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    width: 200,
    marginBottom: 20,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  timeDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  timeRemaining: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  controls: {
    width: '100%',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 300,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
  },
  resetButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  noTimer: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});