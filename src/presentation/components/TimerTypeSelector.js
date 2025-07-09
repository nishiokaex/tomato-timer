import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TimerType } from '../../domain/entities/Timer';

export const TimerTypeSelector = ({ 
  currentType = TimerType.POMODORO, 
  onTypeChange, 
  disabled = false 
}) => {
  const { t } = useTranslation();

  const timerTypes = [
    { type: TimerType.POMODORO, label: t('timer.pomodoro') },
    { type: TimerType.SHORT_BREAK, label: t('timer.shortBreak') },
    { type: TimerType.LONG_BREAK, label: t('timer.longBreak') }
  ];

  const getButtonStyle = (type) => {
    const isSelected = currentType === type;
    return [
      styles.button,
      isSelected && styles.selectedButton,
      disabled && styles.disabledButton
    ];
  };

  const getTextStyle = (type) => {
    const isSelected = currentType === type;
    return [
      styles.buttonText,
      isSelected && styles.selectedText,
      disabled && styles.disabledText
    ];
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('timer.selectType')}</Text>
      <View style={styles.buttonsContainer}>
        {timerTypes.map(({ type, label }) => (
          <TouchableOpacity
            key={type}
            style={getButtonStyle(type)}
            onPress={() => !disabled && onTypeChange(type)}
            disabled={disabled}
          >
            <Text style={getTextStyle(type)}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedButton: {
    borderColor: '#2196F3',
    backgroundColor: '#2196F3',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  selectedText: {
    color: 'white',
  },
  disabledText: {
    color: '#999',
  },
});