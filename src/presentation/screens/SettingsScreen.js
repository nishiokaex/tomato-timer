import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  TextInput, 
  Alert 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTimerStore } from '../stores/TimerStore';
import { saveLanguage } from '../locales/i18n';

export const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useTimerStore();
  
  const [pomodoroLength, setPomodoroLength] = useState(Math.floor(settings.pomodoroLength / 60));
  const [shortBreakLength, setShortBreakLength] = useState(Math.floor(settings.shortBreakLength / 60));
  const [longBreakLength, setLongBreakLength] = useState(Math.floor(settings.longBreakLength / 60));
  const [notifications, setNotifications] = useState(settings.notifications);
  const [autoStart, setAutoStart] = useState(settings.autoStart);

  const languages = [
    { code: 'ja', name: t('languages.ja') },
    { code: 'en', name: t('languages.en') },
    { code: 'zh', name: t('languages.zh') },
    { code: 'de', name: t('languages.de') },
    { code: 'es', name: t('languages.es') }
  ];

  const handleSave = () => {
    try {
      // 入力値の検証
      if (pomodoroLength < 1 || pomodoroLength > 60) {
        Alert.alert(t('error.title'), 'ポモドーロ時間は1-60分の間で設定してください');
        return;
      }
      
      if (shortBreakLength < 1 || shortBreakLength > 30) {
        Alert.alert(t('error.title'), 'ショートブレイク時間は1-30分の間で設定してください');
        return;
      }
      
      if (longBreakLength < 1 || longBreakLength > 60) {
        Alert.alert(t('error.title'), 'ロングブレイク時間は1-60分の間で設定してください');
        return;
      }

      // 設定を更新
      updateSettings({
        pomodoroLength: pomodoroLength * 60,
        shortBreakLength: shortBreakLength * 60,
        longBreakLength: longBreakLength * 60,
        notifications,
        autoStart
      });

      Alert.alert(t('common.success'), '設定が保存されました');
      if (navigation) {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert(t('error.title'), error.message);
    }
  };

  const handleLanguageChange = async (languageCode) => {
    try {
      await saveLanguage(languageCode);
      updateSettings({ language: languageCode });
      Alert.alert(t('common.success'), '言語が変更されました');
    } catch (error) {
      Alert.alert(t('error.title'), error.message);
    }
  };

  const handleReset = () => {
    Alert.alert(
      t('settings.reset'),
      '設定をリセットしますか？',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.ok'),
          onPress: () => {
            setPomodoroLength(25);
            setShortBreakLength(5);
            setLongBreakLength(15);
            setNotifications({
              enabled: true,
              sound: true,
              vibration: true
            });
            setAutoStart(false);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.languageContainer}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageButton,
                i18n.language === language.code && styles.selectedLanguage
              ]}
              onPress={() => handleLanguageChange(language.code)}
            >
              <Text style={[
                styles.languageText,
                i18n.language === language.code && styles.selectedLanguageText
              ]}>
                {language.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.title')}</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.pomodoroLength')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={pomodoroLength.toString()}
              onChangeText={(text) => setPomodoroLength(parseInt(text) || 0)}
              keyboardType="numeric"
            />
            <Text style={styles.unit}>{t('timer.minutes')}</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.shortBreakLength')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={shortBreakLength.toString()}
              onChangeText={(text) => setShortBreakLength(parseInt(text) || 0)}
              keyboardType="numeric"
            />
            <Text style={styles.unit}>{t('timer.minutes')}</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.longBreakLength')}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={longBreakLength.toString()}
              onChangeText={(text) => setLongBreakLength(parseInt(text) || 0)}
              keyboardType="numeric"
            />
            <Text style={styles.unit}>{t('timer.minutes')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.notifications')}</Text>
          <Switch
            value={notifications.enabled}
            onValueChange={(value) => setNotifications({...notifications, enabled: value})}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.sound')}</Text>
          <Switch
            value={notifications.sound}
            onValueChange={(value) => setNotifications({...notifications, sound: value})}
            disabled={!notifications.enabled}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.vibration')}</Text>
          <Switch
            value={notifications.vibration}
            onValueChange={(value) => setNotifications({...notifications, vibration: value})}
            disabled={!notifications.enabled}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.autoStart')}</Text>
          <Switch
            value={autoStart}
            onValueChange={setAutoStart}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>{t('settings.save')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.buttonText}>{t('settings.reset')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  selectedLanguage: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  languageText: {
    color: '#333',
    fontSize: 14,
  },
  selectedLanguageText: {
    color: 'white',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 16,
    textAlign: 'center',
    width: 60,
  },
  unit: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#757575',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});