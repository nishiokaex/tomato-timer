import { AsyncStorageRepository } from '../AsyncStorageRepository';
import { Settings } from '../../../domain/entities/Settings';
import { PomodoroSession } from '../../../domain/entities/PomodoroSession';
import { Timer, TimerType } from '../../../domain/entities/Timer';

describe('AsyncStorageRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new AsyncStorageRepository();
    jest.clearAllMocks();
  });

  describe('saveSettings()', () => {
    test('設定を正常に保存する', async () => {
      const settings = new Settings({ pomodoroLength: 30 * 60 });
      
      const result = await repository.saveSettings(settings);
      
      expect(result).toBe(true);
    });

    test('null設定を保存するとエラーが発生する', async () => {
      await expect(repository.saveSettings(null)).rejects.toThrow();
    });

    test('undefined設定を保存するとエラーが発生する', async () => {
      await expect(repository.saveSettings(undefined)).rejects.toThrow();
    });

    test('AsyncStorageエラー時にエラーを投げる', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const settings = new Settings();
      
      await expect(repository.saveSettings(settings)).rejects.toThrow();
    });
  });

  describe('loadSettings()', () => {
    test('設定を正常に読み込む', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      const mockSettings = { pomodoroLength: 30 * 60, language: 'en' };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockSettings));
      
      const result = await repository.loadSettings();
      
      expect(result).toBeInstanceOf(Settings);
      expect(result.pomodoroLength).toBe(30 * 60);
    });

    test('データが存在しない場合はデフォルト設定を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await repository.loadSettings();
      
      expect(result).toBeInstanceOf(Settings);
      expect(result.pomodoroLength).toBe(25 * 60); // デフォルト値
    });

    test('無効なJSONの場合はデフォルト設定を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');
      
      const result = await repository.loadSettings();
      
      expect(result).toBeInstanceOf(Settings);
    });

    test('AsyncStorageエラー時にデフォルト設定を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await repository.loadSettings();
      expect(result).toBeInstanceOf(Settings);
      expect(result.language).toBe('ja');
    });
  });

  describe('saveSessions()', () => {
    test('セッションを正常に保存する', async () => {
      const sessions = [
        new PomodoroSession({ type: 'pomodoro' }),
        new PomodoroSession({ type: 'shortBreak' })
      ];
      
      const result = await repository.saveSessions(sessions);
      
      expect(result).toBe(true);
    });

    test('空配列を保存する', async () => {
      const result = await repository.saveSessions([]);
      
      expect(result).toBe(true);
    });

    test('nullセッションを保存するとエラーが発生する', async () => {
      await expect(repository.saveSessions(null)).rejects.toThrow();
    });

    test('AsyncStorageエラー時にエラーを投げる', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(repository.saveSessions([])).rejects.toThrow();
    });
  });

  describe('loadSessions()', () => {
    test('セッションを正常に読み込む', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      const mockSessions = [
        { type: 'pomodoro', duration: 1500, completed: true },
        { type: 'shortBreak', duration: 300, completed: true }
      ];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockSessions));
      
      const result = await repository.loadSessions();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(PomodoroSession);
    });

    test('データが存在しない場合は空配列を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await repository.loadSessions();
      
      expect(result).toEqual([]);
    });

    test('無効なJSONの場合は空配列を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');
      
      const result = await repository.loadSessions();
      
      expect(result).toEqual([]);
    });

    test('AsyncStorageエラー時に空配列を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await repository.loadSessions();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('saveTimer()', () => {
    test('タイマーを正常に保存する', async () => {
      const timer = new Timer(TimerType.POMODORO, 1500);
      
      const result = await repository.saveTimer(timer);
      
      expect(result).toBe(true);
    });

    test('nullタイマーを保存する', async () => {
      const result = await repository.saveTimer(null);
      
      expect(result).toBe(true);
    });

    test('AsyncStorageエラー時にエラーを投げる', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const timer = new Timer(TimerType.POMODORO, 1500);
      
      await expect(repository.saveTimer(timer)).rejects.toThrow();
    });
  });

  describe('loadTimer()', () => {
    test('タイマーを正常に読み込む', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      const mockTimer = {
        id: 'test-id',
        type: 'pomodoro',
        duration: 1500,
        remainingTime: 1400,
        status: 'running'
      };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockTimer));
      
      const result = await repository.loadTimer();
      
      expect(result).toBeInstanceOf(Timer);
      expect(result.type).toBe('pomodoro');
      expect(result.duration).toBe(1500);
    });

    test('データが存在しない場合はnullを返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await repository.loadTimer();
      
      expect(result).toBeNull();
    });

    test('無効なJSONの場合はnullを返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');
      
      const result = await repository.loadTimer();
      
      expect(result).toBeNull();
    });

    test('AsyncStorageエラー時にnullを返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await repository.loadTimer();
      expect(result).toBeNull();
    });
  });

  describe('clearAll()', () => {
    test('すべてのデータを削除する', async () => {
      const result = await repository.clearAll();
      
      expect(result).toBe(true);
    });

    test('AsyncStorageエラー時にエラーを投げる', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.multiRemove.mockRejectedValueOnce(new Error('Clear error'));
      
      await expect(repository.clearAll()).rejects.toThrow('Clear error');
    });
  });

  describe('データバージョン管理', () => {
    test('旧バージョンデータのマイグレーション', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      const oldVersionSettings = { pomodoroLength: 1500 }; // バージョン情報なし
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(oldVersionSettings));
      
      const result = await repository.loadSettings();
      
      expect(result).toBeInstanceOf(Settings);
      expect(result.version).toBe(1); // デフォルトバージョン
    });

    test('新バージョンデータの読み込み', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      const newVersionSettings = { pomodoroLength: 1800, version: 2 };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(newVersionSettings));
      
      const result = await repository.loadSettings();
      
      expect(result).toBeInstanceOf(Settings);
      expect(result.version).toBe(2);
    });
  });

  describe('エラーログ', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    test('設定保存エラー時にログが出力される', async () => {
      await expect(repository.saveSettings(null)).rejects.toThrow();
      
      expect(console.error).toHaveBeenCalledWith(
        '設定の保存に失敗しました:',
        expect.any(Error)
      );
    });

    test('セッション保存エラー時にログが出力される', async () => {
      await expect(repository.saveSessions(null)).rejects.toThrow();
      
      expect(console.error).toHaveBeenCalledWith(
        'セッションの保存に失敗しました:',
        expect.any(Error)
      );
    });
  });
});