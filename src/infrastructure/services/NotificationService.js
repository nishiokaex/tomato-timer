import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.permissions = null;
    this.notificationToken = null;
    
    // 通知の表示設定
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }

  async initialize() {
    try {
      if (this.isInitialized) return true;

      // 通知権限の確認・取得
      const permission = await this.requestPermissions();
      if (!permission) {
        console.log('通知権限が拒否されました');
        return false;
      }

      // プッシュ通知トークンの取得（必要に応じて）
      if (Platform.OS !== 'web') {
        try {
          const token = await Notifications.getExpoPushTokenAsync();
          this.notificationToken = token.data;
          console.log('プッシュ通知トークン:', this.notificationToken);
        } catch (error) {
          console.log('プッシュ通知トークンの取得に失敗しました:', error);
        }
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('通知サービスの初期化に失敗しました:', error);
      return false;
    }
  }

  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.permissions = finalStatus;
      return finalStatus === 'granted';
    } catch (error) {
      console.error('通知権限の取得に失敗しました:', error);
      return false;
    }
  }

  async scheduleLocalNotification(title, body, delayInSeconds = 0) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.permissions !== 'granted') {
        console.log('通知権限がありません');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: delayInSeconds > 0 ? { seconds: delayInSeconds } : null,
      });

      console.log('通知がスケジュールされました:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('通知のスケジュールに失敗しました:', error);
      return null;
    }
  }

  async cancelNotification(notificationId) {
    try {
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log('通知がキャンセルされました:', notificationId);
      }
    } catch (error) {
      console.error('通知のキャンセルに失敗しました:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('すべての通知がキャンセルされました');
    } catch (error) {
      console.error('すべての通知のキャンセルに失敗しました:', error);
    }
  }

  async sendTimerCompleteNotification(timerType, t) {
    const notifications = {
      pomodoro: {
        title: t('notifications.pomodoroCompleted'),
        body: t('notifications.timeToBreak')
      },
      shortBreak: {
        title: t('notifications.breakCompleted'),
        body: t('notifications.timeToWork')
      },
      longBreak: {
        title: t('notifications.breakCompleted'),
        body: t('notifications.timeToWork')
      }
    };

    const notification = notifications[timerType] || notifications.pomodoro;
    return await this.scheduleLocalNotification(notification.title, notification.body);
  }

  async sendTimerStartNotification(timerType, duration, t) {
    const titles = {
      pomodoro: t('timer.pomodoro'),
      shortBreak: t('timer.shortBreak'),
      longBreak: t('timer.longBreak')
    };

    const title = titles[timerType] || titles.pomodoro;
    const minutes = Math.floor(duration / 60);
    const body = `${minutes}${t('timer.minutes')}のタイマーが開始されました`;

    return await this.scheduleLocalNotification(title, body);
  }

  // Web版では音声による通知を提供
  playNotificationSound() {
    if (Platform.OS === 'web') {
      try {
        // Web Audio APIを使用してビープ音を生成
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // 800Hz
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('音声通知の再生に失敗しました:', error);
      }
    }
  }

  // バイブレーション（モバイル版のみ）
  vibrate() {
    if (Platform.OS !== 'web' && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }

  // 通知の表示とサウンド・バイブレーション
  async showCompleteNotification(timerType, settings, t) {
    if (settings.notifications.enabled) {
      // 通知の表示
      await this.sendTimerCompleteNotification(timerType, t);
      
      // サウンド再生
      if (settings.notifications.sound) {
        this.playNotificationSound();
      }
      
      // バイブレーション
      if (settings.notifications.vibration) {
        this.vibrate();
      }
    }
  }

  // 通知履歴の取得
  async getNotificationHistory() {
    try {
      const notifications = await Notifications.getPresentedNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('通知履歴の取得に失敗しました:', error);
      return [];
    }
  }
}

// シングルトンインスタンス
let notificationServiceInstance = null;

export const getNotificationService = () => {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
};