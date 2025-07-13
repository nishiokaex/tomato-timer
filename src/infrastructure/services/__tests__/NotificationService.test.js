import { getNotificationService } from '../NotificationService';

// expo-notificationsのモック
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'expo-push-token' }),
}));

// Platformのモック
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios'
  }
}));

describe('NotificationService', () => {
  let notificationService;

  beforeEach(() => {
    notificationService = getNotificationService();
    jest.clearAllMocks();
  });

  describe('requestPermissions()', () => {
    test('通知許可が正常に要求される', async () => {
      const result = await notificationService.requestPermissions();
      
      expect(result).toBe(true);
    });

    test('通知許可が拒否された場合', async () => {
      const mockNotifications = require('expo-notifications');
      mockNotifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
      mockNotifications.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
      
      const result = await notificationService.requestPermissions();
      
      expect(result).toBe(false);
    });

    test('権限要求でエラーが発生した場合', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const mockNotifications = require('expo-notifications');
      mockNotifications.getPermissionsAsync.mockRejectedValueOnce(new Error('Permission error'));
      
      const result = await notificationService.requestPermissions();
      
      expect(result).toBe(false);
      
      consoleSpy.mockRestore();
    });
  });

  describe('scheduleLocalNotification()', () => {
    test('通知が正常にスケジュールされる', async () => {
      const title = 'テストタイトル';
      const body = 'テスト本文';
      const seconds = 30;
      
      const result = await notificationService.scheduleLocalNotification(title, body, seconds);
      
      expect(result).toBe('notification-id');
    });

    test('通知スケジュールでエラーが発生した場合', async () => {
      const mockNotifications = require('expo-notifications');
      mockNotifications.scheduleNotificationAsync.mockRejectedValueOnce(new Error('Schedule error'));
      
      const result = await notificationService.scheduleLocalNotification('Title', 'Body', 30);
      
      expect(result).toBeNull();
    });

    test('0秒での通知スケジュール', async () => {
      const result = await notificationService.scheduleLocalNotification('Title', 'Body', 0);
      
      expect(result).toBe('notification-id');
    });

    test('負の値での通知スケジュール', async () => {
      const result = await notificationService.scheduleLocalNotification('Title', 'Body', -1);
      
      expect(result).toBe('notification-id');
    });
  });

  describe('cancelNotification()', () => {
    test('通知が正常にキャンセルされる', async () => {
      const notificationId = 'test-id';
      
      const result = await notificationService.cancelNotification(notificationId);
      
      expect(result).toBe(true);
    });

    test('通知キャンセルでエラーが発生した場合', async () => {
      const mockNotifications = require('expo-notifications');
      mockNotifications.cancelScheduledNotificationAsync.mockRejectedValueOnce(new Error('Cancel error'));
      
      const result = await notificationService.cancelNotification('test-id');
      
      expect(result).toBe(false);
    });

    test('undefinedのIDでキャンセル', async () => {
      const result = await notificationService.cancelNotification(undefined);
      
      expect(result).toBe(true);
    });

    test('nullのIDでキャンセル', async () => {
      const result = await notificationService.cancelNotification(null);
      
      expect(result).toBe(true);
    });
  });

  describe('showCompleteNotification()', () => {
    const mockSettings = {
      notifications: {
        enabled: true,
        sound: true,
        vibration: true
      }
    };
    const mockT = (key) => key;

    test('ポモドーロ完了通知を表示', async () => {
      const result = await notificationService.showCompleteNotification('pomodoro', mockSettings, mockT);
      
      expect(result).toBe('notification-id');
    });

    test('短い休憩完了通知を表示', async () => {
      const result = await notificationService.showCompleteNotification('shortBreak', mockSettings, mockT);
      
      expect(result).toBe('notification-id');
    });

    test('長い休憩完了通知を表示', async () => {
      const result = await notificationService.showCompleteNotification('longBreak', mockSettings, mockT);
      
      expect(result).toBe('notification-id');
    });

    test('通知が無効の場合', async () => {
      const disabledSettings = {
        notifications: {
          enabled: false,
          sound: true,
          vibration: true
        }
      };
      
      const result = await notificationService.showCompleteNotification('pomodoro', disabledSettings, mockT);
      
      expect(result).toBeUndefined();
    });
  });

  describe('音声通知', () => {
    test('playNotificationSound()が実行される', () => {
      expect(() => {
        notificationService.playNotificationSound();
      }).not.toThrow();
    });
  });

  describe('バイブレーション', () => {
    test('vibrate()が実行される', () => {
      expect(() => {
        notificationService.vibrate();
      }).not.toThrow();
    });
  });

  describe('初期化', () => {
    test('initialize()が正常に実行される', async () => {
      const result = await notificationService.initialize();
      
      expect(typeof result).toBe('boolean');
    });
  });
});