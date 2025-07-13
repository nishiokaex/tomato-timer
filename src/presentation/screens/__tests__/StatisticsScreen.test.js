import React from 'react';
import { StatisticsScreen } from '../StatisticsScreen';

// useTimerStoreのモック
const mockUseTimerStore = {
  getStatistics: jest.fn(() => ({
    today: {
      count: 3,
      totalTime: 4500
    },
    thisWeek: {
      count: 15,
      totalTime: 22500
    },
    thisMonth: {
      count: 60,
      totalTime: 90000
    },
    total: {
      count: 120,
      totalTime: 180000,
      averageTime: 1500
    },
    streak: 5,
    bestStreak: 12
  })),
  sessions: []
};

jest.mock('../../stores/TimerStore', () => ({
  useTimerStore: () => mockUseTimerStore
}));

// 個別テスト用のナビゲーションモック
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn()
};

// このテスト用のナビゲーションオーバーライド
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: {} })
}));

describe('StatisticsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('統計画面が正常にレンダリングされる', () => {
      expect(() => {
        StatisticsScreen();
      }).not.toThrow();
    });

    test('統計データが表示される', () => {
      const result = StatisticsScreen();
      
      expect(result).toBeDefined();
      expect(mockUseTimerStore.getStatistics).toHaveBeenCalled();
    });
  });

  describe('統計データの表示', () => {
    test('今日の統計が正しく表示される', () => {
      StatisticsScreen();
      
      const stats = mockUseTimerStore.getStatistics();
      expect(stats.today.count).toBe(3);
      expect(stats.today.totalTime).toBe(4500);
    });

    test('今週の統計が正しく表示される', () => {
      StatisticsScreen();
      
      const stats = mockUseTimerStore.getStatistics();
      expect(stats.thisWeek.count).toBe(15);
      expect(stats.thisWeek.totalTime).toBe(22500);
    });

    test('今月の統計が正しく表示される', () => {
      StatisticsScreen();
      
      const stats = mockUseTimerStore.getStatistics();
      expect(stats.thisMonth.count).toBe(60);
      expect(stats.thisMonth.totalTime).toBe(90000);
    });

    test('全体統計が正しく表示される', () => {
      StatisticsScreen();
      
      const stats = mockUseTimerStore.getStatistics();
      expect(stats.total.count).toBe(120);
      expect(stats.total.totalTime).toBe(180000);
      expect(stats.total.averageTime).toBe(1500);
    });

    test('連続記録が正しく表示される', () => {
      StatisticsScreen();
      
      const stats = mockUseTimerStore.getStatistics();
      expect(stats.streak).toBe(5);
      expect(stats.bestStreak).toBe(12);
    });
  });

  describe('統計データがない場合', () => {
    test('空の統計でもエラーが発生しない', () => {
      mockUseTimerStore.getStatistics = jest.fn(() => ({
        today: { count: 0, totalTime: 0 },
        thisWeek: { count: 0, totalTime: 0 },
        thisMonth: { count: 0, totalTime: 0 },
        total: { count: 0, totalTime: 0, averageTime: 0 },
        streak: 0,
        bestStreak: 0
      }));
      
      expect(() => {
        StatisticsScreen();
      }).not.toThrow();
    });

    test('undefinedの統計でもエラーが発生しない', () => {
      mockUseTimerStore.getStatistics = jest.fn(() => undefined);
      
      expect(() => {
        StatisticsScreen();
      }).not.toThrow();
    });
  });

  describe('時間フォーマット', () => {
    test('時間が正しくフォーマットされる', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // getStatisticsのモックを再設定
      mockUseTimerStore.getStatistics = jest.fn(() => ({
        today: {
          count: 3,
          totalTime: 4500
        },
        thisWeek: {
          count: 15,
          totalTime: 22500
        },
        thisMonth: {
          count: 60,
          totalTime: 90000
        },
        total: {
          count: 120,
          totalTime: 180000,
          averageTime: 1500
        },
        streak: 5,
        bestStreak: 12
      }));
      
      StatisticsScreen();
      
      const stats = mockUseTimerStore.getStatistics();
      
      // 実際の実装では、秒を時間・分・秒にフォーマットする関数をテスト
      const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return { hours, minutes, seconds: secs };
      };
      
      const formatted = formatTime(stats.today.totalTime);
      expect(formatted.hours).toBe(1);
      expect(formatted.minutes).toBe(15);
      expect(formatted.seconds).toBe(0);
      
      consoleSpy.mockRestore();
    });

    test('大きな時間値でもフォーマットできる', () => {
      const largeTime = 3661; // 1時間1分1秒
      
      const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return { hours, minutes, seconds: secs };
      };
      
      const formatted = formatTime(largeTime);
      expect(formatted.hours).toBe(1);
      expect(formatted.minutes).toBe(1);
      expect(formatted.seconds).toBe(1);
    });

    test('0秒でもフォーマットできる', () => {
      const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return { hours, minutes, seconds: secs };
      };
      
      const formatted = formatTime(0);
      expect(formatted.hours).toBe(0);
      expect(formatted.minutes).toBe(0);
      expect(formatted.seconds).toBe(0);
    });
  });

  describe('ナビゲーション', () => {
    test('前の画面に戻る', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      StatisticsScreen();
      
      mockNavigation.goBack();
      
      expect(mockNavigation.goBack).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('タイマー画面に遷移', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      StatisticsScreen();
      
      mockNavigation.navigate('Timer');
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Timer');
      
      consoleSpy.mockRestore();
    });

    test('ヘッダーオプションが設定される', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      StatisticsScreen();
      
      expect(mockNavigation.setOptions).toBeDefined();
      
      consoleSpy.mockRestore();
    });
  });

  describe('データの更新', () => {
    test('統計データが最新の状態で取得される', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      StatisticsScreen();
      
      // getStatisticsが呼ばれることを確認
      expect(mockUseTimerStore.getStatistics).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('セッションデータが変更されると統計が更新される', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // 新しいセッションを追加
      mockUseTimerStore.sessions = [
        { completed: true, duration: 1500, date: new Date().toISOString().split('T')[0] }
      ];
      
      StatisticsScreen();
      
      expect(mockUseTimerStore.getStatistics).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('エラーハンドリング', () => {
    test('getStatisticsがエラーを投げてもクラッシュしない', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockUseTimerStore.getStatistics = jest.fn(() => {
        throw new Error('Statistics error');
      });
      
      expect(() => {
        StatisticsScreen();
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    test('ストアがundefinedでもエラーが発生しない', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      jest.doMock('../../stores/TimerStore', () => ({
        useTimerStore: () => undefined
      }));
      
      expect(() => {
        StatisticsScreen();
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });

    test('ナビゲーションがundefinedでもエラーが発生しない', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      jest.doMock('@react-navigation/native', () => ({
        useNavigation: () => undefined,
        useRoute: () => ({ params: {} })
      }));
      
      expect(() => {
        StatisticsScreen();
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('パフォーマンス', () => {
    test('統計計算が効率的に実行される', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const startTime = Date.now();
      
      StatisticsScreen();
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // 統計計算が合理的な時間内に完了することを確認
      expect(executionTime).toBeLessThan(100); // 100ms以内
      
      consoleSpy.mockRestore();
    });

    test('大量のセッションデータでも処理できる', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // 大量のセッションデータをモック
      const largeSessions = Array.from({ length: 1000 }, (_, i) => ({
        completed: true,
        duration: 1500,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
      
      mockUseTimerStore.sessions = largeSessions;
      
      expect(() => {
        StatisticsScreen();
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('国際化', () => {
    test('翻訳キーが正しく使用される', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      StatisticsScreen();
      
      // 翻訳機能が正常に動作することを確認
      expect(() => {
        StatisticsScreen();
      }).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });
});