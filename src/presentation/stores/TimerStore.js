import { create } from 'zustand';
import { Timer, TimerType, TimerStatus } from '../../domain/entities/Timer';
import { Settings } from '../../domain/entities/Settings';
import { PomodoroSession } from '../../domain/entities/PomodoroSession';
import { getNotificationService } from '../../infrastructure/services/NotificationService';
import { getStorageService } from '../../infrastructure/services/StorageService';

class TimerStore {
  constructor(set, get) {
    this.set = set;
    this.get = get;
    this.intervalId = null;
    this.notificationService = getNotificationService();
    this.storageService = getStorageService();
    
    // メソッドをバインド
    this.startTimer = this.startTimer.bind(this);
    this.pauseTimer = this.pauseTimer.bind(this);
    this.resumeTimer = this.resumeTimer.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.createTimer = this.createTimer.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.addSession = this.addSession.bind(this);
    this.getStatistics = this.getStatistics.bind(this);
    this.loadData = this.loadData.bind(this);
    this.saveData = this.saveData.bind(this);
    this.setError = this.setError.bind(this);
    this.clearError = this.clearError.bind(this);
    this.startInterval = this.startInterval.bind(this);
    this.stopInterval = this.stopInterval.bind(this);
    this.onTimerComplete = this.onTimerComplete.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  // タイマー関連メソッド
  createTimer(type = TimerType.POMODORO) {
    const { settings } = this.get();
    let duration;
    
    switch (type) {
      case TimerType.POMODORO:
        duration = settings.pomodoroLength;
        break;
      case TimerType.SHORT_BREAK:
        duration = settings.shortBreakLength;
        break;
      case TimerType.LONG_BREAK:
        duration = settings.longBreakLength;
        break;
      default:
        duration = settings.pomodoroLength;
    }
    
    const timer = new Timer(type, duration);
    
    this.set({ currentTimer: timer });
    return timer;
  }


  startTimer() {
    const { currentTimer } = this.get();
    if (!currentTimer || typeof currentTimer.start !== 'function') return false;
    
    if (currentTimer.start()) {
      this.set({ currentTimer: currentTimer });
      this.startInterval();
      return true;
    }
    return false;
  }

  pauseTimer() {
    const { currentTimer } = this.get();
    if (!currentTimer || typeof currentTimer.pause !== 'function') return false;
    
    if (currentTimer.pause()) {
      this.set({ currentTimer: currentTimer });
      this.stopInterval();
      return true;
    }
    return false;
  }

  resumeTimer() {
    const { currentTimer } = this.get();
    if (!currentTimer || typeof currentTimer.start !== 'function') return false;
    
    if (currentTimer.start()) {
      this.set({ currentTimer: currentTimer });
      this.startInterval();
      return true;
    }
    return false;
  }

  resetTimer() {
    const { currentTimer } = this.get();
    if (!currentTimer || typeof currentTimer.reset !== 'function') return false;
    
    if (currentTimer.reset()) {
      this.set({ currentTimer: currentTimer });
      this.stopInterval();
      return true;
    }
    return false;
  }

  stopTimer() {
    const { currentTimer } = this.get();
    if (currentTimer) {
      this.stopInterval();
      this.set({ currentTimer: null });
    }
    return true;
  }

  // インターバル管理
  startInterval() {
    this.stopInterval();
    this.intervalId = setInterval(() => {
      const { currentTimer } = this.get();
      if (currentTimer && currentTimer.status === TimerStatus.RUNNING && typeof currentTimer.tick === 'function') {
        const completed = currentTimer.tick();
        
        if (completed) {
          this.onTimerComplete();
        } else {
          this.set({ currentTimer: currentTimer });
        }
      }
    }, 1000);
  }

  stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async onTimerComplete() {
    const { currentTimer, settings } = this.get();
    if (!currentTimer) return;
    
    // ポモドーロが完了した場合はセッションを記録
    if (currentTimer.type === TimerType.POMODORO) {
      const session = new PomodoroSession({
        startTime: currentTimer.startTime,
        duration: currentTimer.duration,
        type: currentTimer.type,
        completed: true
      });
      this.addSession(session);
    }
    
    // 通知の表示
    try {
      await this.notificationService.showCompleteNotification(
        currentTimer.type, 
        settings, 
        (key) => key // 簡易的な翻訳関数（実際の実装では i18next を使用）
      );
    } catch (error) {
      console.error('通知の表示に失敗しました:', error);
    }
    
    // データの保存
    await this.saveData();
    
    this.stopInterval();
  }

  // 設定管理
  updateSettings(newSettings) {
    const { settings } = this.get();
    const updatedSettings = new Settings({ ...settings.toJSON(), ...newSettings });
    this.set({ settings: updatedSettings });
    return true;
  }

  // セッション管理
  addSession(session) {
    const { sessions } = this.get();
    this.set({ sessions: [...sessions, session] });
    return true;
  }

  // 統計情報
  getStatistics() {
    const { sessions } = this.get();
    const completedSessions = sessions.filter(s => s.completed);
    
    const today = completedSessions.filter(s => s.isToday());
    const thisWeek = completedSessions.filter(s => s.isThisWeek());
    const thisMonth = completedSessions.filter(s => s.isThisMonth());
    
    const totalTime = completedSessions.reduce((sum, session) => {
      return sum + (session.actualDuration || session.duration);
    }, 0);
    
    const averageTime = completedSessions.length > 0 ? totalTime / completedSessions.length : 0;
    
    // 連続記録の計算
    const streak = this.calculateStreak(completedSessions);
    const bestStreak = this.calculateBestStreak(completedSessions);
    
    return {
      today: {
        count: today.length,
        totalTime: today.reduce((sum, session) => sum + (session.actualDuration || session.duration), 0)
      },
      thisWeek: {
        count: thisWeek.length,
        totalTime: thisWeek.reduce((sum, session) => sum + (session.actualDuration || session.duration), 0)
      },
      thisMonth: {
        count: thisMonth.length,
        totalTime: thisMonth.reduce((sum, session) => sum + (session.actualDuration || session.duration), 0)
      },
      total: {
        count: completedSessions.length,
        totalTime,
        averageTime
      },
      streak,
      bestStreak
    };
  }

  calculateStreak(sessions) {
    if (sessions.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const sortedSessions = sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let streak = 0;
    let currentDate = today;
    
    for (const session of sortedSessions) {
      if (session.date === currentDate) {
        streak++;
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        currentDate = prevDate.toISOString().split('T')[0];
      } else {
        break;
      }
    }
    
    return streak;
  }

  calculateBestStreak(sessions) {
    if (sessions.length === 0) return 0;
    
    const dateGroups = {};
    sessions.forEach(session => {
      if (!dateGroups[session.date]) {
        dateGroups[session.date] = [];
      }
      dateGroups[session.date].push(session);
    });
    
    const dates = Object.keys(dateGroups).sort();
    let bestStreak = 0;
    let currentStreak = 0;
    
    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(dates[i - 1]);
        const currentDate = new Date(dates[i]);
        const dayDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          bestStreak = Math.max(bestStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    
    return Math.max(bestStreak, currentStreak);
  }

  // データ管理
  async loadData() {
    this.set({ isLoading: true, error: null });
    try {
      const data = await this.storageService.loadAll();
      
      // データが正しいクラスのインスタンスになるように変換
      const settings = data.settings instanceof Settings ? data.settings : new Settings(data.settings);
      const sessions = data.sessions.map(session => 
        session instanceof PomodoroSession ? session : PomodoroSession.fromJSON(session)
      );
      const currentTimer = data.timer instanceof Timer ? data.timer : (data.timer ? Timer.fromJSON(data.timer) : null);
      
      this.set({
        settings,
        sessions,
        currentTimer,
        isLoading: false
      });
      return true;
    } catch (error) {
      this.set({ isLoading: false, error: error.message });
      return false;
    }
  }

  async saveData() {
    try {
      const { settings, sessions, currentTimer } = this.get();
      await this.storageService.saveAll(settings, sessions, currentTimer);
      return true;
    } catch (error) {
      this.setError(error.message);
      return false;
    }
  }

  // エラー管理
  setError(error) {
    this.set({ error });
  }

  clearError() {
    this.set({ error: null });
  }

  // クリーンアップ
  cleanup() {
    if (this.stopInterval && typeof this.stopInterval === 'function') {
      this.stopInterval();
    }
  }
}

export const useTimerStore = create((set, get) => {
  const store = new TimerStore(set, get);
  
  return {
    // 状態
    currentTimer: null,
    settings: new Settings(),
    sessions: [],
    isLoading: false,
    error: null,
    
    // メソッド
    createTimer: store.createTimer,
    startTimer: store.startTimer,
    pauseTimer: store.pauseTimer,
    resumeTimer: store.resumeTimer,
    resetTimer: store.resetTimer,
    stopTimer: store.stopTimer,
    updateSettings: store.updateSettings,
    addSession: store.addSession,
    getStatistics: store.getStatistics,
    loadData: store.loadData,
    saveData: store.saveData,
    setError: store.setError,
    clearError: store.clearError,
    cleanup: store.cleanup
  };
});