import { Timer, TimerType, TimerStatus } from '../Timer';

describe('Timer', () => {
  describe('コンストラクタ', () => {
    test('デフォルト値でインスタンスが作成される', () => {
      const timer = new Timer();
      
      expect(timer.type).toBe(TimerType.POMODORO);
      expect(timer.duration).toBe(25 * 60);
      expect(timer.remainingTime).toBe(25 * 60);
      expect(timer.status).toBe(TimerStatus.IDLE);
      expect(timer.startTime).toBeNull();
      expect(timer.completedAt).toBeNull();
      expect(timer.version).toBe(1);
      expect(timer.id).toMatch(/^timer_\d+_[a-z0-9]+$/);
    });

    test('カスタム値でインスタンスが作成される', () => {
      const timer = new Timer(TimerType.SHORT_BREAK, 5 * 60, 2);
      
      expect(timer.type).toBe(TimerType.SHORT_BREAK);
      expect(timer.duration).toBe(5 * 60);
      expect(timer.remainingTime).toBe(5 * 60);
      expect(timer.version).toBe(2);
    });
  });

  describe('start()', () => {
    test('IDLE状態からstart()でRUNNING状態になる', () => {
      const timer = new Timer();
      const result = timer.start();
      
      expect(result).toBe(true);
      expect(timer.status).toBe(TimerStatus.RUNNING);
      expect(timer.startTime).toBeCloseTo(Date.now(), -1);
    });

    test('PAUSED状態からstart()でRUNNING状態になる', () => {
      const timer = new Timer();
      timer.start();
      timer.pause();
      
      const result = timer.start();
      
      expect(result).toBe(true);
      expect(timer.status).toBe(TimerStatus.RUNNING);
    });

    test('RUNNING状態でstart()が失敗する', () => {
      const timer = new Timer();
      timer.start();
      
      const result = timer.start();
      
      expect(result).toBe(false);
      expect(timer.status).toBe(TimerStatus.RUNNING);
    });

    test('COMPLETED状態でstart()が失敗する', () => {
      const timer = new Timer();
      timer.complete();
      
      const result = timer.start();
      
      expect(result).toBe(false);
      expect(timer.status).toBe(TimerStatus.COMPLETED);
    });
  });

  describe('pause()', () => {
    test('RUNNING状態からpause()でPAUSED状態になる', () => {
      const timer = new Timer();
      timer.start();
      
      const result = timer.pause();
      
      expect(result).toBe(true);
      expect(timer.status).toBe(TimerStatus.PAUSED);
    });

    test('IDLE状態でpause()が失敗する', () => {
      const timer = new Timer();
      
      const result = timer.pause();
      
      expect(result).toBe(false);
      expect(timer.status).toBe(TimerStatus.IDLE);
    });

    test('PAUSED状態でpause()が失敗する', () => {
      const timer = new Timer();
      timer.start();
      timer.pause();
      
      const result = timer.pause();
      
      expect(result).toBe(false);
      expect(timer.status).toBe(TimerStatus.PAUSED);
    });
  });

  describe('reset()', () => {
    test('reset()で初期状態に戻る', () => {
      const timer = new Timer(TimerType.POMODORO, 1500);
      timer.start();
      timer.tick();
      timer.tick();
      
      const result = timer.reset();
      
      expect(result).toBe(true);
      expect(timer.status).toBe(TimerStatus.IDLE);
      expect(timer.remainingTime).toBe(1500);
      expect(timer.startTime).toBeNull();
      expect(timer.completedAt).toBeNull();
    });

    test('COMPLETED状態からreset()で初期状態に戻る', () => {
      const timer = new Timer(TimerType.POMODORO, 1);
      timer.start();
      timer.tick();
      
      expect(timer.status).toBe(TimerStatus.COMPLETED);
      
      const result = timer.reset();
      
      expect(result).toBe(true);
      expect(timer.status).toBe(TimerStatus.IDLE);
      expect(timer.remainingTime).toBe(1);
      expect(timer.completedAt).toBeNull();
    });
  });

  describe('complete()', () => {
    test('complete()でCOMPLETED状態になる', () => {
      const timer = new Timer();
      
      const result = timer.complete();
      
      expect(result).toBe(true);
      expect(timer.status).toBe(TimerStatus.COMPLETED);
      expect(timer.remainingTime).toBe(0);
      expect(timer.completedAt).toBeCloseTo(Date.now(), -1);
    });
  });

  describe('tick()', () => {
    test('RUNNING状態でtick()により残り時間が減る', () => {
      const timer = new Timer(TimerType.POMODORO, 60);
      timer.start();
      
      const result = timer.tick();
      
      expect(result).toBe(false);
      expect(timer.remainingTime).toBe(59);
      expect(timer.status).toBe(TimerStatus.RUNNING);
    });

    test('残り時間1秒でtick()によりCOMPLETED状態になる', () => {
      const timer = new Timer(TimerType.POMODORO, 1);
      timer.start();
      
      const result = timer.tick();
      
      expect(result).toBe(true);
      expect(timer.remainingTime).toBe(0);
      expect(timer.status).toBe(TimerStatus.COMPLETED);
      expect(timer.completedAt).toBeCloseTo(Date.now(), -1);
    });

    test('IDLE状態でtick()しても変化しない', () => {
      const timer = new Timer(TimerType.POMODORO, 60);
      
      const result = timer.tick();
      
      expect(result).toBe(false);
      expect(timer.remainingTime).toBe(60);
      expect(timer.status).toBe(TimerStatus.IDLE);
    });

    test('PAUSED状態でtick()しても変化しない', () => {
      const timer = new Timer(TimerType.POMODORO, 60);
      timer.start();
      timer.pause();
      
      const result = timer.tick();
      
      expect(result).toBe(false);
      expect(timer.remainingTime).toBe(60);
      expect(timer.status).toBe(TimerStatus.PAUSED);
    });

    test('remainingTimeが0でtick()しても変化しない', () => {
      const timer = new Timer(TimerType.POMODORO, 0);
      timer.start();
      
      const result = timer.tick();
      
      expect(result).toBe(false);
      expect(timer.remainingTime).toBe(0);
    });
  });

  describe('getFormattedTime()', () => {
    test('正しい時間フォーマットを返す', () => {
      const timer = new Timer(TimerType.POMODORO, 1500); // 25分
      
      const formatted = timer.getFormattedTime();
      
      expect(formatted.minutes).toBe('25');
      expect(formatted.seconds).toBe('00');
      expect(formatted.total).toBe('25:00');
    });

    test('1分30秒の時間フォーマットを返す', () => {
      const timer = new Timer(TimerType.POMODORO, 90);
      
      const formatted = timer.getFormattedTime();
      
      expect(formatted.minutes).toBe('01');
      expect(formatted.seconds).toBe('30');
      expect(formatted.total).toBe('01:30');
    });

    test('9秒の時間フォーマットを返す', () => {
      const timer = new Timer(TimerType.POMODORO, 9);
      
      const formatted = timer.getFormattedTime();
      
      expect(formatted.minutes).toBe('00');
      expect(formatted.seconds).toBe('09');
      expect(formatted.total).toBe('00:09');
    });

    test('0秒の時間フォーマットを返す', () => {
      const timer = new Timer(TimerType.POMODORO, 0);
      
      const formatted = timer.getFormattedTime();
      
      expect(formatted.minutes).toBe('00');
      expect(formatted.seconds).toBe('00');
      expect(formatted.total).toBe('00:00');
    });
  });

  describe('getProgress()', () => {
    test('開始時点で0%の進捗を返す', () => {
      const timer = new Timer(TimerType.POMODORO, 100);
      
      const progress = timer.getProgress();
      
      expect(progress).toBe(0);
    });

    test('半分経過で50%の進捗を返す', () => {
      const timer = new Timer(TimerType.POMODORO, 100);
      timer.remainingTime = 50;
      
      const progress = timer.getProgress();
      
      expect(progress).toBe(50);
    });

    test('完了時点で100%の進捗を返す', () => {
      const timer = new Timer(TimerType.POMODORO, 100);
      timer.remainingTime = 0;
      
      const progress = timer.getProgress();
      
      expect(progress).toBe(100);
    });
  });

  describe('toJSON()', () => {
    test('正しいJSON形式でエクスポートする', () => {
      const timer = new Timer(TimerType.SHORT_BREAK, 300, 2);
      timer.start();
      
      const json = timer.toJSON();
      
      expect(json).toEqual({
        id: timer.id,
        type: TimerType.SHORT_BREAK,
        duration: 300,
        remainingTime: 300,
        status: TimerStatus.RUNNING,
        startTime: timer.startTime,
        completedAt: null,
        version: 2
      });
    });
  });

  describe('fromJSON()', () => {
    test('JSON形式からTimerインスタンスを復元する', () => {
      const data = {
        id: 'test_id',
        type: TimerType.LONG_BREAK,
        duration: 900,
        remainingTime: 800,
        status: TimerStatus.PAUSED,
        startTime: 1234567890,
        completedAt: null,
        version: 3
      };
      
      const timer = Timer.fromJSON(data);
      
      expect(timer.id).toBe('test_id');
      expect(timer.type).toBe(TimerType.LONG_BREAK);
      expect(timer.duration).toBe(900);
      expect(timer.remainingTime).toBe(800);
      expect(timer.status).toBe(TimerStatus.PAUSED);
      expect(timer.startTime).toBe(1234567890);
      expect(timer.completedAt).toBeNull();
      expect(timer.version).toBe(3);
      expect(timer).toBeInstanceOf(Timer);
    });

    test('JSON形式からCompletedTimerインスタンスを復元する', () => {
      const data = {
        id: 'completed_timer',
        type: TimerType.POMODORO,
        duration: 1500,
        remainingTime: 0,
        status: TimerStatus.COMPLETED,
        startTime: 1234567890,
        completedAt: 1234569390,
        version: 1
      };
      
      const timer = Timer.fromJSON(data);
      
      expect(timer.status).toBe(TimerStatus.COMPLETED);
      expect(timer.completedAt).toBe(1234569390);
      expect(timer.remainingTime).toBe(0);
    });
  });

  describe('generateId()', () => {
    test('ユニークなIDを生成する', () => {
      const timer1 = new Timer();
      const timer2 = new Timer();
      
      expect(timer1.id).not.toBe(timer2.id);
      expect(timer1.id).toMatch(/^timer_\d+_[a-z0-9]+$/);
      expect(timer2.id).toMatch(/^timer_\d+_[a-z0-9]+$/);
    });
  });
});

describe('TimerType', () => {
  test('定数が正しく定義されている', () => {
    expect(TimerType.POMODORO).toBe('pomodoro');
    expect(TimerType.SHORT_BREAK).toBe('shortBreak');
    expect(TimerType.LONG_BREAK).toBe('longBreak');
  });
});

describe('TimerStatus', () => {
  test('定数が正しく定義されている', () => {
    expect(TimerStatus.IDLE).toBe('idle');
    expect(TimerStatus.RUNNING).toBe('running');
    expect(TimerStatus.PAUSED).toBe('paused');
    expect(TimerStatus.COMPLETED).toBe('completed');
  });
});