import { PomodoroSession } from '../PomodoroSession';

describe('PomodoroSession', () => {
  // 固定の日付でテストを実行するためのモック
  const mockDate = new Date('2023-07-15T10:30:00Z');
  const mockDateString = '2023-07-15';
  
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('コンストラクタ', () => {
    test('デフォルト値でインスタンスが作成される', () => {
      const session = new PomodoroSession();
      
      expect(session.id).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(session.startTime).toBeCloseTo(Date.now(), -1);
      expect(session.endTime).toBeNull();
      expect(session.duration).toBe(25 * 60);
      expect(session.actualDuration).toBeNull();
      expect(session.type).toBe('pomodoro');
      expect(session.completed).toBe(false);
      expect(session.date).toBe(mockDateString);
      expect(session.version).toBe(1);
    });

    test('カスタム値でインスタンスが作成される', () => {
      const customData = {
        id: 'custom_id',
        startTime: 1234567890,
        endTime: 1234569390,
        duration: 15 * 60,
        actualDuration: 14 * 60,
        type: 'shortBreak',
        completed: true,
        date: '2023-06-01',
        version: 2
      };
      
      const session = new PomodoroSession(customData);
      
      expect(session.id).toBe('custom_id');
      expect(session.startTime).toBe(1234567890);
      expect(session.endTime).toBe(1234569390);
      expect(session.duration).toBe(15 * 60);
      expect(session.actualDuration).toBe(14 * 60);
      expect(session.type).toBe('shortBreak');
      expect(session.completed).toBe(true);
      expect(session.date).toBe('2023-06-01');
      expect(session.version).toBe(2);
    });
  });

  describe('generateId()', () => {
    test('ユニークなIDを生成する', () => {
      const session1 = new PomodoroSession();
      const session2 = new PomodoroSession();
      
      expect(session1.id).not.toBe(session2.id);
      expect(session1.id).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(session2.id).toMatch(/^session_\d+_[a-z0-9]+$/);
    });
  });

  describe('complete()', () => {
    test('セッションを完了状態にする', () => {
      const startTime = Date.now() - 5000; // 5秒前
      const session = new PomodoroSession({ startTime });
      
      const result = session.complete();
      
      expect(result).toBe(true);
      expect(session.completed).toBe(true);
      expect(session.endTime).toBeCloseTo(Date.now(), -1);
      expect(session.actualDuration).toBeCloseTo(5, 0);
    });

    test('既に完了したセッションでも再度完了できる', () => {
      const session = new PomodoroSession({ completed: true });
      
      const result = session.complete();
      
      expect(result).toBe(true);
      expect(session.completed).toBe(true);
    });
  });

  describe('getFormattedDuration()', () => {
    test('実際の時間がある場合は実際の時間をフォーマットする', () => {
      const session = new PomodoroSession({
        duration: 1500,
        actualDuration: 1320 // 22分
      });
      
      const formatted = session.getFormattedDuration();
      
      expect(formatted.minutes).toBe('22');
      expect(formatted.seconds).toBe('00');
      expect(formatted.total).toBe('22:00');
    });

    test('実際の時間がない場合は予定時間をフォーマットする', () => {
      const session = new PomodoroSession({
        duration: 1500 // 25分
      });
      
      const formatted = session.getFormattedDuration();
      
      expect(formatted.minutes).toBe('25');
      expect(formatted.seconds).toBe('00');
      expect(formatted.total).toBe('25:00');
    });

    test('1分30秒をフォーマットする', () => {
      const session = new PomodoroSession({
        duration: 90,
        actualDuration: 90
      });
      
      const formatted = session.getFormattedDuration();
      
      expect(formatted.minutes).toBe('01');
      expect(formatted.seconds).toBe('30');
      expect(formatted.total).toBe('01:30');
    });

    test('59秒をフォーマットする', () => {
      const session = new PomodoroSession({
        duration: 59,
        actualDuration: 59
      });
      
      const formatted = session.getFormattedDuration();
      
      expect(formatted.minutes).toBe('00');
      expect(formatted.seconds).toBe('59');
      expect(formatted.total).toBe('00:59');
    });
  });

  describe('getDateObject()', () => {
    test('日付文字列からDateオブジェクトを取得する', () => {
      const session = new PomodoroSession({ date: '2023-06-15' });
      
      const dateObj = session.getDateObject();
      
      expect(dateObj).toBeInstanceOf(Date);
      expect(dateObj.getFullYear()).toBe(2023);
      expect(dateObj.getMonth()).toBe(5); // 0ベース（6月は5）
      expect(dateObj.getDate()).toBe(15);
    });
  });

  describe('isToday()', () => {
    test('今日のセッションはtrueを返す', () => {
      const session = new PomodoroSession({ date: mockDateString });
      
      const result = session.isToday();
      
      expect(result).toBe(true);
    });

    test('昨日のセッションはfalseを返す', () => {
      const session = new PomodoroSession({ date: '2023-07-14' });
      
      const result = session.isToday();
      
      expect(result).toBe(false);
    });

    test('明日のセッションはfalseを返す', () => {
      const session = new PomodoroSession({ date: '2023-07-16' });
      
      const result = session.isToday();
      
      expect(result).toBe(false);
    });
  });

  describe('isThisWeek()', () => {
    test('今週のセッションはtrueを返す', () => {
      // 2023-07-15は土曜日、その週の日曜日（2023-07-09）から土曜日（2023-07-15）まで
      const mondaySession = new PomodoroSession({ date: '2023-07-10' }); // 月曜日
      const fridaySession = new PomodoroSession({ date: '2023-07-14' }); // 金曜日
      const todaySession = new PomodoroSession({ date: mockDateString }); // 今日（土曜日）
      
      expect(mondaySession.isThisWeek()).toBe(true);
      expect(fridaySession.isThisWeek()).toBe(true);
      expect(todaySession.isThisWeek()).toBe(true);
    });

    test('先週のセッションはfalseを返す', () => {
      const lastWeekSession = new PomodoroSession({ date: '2023-07-08' }); // 先週の土曜日
      
      const result = lastWeekSession.isThisWeek();
      
      expect(result).toBe(false);
    });

    test('来週のセッションはfalseを返す', () => {
      const nextWeekSession = new PomodoroSession({ date: '2023-07-30' }); // 2週間後
      
      const result = nextWeekSession.isThisWeek();
      
      expect(result).toBe(false);
    });
  });

  describe('isThisMonth()', () => {
    test('今月のセッションはtrueを返す', () => {
      const session1 = new PomodoroSession({ date: '2023-07-01' }); // 月初
      const session2 = new PomodoroSession({ date: mockDateString }); // 今日
      const session3 = new PomodoroSession({ date: '2023-07-31' }); // 月末
      
      expect(session1.isThisMonth()).toBe(true);
      expect(session2.isThisMonth()).toBe(true);
      expect(session3.isThisMonth()).toBe(true);
    });

    test('先月のセッションはfalseを返す', () => {
      const lastMonthSession = new PomodoroSession({ date: '2023-06-30' });
      
      const result = lastMonthSession.isThisMonth();
      
      expect(result).toBe(false);
    });

    test('来月のセッションはfalseを返す', () => {
      const nextMonthSession = new PomodoroSession({ date: '2023-08-01' });
      
      const result = nextMonthSession.isThisMonth();
      
      expect(result).toBe(false);
    });

    test('去年の同月のセッションはfalseを返す', () => {
      const lastYearSession = new PomodoroSession({ date: '2022-07-15' });
      
      const result = lastYearSession.isThisMonth();
      
      expect(result).toBe(false);
    });
  });

  describe('toJSON()', () => {
    test('JSON形式でセッションをエクスポートする', () => {
      const session = new PomodoroSession({
        id: 'test_id',
        startTime: 1234567890,
        endTime: 1234569390,
        duration: 1500,
        actualDuration: 1400,
        type: 'shortBreak',
        completed: true,
        date: '2023-06-01',
        version: 2
      });
      
      const json = session.toJSON();
      
      expect(json).toEqual({
        id: 'test_id',
        startTime: 1234567890,
        endTime: 1234569390,
        duration: 1500,
        actualDuration: 1400,
        type: 'shortBreak',
        completed: true,
        date: '2023-06-01',
        version: 2
      });
    });

    test('JSONオブジェクトにはメソッドが含まれない', () => {
      const session = new PomodoroSession();
      const json = session.toJSON();
      
      expect(typeof json.complete).toBe('undefined');
      expect(typeof json.getFormattedDuration).toBe('undefined');
      expect(typeof json.isToday).toBe('undefined');
    });
  });

  describe('fromJSON()', () => {
    test('JSON形式からPomodoroSessionインスタンスを復元する', () => {
      const data = {
        id: 'restored_id',
        startTime: 1234567890,
        endTime: 1234569390,
        duration: 900,
        actualDuration: 850,
        type: 'longBreak',
        completed: true,
        date: '2023-05-20',
        version: 3
      };
      
      const session = PomodoroSession.fromJSON(data);
      
      expect(session).toBeInstanceOf(PomodoroSession);
      expect(session.id).toBe('restored_id');
      expect(session.startTime).toBe(1234567890);
      expect(session.endTime).toBe(1234569390);
      expect(session.duration).toBe(900);
      expect(session.actualDuration).toBe(850);
      expect(session.type).toBe('longBreak');
      expect(session.completed).toBe(true);
      expect(session.date).toBe('2023-05-20');
      expect(session.version).toBe(3);
    });

    test('空のオブジェクトからもインスタンスを作成できる', () => {
      const session = PomodoroSession.fromJSON({});
      
      expect(session).toBeInstanceOf(PomodoroSession);
      expect(session.duration).toBe(25 * 60);
      expect(session.type).toBe('pomodoro');
      expect(session.completed).toBe(false);
    });
  });

  describe('エッジケース', () => {
    test('startTimeとendTimeが同じ場合のactualDuration計算', () => {
      const time = Date.now();
      const session = new PomodoroSession({ startTime: time });
      session.endTime = time;
      session.actualDuration = Math.floor((session.endTime - session.startTime) / 1000);
      
      expect(session.actualDuration).toBe(0);
    });

    test('無効な日付文字列でもエラーが発生しない', () => {
      const session = new PomodoroSession({ date: 'invalid-date' });
      
      // getDateObject()は無効な日付でも Date オブジェクトを返す
      const dateObj = session.getDateObject();
      expect(dateObj).toBeInstanceOf(Date);
      expect(isNaN(dateObj.getTime())).toBe(true);
    });

    test('0秒のdurationでもフォーマットできる', () => {
      const session = new PomodoroSession({ duration: 0 });
      session.actualDuration = 0; // 明示的に0を設定
      
      const formatted = session.getFormattedDuration();
      
      expect(formatted.minutes).toBe('00');
      expect(formatted.seconds).toBe('00');
      expect(formatted.total).toBe('00:00');
    });
  });
});