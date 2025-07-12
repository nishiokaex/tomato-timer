import { getStorageService } from '../StorageService';
import { Settings } from '../../../domain/entities/Settings';
import { PomodoroSession } from '../../../domain/entities/PomodoroSession';
import { Timer, TimerType } from '../../../domain/entities/Timer';

describe('StorageService', () => {
  let storageService;

  beforeEach(() => {
    storageService = getStorageService();
    jest.clearAllMocks();
  });

  describe('saveAll()', () => {
    test('設定、セッション、タイマーを保存する', async () => {
      const settings = new Settings({ pomodoroLength: 30 * 60 });
      const sessions = [new PomodoroSession({ type: 'pomodoro' })];
      const timer = new Timer(TimerType.POMODORO, 1500);

      const result = await storageService.saveAll(settings, sessions, timer);

      expect(result).toBe(true);
    });

    test('null値でも保存する', async () => {
      const result = await storageService.saveAll(null, [], null);

      expect(result).toBe(true);
    });

    test('undefinedでも保存する', async () => {
      const result = await storageService.saveAll(undefined, undefined, undefined);

      expect(result).toBe(true);
    });
  });

  describe('loadAll()', () => {
    test('保存されたデータを読み込む', async () => {
      const result = await storageService.loadAll();

      expect(result).toHaveProperty('settings');
      expect(result).toHaveProperty('sessions');
      expect(result).toHaveProperty('timer');
      expect(result.settings).toBeInstanceOf(Settings);
      expect(Array.isArray(result.sessions)).toBe(true);
    });

    test('エラーが発生した場合のフォールバック', async () => {
      // AsyncStorageをエラーを投げるようにモック
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const result = await storageService.loadAll();

      expect(result.settings).toBeInstanceOf(Settings);
      expect(result.sessions).toEqual([]);
      expect(result.timer).toBeNull();
    });
  });

  describe('saveSettings()', () => {
    test('設定を保存する', async () => {
      const settings = new Settings({ language: 'en' });

      const result = await storageService.saveSettings(settings);

      expect(result).toBe(true);
    });

    test('null設定を保存するとエラーが発生する', async () => {
      await expect(storageService.saveSettings(null)).rejects.toThrow();
    });
  });

  describe('loadSettings()', () => {
    test('設定を読み込む', async () => {
      const result = await storageService.loadSettings();

      expect(result).toBeInstanceOf(Settings);
    });

    test('エラー時はデフォルト設定を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Error'));

      const result = await storageService.loadSettings();

      expect(result).toBeInstanceOf(Settings);
    });
  });

  describe('saveSessions()', () => {
    test('セッションリストを保存する', async () => {
      const sessions = [
        new PomodoroSession({ type: 'pomodoro' }),
        new PomodoroSession({ type: 'shortBreak' })
      ];

      const result = await storageService.saveSessions(sessions);

      expect(result).toBe(true);
    });

    test('空のセッションリストを保存する', async () => {
      const result = await storageService.saveSessions([]);

      expect(result).toBe(true);
    });
  });

  describe('loadSessions()', () => {
    test('セッションリストを読み込む', async () => {
      const result = await storageService.loadSessions();

      expect(Array.isArray(result)).toBe(true);
    });

    test('エラー時は空配列を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Error'));

      const result = await storageService.loadSessions();

      expect(result).toEqual([]);
    });
  });

  describe('saveTimer()', () => {
    test('タイマーを保存する', async () => {
      const timer = new Timer(TimerType.SHORT_BREAK, 300);

      const result = await storageService.saveTimer(timer);

      expect(result).toBe(true);
    });

    test('nullタイマーを保存する', async () => {
      const result = await storageService.saveTimer(null);

      expect(result).toBe(true);
    });
  });

  describe('loadTimer()', () => {
    test('タイマーを読み込む', async () => {
      const result = await storageService.loadTimer();

      expect(result).toBeNull();
    });

    test('エラー時はnullを返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Error'));

      const result = await storageService.loadTimer();

      expect(result).toBeNull();
    });
  });

  describe('clearAll()', () => {
    test('すべてのデータを削除する', async () => {
      const result = await storageService.clearAll();

      expect(result).toBe(true);
    });

    test('エラーが発生した場合', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.multiRemove.mockRejectedValueOnce(new Error('Clear error'));

      await expect(storageService.clearAll()).rejects.toThrow('Clear error');
    });
  });
});