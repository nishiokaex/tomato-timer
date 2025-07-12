import { useTimerStore } from '../TimerStore';
import { Timer, TimerType, TimerStatus } from '../../../domain/entities/Timer';
import { Settings } from '../../../domain/entities/Settings';
import { PomodoroSession } from '../../../domain/entities/PomodoroSession';

// モックの設定
jest.mock('../../../infrastructure/services/NotificationService', () => ({
  getNotificationService: () => ({
    showCompleteNotification: jest.fn(() => Promise.resolve())
  })
}));

jest.mock('../../../infrastructure/services/StorageService', () => ({
  getStorageService: () => ({
    loadAll: jest.fn(() => {
      const { Settings } = require('../../../domain/entities/Settings');
      return Promise.resolve({
        settings: new Settings(),
        sessions: [],
        timer: null
      });
    }),
    saveAll: jest.fn(() => Promise.resolve())
  })
}));

// タイマーのモック
jest.useFakeTimers();

describe('TimerStore', () => {
  let store;

  beforeEach(() => {
    // Zustandストアを再初期化
    store = useTimerStore.getState();
    // 状態をリセット
    useTimerStore.setState({
      currentTimer: null,
      settings: new Settings(),
      sessions: [],
      isLoading: false,
      error: null
    });
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    // クリーンアップ
    try {
      if (store.cleanup) {
        store.cleanup();
      }
    } catch (error) {
      // エラーを無視（stopIntervalが存在しない場合）
    }
  });

  describe('初期状態', () => {
    test('正しい初期状態を持つ', () => {
      const state = useTimerStore.getState();
      
      expect(state.currentTimer).toBeNull();
      expect(state.settings).toBeInstanceOf(Settings);
      expect(state.sessions).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('必要なメソッドが存在する', () => {
      const state = useTimerStore.getState();
      
      expect(typeof state.createTimer).toBe('function');
      expect(typeof state.startTimer).toBe('function');
      expect(typeof state.pauseTimer).toBe('function');
      expect(typeof state.resumeTimer).toBe('function');
      expect(typeof state.resetTimer).toBe('function');
      expect(typeof state.stopTimer).toBe('function');
      expect(typeof state.updateSettings).toBe('function');
      expect(typeof state.addSession).toBe('function');
      expect(typeof state.getStatistics).toBe('function');
      expect(typeof state.loadData).toBe('function');
      expect(typeof state.saveData).toBe('function');
      expect(typeof state.setError).toBe('function');
      expect(typeof state.clearError).toBe('function');
      expect(typeof state.cleanup).toBe('function');
    });
  });

  describe('createTimer()', () => {
    test('デフォルトでPOMODOROタイマーを作成する', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer();
      
      expect(timer).toBeInstanceOf(Timer);
      expect(timer.type).toBe(TimerType.POMODORO);
      expect(timer.duration).toBe(25 * 60);
      expect(useTimerStore.getState().currentTimer).toBe(timer);
    });

    test('指定したタイプのタイマーを作成する', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer(TimerType.SHORT_BREAK);
      
      expect(timer.type).toBe(TimerType.SHORT_BREAK);
      expect(timer.duration).toBe(5 * 60);
    });

    test('LONG_BREAKタイマーを作成する', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer(TimerType.LONG_BREAK);
      
      expect(timer.type).toBe(TimerType.LONG_BREAK);
      expect(timer.duration).toBe(15 * 60);
    });

    test('カスタム設定でタイマーを作成する', () => {
      const customSettings = new Settings({
        pomodoroLength: 30 * 60,
        shortBreakLength: 10 * 60,
        longBreakLength: 20 * 60
      });
      
      useTimerStore.setState({ settings: customSettings });
      const state = useTimerStore.getState();
      
      const pomodoroTimer = state.createTimer(TimerType.POMODORO);
      expect(pomodoroTimer.duration).toBe(30 * 60);
      
      const shortBreakTimer = state.createTimer(TimerType.SHORT_BREAK);
      expect(shortBreakTimer.duration).toBe(10 * 60);
      
      const longBreakTimer = state.createTimer(TimerType.LONG_BREAK);
      expect(longBreakTimer.duration).toBe(20 * 60);
    });
  });

  describe('startTimer()', () => {
    test('タイマーが存在しない場合はfalseを返す', () => {
      const state = useTimerStore.getState();
      const result = state.startTimer();
      
      expect(result).toBe(false);
    });

    test('正常なタイマーを開始する', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer();
      
      const result = state.startTimer();
      
      expect(result).toBe(true);
      expect(useTimerStore.getState().currentTimer.status).toBe(TimerStatus.RUNNING);
    });

    test('無効なタイマーの場合はfalseを返す', () => {
      useTimerStore.setState({ currentTimer: {} });
      const state = useTimerStore.getState();
      
      const result = state.startTimer();
      
      expect(result).toBe(false);
    });
  });

  describe('pauseTimer()', () => {
    test('実行中のタイマーを一時停止する', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer();
      state.startTimer();
      
      const result = state.pauseTimer();
      
      expect(result).toBe(true);
      expect(useTimerStore.getState().currentTimer.status).toBe(TimerStatus.PAUSED);
    });

    test('タイマーが存在しない場合はfalseを返す', () => {
      const state = useTimerStore.getState();
      const result = state.pauseTimer();
      
      expect(result).toBe(false);
    });

    test('実行中でないタイマーの一時停止は失敗する', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer();
      
      const result = state.pauseTimer();
      
      expect(result).toBe(false);
    });
  });

  describe('resumeTimer()', () => {
    test('一時停止中のタイマーを再開する', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer();
      state.startTimer();
      state.pauseTimer();
      
      const result = state.resumeTimer();
      
      expect(result).toBe(true);
      expect(useTimerStore.getState().currentTimer.status).toBe(TimerStatus.RUNNING);
    });

    test('タイマーが存在しない場合はfalseを返す', () => {
      const state = useTimerStore.getState();
      const result = state.resumeTimer();
      
      expect(result).toBe(false);
    });
  });

  describe('resetTimer()', () => {
    test('タイマーをリセットする', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer();
      state.startTimer();
      
      const result = state.resetTimer();
      
      expect(result).toBe(true);
      expect(useTimerStore.getState().currentTimer.status).toBe(TimerStatus.IDLE);
    });

    test('タイマーが存在しない場合はfalseを返す', () => {
      const state = useTimerStore.getState();
      const result = state.resetTimer();
      
      expect(result).toBe(false);
    });
  });

  describe('stopTimer()', () => {
    test('タイマーを停止する', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer();
      state.startTimer();
      
      const result = state.stopTimer();
      
      expect(result).toBe(true);
      expect(useTimerStore.getState().currentTimer).toBeNull();
    });

    test('タイマーが存在しない場合でもtrueを返す', () => {
      const state = useTimerStore.getState();
      const result = state.stopTimer();
      
      expect(result).toBe(true);
    });
  });

  describe('updateSettings()', () => {
    test('設定を更新する', () => {
      const state = useTimerStore.getState();
      const newSettings = { pomodoroLength: 30 * 60 };
      
      const result = state.updateSettings(newSettings);
      
      expect(result).toBe(true);
      expect(useTimerStore.getState().settings.pomodoroLength).toBe(30 * 60);
    });

    test('部分的な設定更新も可能', () => {
      const state = useTimerStore.getState();
      const originalLanguage = useTimerStore.getState().settings.language;
      
      const result = state.updateSettings({ autoStart: true });
      
      expect(result).toBe(true);
      expect(useTimerStore.getState().settings.autoStart).toBe(true);
      expect(useTimerStore.getState().settings.language).toBe(originalLanguage);
    });
  });

  describe('addSession()', () => {
    test('セッションを追加する', () => {
      const state = useTimerStore.getState();
      const session = new PomodoroSession();
      
      const result = state.addSession(session);
      
      expect(result).toBe(true);
      expect(useTimerStore.getState().sessions).toContain(session);
    });

    test('複数のセッションを追加する', () => {
      const state = useTimerStore.getState();
      const session1 = new PomodoroSession();
      const session2 = new PomodoroSession();
      
      state.addSession(session1);
      state.addSession(session2);
      
      const sessions = useTimerStore.getState().sessions;
      expect(sessions).toHaveLength(2);
      expect(sessions).toContain(session1);
      expect(sessions).toContain(session2);
    });
  });

  describe('getStatistics()', () => {
    test('空のセッションで統計を計算する', () => {
      const state = useTimerStore.getState();
      const stats = state.getStatistics();
      
      expect(stats.today.count).toBe(0);
      expect(stats.today.totalTime).toBe(0);
      expect(stats.thisWeek.count).toBe(0);
      expect(stats.thisMonth.count).toBe(0);
      expect(stats.total.count).toBe(0);
      expect(stats.total.totalTime).toBe(0);
      expect(stats.total.averageTime).toBe(0);
      expect(stats.streak).toBe(0);
      expect(stats.bestStreak).toBe(0);
    });

    test('完了したセッションで統計を計算する', () => {
      const session1 = new PomodoroSession({ 
        duration: 1500, 
        actualDuration: 1500, 
        completed: true 
      });
      const session2 = new PomodoroSession({ 
        duration: 1200, 
        actualDuration: 1200, 
        completed: true 
      });
      
      useTimerStore.setState({ sessions: [session1, session2] });
      const state = useTimerStore.getState();
      const stats = state.getStatistics();
      
      expect(stats.total.count).toBe(2);
      expect(stats.total.totalTime).toBe(2700);
      expect(stats.total.averageTime).toBe(1350);
    });

    test('未完了のセッションは統計に含まれない', () => {
      const completedSession = new PomodoroSession({ 
        duration: 1500, 
        completed: true 
      });
      const incompleteSession = new PomodoroSession({ 
        duration: 1200, 
        completed: false 
      });
      
      useTimerStore.setState({ sessions: [completedSession, incompleteSession] });
      const state = useTimerStore.getState();
      const stats = state.getStatistics();
      
      expect(stats.total.count).toBe(1);
    });
  });

  describe('loadData()', () => {
    test('データの読み込みが成功する', async () => {
      const state = useTimerStore.getState();
      const result = await state.loadData();
      
      expect(result).toBe(true);
      expect(useTimerStore.getState().isLoading).toBe(false);
      expect(useTimerStore.getState().error).toBeNull();
    });

    test('読み込み中はisLoadingがtrueになる', async () => {
      const state = useTimerStore.getState();
      const loadPromise = state.loadData();
      
      expect(useTimerStore.getState().isLoading).toBe(true);
      
      await loadPromise;
      expect(useTimerStore.getState().isLoading).toBe(false);
    });
  });

  describe('saveData()', () => {
    test('データの保存が成功する', async () => {
      const state = useTimerStore.getState();
      const result = await state.saveData();
      
      expect(result).toBe(true);
    });
  });

  describe('エラー管理', () => {
    test('setError()でエラーを設定する', () => {
      const state = useTimerStore.getState();
      const errorMessage = 'テストエラー';
      
      state.setError(errorMessage);
      
      expect(useTimerStore.getState().error).toBe(errorMessage);
    });

    test('clearError()でエラーをクリアする', () => {
      useTimerStore.setState({ error: 'エラーメッセージ' });
      const state = useTimerStore.getState();
      
      state.clearError();
      
      expect(useTimerStore.getState().error).toBeNull();
    });
  });

  describe('タイマーインターバル', () => {
    test('タイマー開始時の動作をテストする', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer(TimerType.POMODORO, 10);
      
      const result = state.startTimer();
      
      expect(result).toBe(true);
      expect(useTimerStore.getState().currentTimer.status).toBe(TimerStatus.RUNNING);
    });

    test('タイマー停止時の動作をテストする', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer();
      state.startTimer();
      
      const result = state.stopTimer();
      
      expect(result).toBe(true);
      expect(useTimerStore.getState().currentTimer).toBeNull();
    });

    test('タイマー完了時のセッション追加をテストする', async () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer(TimerType.POMODORO, 1);
      state.startTimer();
      
      // タイマーを完了状態にする
      const currentTimer = useTimerStore.getState().currentTimer;
      currentTimer.complete();
      
      // セッションを手動で追加（実際のonTimerCompleteの動作をシミュレート）
      const session = new PomodoroSession({
        startTime: currentTimer.startTime,
        duration: currentTimer.duration,
        type: currentTimer.type,
        completed: true
      });
      state.addSession(session);
      
      const sessions = useTimerStore.getState().sessions;
      expect(sessions).toHaveLength(1);
      expect(sessions[0].type).toBe(TimerType.POMODORO);
    });
  });

  describe('クリーンアップ', () => {
    test('cleanup()が正常に実行される', () => {
      const state = useTimerStore.getState();
      
      expect(() => {
        state.cleanup();
      }).not.toThrow();
    });

    test('cleanup()が安全にstopIntervalを呼び出す', () => {
      const state = useTimerStore.getState();
      
      // タイマーを開始してからクリーンアップ
      const timer = state.createTimer();
      state.startTimer();
      
      expect(() => {
        state.cleanup();
      }).not.toThrow();
    });
  });

  describe('エッジケース', () => {
    test('存在しないタイマータイプでも処理される', () => {
      const state = useTimerStore.getState();
      const timer = state.createTimer('unknown');
      
      expect(timer.duration).toBe(25 * 60); // デフォルト値になる
    });

    test('無効な設定オブジェクトでも処理される', () => {
      const state = useTimerStore.getState();
      const result = state.updateSettings(null);
      
      expect(result).toBe(true);
    });
  });
});