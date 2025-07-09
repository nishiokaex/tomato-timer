import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ja from './ja.json';
import en from './en.json';
import zh from './zh.json';
import de from './de.json';
import es from './es.json';

const resources = {
  ja: { translation: ja },
  en: { translation: en },
  zh: { translation: zh },
  de: { translation: de },
  es: { translation: es },
};

const STORAGE_KEY = 'app-language';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ja', // デフォルトは日本語
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// 保存された言語設定を読み込む
const loadLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.log('言語設定の読み込みに失敗しました:', error);
  }
};

// 言語設定を保存する
export const saveLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, language);
    i18n.changeLanguage(language);
  } catch (error) {
    console.log('言語設定の保存に失敗しました:', error);
  }
};

// 初期化時に言語設定を読み込む
loadLanguage();

export default i18n;