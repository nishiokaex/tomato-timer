import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTimerStore } from './src/presentation/stores/TimerStore';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { getStorageService } from './src/infrastructure/services/StorageService';
import { getNotificationService } from './src/infrastructure/services/NotificationService';
import ErrorBoundary from './src/presentation/components/ErrorBoundary';
import './src/presentation/locales/i18n';

export default function App() {
  const { loadData, setError } = useTimerStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // ストレージサービスの初期化
        const storageService = getStorageService();
        await storageService.initialize();
        
        // 通知サービスの初期化
        const notificationService = getNotificationService();
        await notificationService.initialize();
        
        // 保存されたデータを読み込む
        await loadData();
        
        console.log('アプリが初期化されました');
      } catch (error) {
        console.error('アプリの初期化に失敗しました:', error);
        setError('アプリの初期化に失敗しました');
      }
    };

    initializeApp();
  }, []); // 初期化は一度だけ実行

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <View style={styles.container}>
          <AppNavigator />
          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
