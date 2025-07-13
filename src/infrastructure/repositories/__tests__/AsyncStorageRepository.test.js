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
    });

    test('新バージョンデータの読み込み', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      const newVersionSettings = { pomodoroLength: 1800, version: 2 };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(newVersionSettings));
      
      const result = await repository.loadSettings();
      
      expect(result).toBeInstanceOf(Settings);
    });
  });

  describe('getVersion() / setVersion()', () => {
    test('バージョンを正常に取得する', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce('2');
      
      const result = await repository.getVersion();
      
      expect(result).toBe(2);
    });

    test('バージョンが存在しない場合は0を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await repository.getVersion();
      
      expect(result).toBe(0);
    });

    test('バージョンを正常に設定する', async () => {
      const result = await repository.setVersion(3);
      
      expect(result).toBe(true);
    });

    test('バージョン取得エラー時に0を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await repository.getVersion();
      
      expect(result).toBe(0);
    });

    test('バージョン設定エラー時にエラーを投げる', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      await expect(repository.setVersion(3)).rejects.toThrow();
    });
  });

  describe('migrate()', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      console.log.mockRestore();
    });

    test('マイグレーションを正常に実行する', async () => {
      const result = await repository.migrate(0, 1);
      
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('マイグレーション')
      );
    });

    test('初期バージョンのマイグレーション', async () => {
      const result = await repository.migrate(0, 1);
      
      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('初期バージョン')
      );
    });

    test('マイグレーションエラー時にエラーを投げる', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Migration error'));
      
      await expect(repository.migrate(0, 1)).rejects.toThrow();
    });
  });

  describe('initializeStorage()', () => {
    test('ストレージを正常に初期化する', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce('1'); // 現在のバージョン
      
      const result = await repository.initializeStorage();
      
      expect(result).toBe(true);
    });

    test('バージョンアップ時にマイグレーションを実行する', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce('0'); // 旧バージョン
      
      const result = await repository.initializeStorage();
      
      expect(result).toBe(true);
    });

    test('初期化エラー時にエラーを投げる', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      // getVersionは成功するが、setVersionでエラーが発生するシナリオ
      mockAsyncStorage.getItem.mockResolvedValueOnce('0'); // getVersion: 0を返す
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Init error')); // setVersion: エラー
      
      await expect(repository.initializeStorage()).rejects.toThrow();
    });
  });

  describe('saveAll() / loadAll()', () => {
    test('すべてのデータを一括保存する', async () => {
      const settings = new Settings({ pomodoroLength: 30 * 60 });
      const sessions = [new PomodoroSession({ type: 'pomodoro' })];
      const timer = new Timer(TimerType.POMODORO, 1500);
      
      const result = await repository.saveAll(settings, sessions, timer);
      
      expect(result).toBe(true);
    });

    test('nullデータを除外して保存する', async () => {
      const settings = new Settings();
      
      const result = await repository.saveAll(settings, null, null);
      
      expect(result).toBe(true);
    });

    test('すべてnullの場合でも正常処理する', async () => {
      const result = await repository.saveAll(null, null, null);
      
      expect(result).toBe(true);
    });

    test('すべてのデータを一括読み込みする', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      const mockData = [
        ['tomato-timer-settings', JSON.stringify({ pomodoroLength: 1800 })],
        ['tomato-timer-sessions', JSON.stringify([{ type: 'pomodoro' }])],
        ['tomato-timer-current-timer', JSON.stringify({ type: 'pomodoro', duration: 1500 })]
      ];
      mockAsyncStorage.multiGet.mockResolvedValueOnce(mockData);
      
      const result = await repository.loadAll();
      
      expect(result.settings).toBeInstanceOf(Settings);
      expect(Array.isArray(result.sessions)).toBe(true);
      expect(result.timer).toBeInstanceOf(Timer);
    });

    test('空のデータでもデフォルト値を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.multiGet.mockResolvedValueOnce([
        ['tomato-timer-settings', null],
        ['tomato-timer-sessions', null],
        ['tomato-timer-current-timer', null]
      ]);
      
      const result = await repository.loadAll();
      
      expect(result.settings).toBeInstanceOf(Settings);
      expect(result.sessions).toEqual([]);
      expect(result.timer).toBeNull();
    });

    test('パースエラーがあっても続行する', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.multiGet.mockResolvedValueOnce([
        ['tomato-timer-settings', 'invalid json'],
        ['tomato-timer-sessions', JSON.stringify([{ type: 'pomodoro' }])],
        ['tomato-timer-current-timer', null]
      ]);
      
      const result = await repository.loadAll();
      
      expect(result.settings).toBeInstanceOf(Settings);
      expect(Array.isArray(result.sessions)).toBe(true);
      expect(result.timer).toBeNull();
    });

    test('バッチ保存エラー時にエラーを投げる', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.multiSet.mockRejectedValueOnce(new Error('Batch save error'));
      
      const settings = new Settings();
      
      await expect(repository.saveAll(settings, [], null)).rejects.toThrow();
    });

    test('バッチ読み込みエラー時にデフォルト値を返す', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.multiGet.mockRejectedValueOnce(new Error('Batch load error'));
      
      const result = await repository.loadAll();
      
      expect(result.settings).toBeInstanceOf(Settings);
      expect(result.sessions).toEqual([]);
      expect(result.timer).toBeNull();
    });
  });

  describe('エッジケース', () => {
    test('loadSettingsでundefinedデータを処理する', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce('undefined');
      
      const result = await repository.loadSettings();
      
      expect(result).toBeInstanceOf(Settings);
    });

    test('loadSessionsで非配列データを処理する', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ notAnArray: true }));
      
      const result = await repository.loadSessions();
      
      expect(result).toEqual([]);
    });

    test('loadTimerで非オブジェクトデータを処理する', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(null));
      
      const result = await repository.loadTimer();
      
      expect(result).toBeNull();
    });

    test('saveTimerでundefinedタイマーを処理する', async () => {
      const result = await repository.saveTimer(undefined);
      
      expect(result).toBe(true);
    });

    test('無効な設定オブジェクトを処理する', async () => {
      const invalidSettings = { toJSON: null };
      
      await expect(repository.saveSettings(invalidSettings)).rejects.toThrow();
    });
  });

  describe('エラーログ', () => {
    let consoleErrorSpy;
    let consoleLogSpy;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      if (consoleErrorSpy) consoleErrorSpy.mockRestore();
      if (consoleLogSpy) consoleLogSpy.mockRestore();
    });

    test('設定保存エラー時にログが出力される', async () => {
      await expect(repository.saveSettings(null)).rejects.toThrow();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '設定の保存に失敗しました:',
        expect.any(Error)
      );
    });

    test('セッション保存エラー時にログが出力される', async () => {
      await expect(repository.saveSessions(null)).rejects.toThrow();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'セッションの保存に失敗しました:',
        expect.any(Error)
      );
    });

    test('バージョン関連エラーログ', async () => {
      const mockAsyncStorage = require('@react-native-async-storage/async-storage');
      
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Version error'));
      
      await repository.getVersion();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'バージョンの取得に失敗しました:',
        expect.any(Error)
      );
    });
  });
});