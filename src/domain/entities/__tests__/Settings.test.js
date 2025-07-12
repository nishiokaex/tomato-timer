import { Settings, DEFAULT_SETTINGS } from '../Settings';

describe('Settings', () => {
  describe('コンストラクタ', () => {
    test('デフォルト設定でインスタンスが作成される', () => {
      const settings = new Settings();
      
      expect(settings.pomodoroLength).toBe(25 * 60);
      expect(settings.shortBreakLength).toBe(5 * 60);
      expect(settings.longBreakLength).toBe(15 * 60);
      expect(settings.language).toBe('ja');
      expect(settings.notifications.enabled).toBe(true);
      expect(settings.notifications.sound).toBe(true);
      expect(settings.notifications.vibration).toBe(true);
      expect(settings.autoStart).toBe(false);
      expect(settings.version).toBe(1);
    });

    test('カスタム設定でインスタンスが作成される', () => {
      const customData = {
        pomodoroLength: 30 * 60,
        shortBreakLength: 10 * 60,
        longBreakLength: 20 * 60,
        language: 'en',
        notifications: {
          enabled: false,
          sound: false
        },
        autoStart: true,
        version: 2
      };
      
      const settings = new Settings(customData);
      
      expect(settings.pomodoroLength).toBe(30 * 60);
      expect(settings.shortBreakLength).toBe(10 * 60);
      expect(settings.longBreakLength).toBe(20 * 60);
      expect(settings.language).toBe('en');
      expect(settings.notifications.enabled).toBe(false);
      expect(settings.notifications.sound).toBe(false);
      expect(settings.notifications.vibration).toBe(true); // デフォルト値
      expect(settings.autoStart).toBe(true);
      expect(settings.version).toBe(2);
    });

    test('部分的なカスタム設定でもデフォルト値が適用される', () => {
      const partialData = {
        pomodoroLength: 30 * 60,
        language: 'en'
      };
      
      const settings = new Settings(partialData);
      
      expect(settings.pomodoroLength).toBe(30 * 60);
      expect(settings.language).toBe('en');
      expect(settings.shortBreakLength).toBe(5 * 60); // デフォルト値
      expect(settings.autoStart).toBe(false); // デフォルト値
    });
  });

  describe('updatePomodoroLength()', () => {
    test('有効な値でポモドーロ時間を更新する', () => {
      const settings = new Settings();
      const result = settings.updatePomodoroLength(30 * 60);
      
      expect(result).toBe(true);
      expect(settings.pomodoroLength).toBe(30 * 60);
    });

    test('0以下の値は拒否される', () => {
      const settings = new Settings();
      const originalLength = settings.pomodoroLength;
      
      const result = settings.updatePomodoroLength(0);
      
      expect(result).toBe(false);
      expect(settings.pomodoroLength).toBe(originalLength);
    });

    test('負の値は拒否される', () => {
      const settings = new Settings();
      const originalLength = settings.pomodoroLength;
      
      const result = settings.updatePomodoroLength(-10);
      
      expect(result).toBe(false);
      expect(settings.pomodoroLength).toBe(originalLength);
    });

    test('60分を超える値は拒否される', () => {
      const settings = new Settings();
      const originalLength = settings.pomodoroLength;
      
      const result = settings.updatePomodoroLength(61 * 60);
      
      expect(result).toBe(false);
      expect(settings.pomodoroLength).toBe(originalLength);
    });

    test('60分ちょうどは許可される', () => {
      const settings = new Settings();
      const result = settings.updatePomodoroLength(60 * 60);
      
      expect(result).toBe(true);
      expect(settings.pomodoroLength).toBe(60 * 60);
    });
  });

  describe('updateShortBreakLength()', () => {
    test('有効な値で短い休憩時間を更新する', () => {
      const settings = new Settings();
      const result = settings.updateShortBreakLength(10 * 60);
      
      expect(result).toBe(true);
      expect(settings.shortBreakLength).toBe(10 * 60);
    });

    test('0以下の値は拒否される', () => {
      const settings = new Settings();
      const originalLength = settings.shortBreakLength;
      
      const result = settings.updateShortBreakLength(0);
      
      expect(result).toBe(false);
      expect(settings.shortBreakLength).toBe(originalLength);
    });

    test('30分を超える値は拒否される', () => {
      const settings = new Settings();
      const originalLength = settings.shortBreakLength;
      
      const result = settings.updateShortBreakLength(31 * 60);
      
      expect(result).toBe(false);
      expect(settings.shortBreakLength).toBe(originalLength);
    });

    test('30分ちょうどは許可される', () => {
      const settings = new Settings();
      const result = settings.updateShortBreakLength(30 * 60);
      
      expect(result).toBe(true);
      expect(settings.shortBreakLength).toBe(30 * 60);
    });
  });

  describe('updateLongBreakLength()', () => {
    test('有効な値で長い休憩時間を更新する', () => {
      const settings = new Settings();
      const result = settings.updateLongBreakLength(20 * 60);
      
      expect(result).toBe(true);
      expect(settings.longBreakLength).toBe(20 * 60);
    });

    test('0以下の値は拒否される', () => {
      const settings = new Settings();
      const originalLength = settings.longBreakLength;
      
      const result = settings.updateLongBreakLength(0);
      
      expect(result).toBe(false);
      expect(settings.longBreakLength).toBe(originalLength);
    });

    test('60分を超える値は拒否される', () => {
      const settings = new Settings();
      const originalLength = settings.longBreakLength;
      
      const result = settings.updateLongBreakLength(61 * 60);
      
      expect(result).toBe(false);
      expect(settings.longBreakLength).toBe(originalLength);
    });
  });

  describe('updateLanguage()', () => {
    test('サポートされた言語で更新する', () => {
      const settings = new Settings();
      
      expect(settings.updateLanguage('en')).toBe(true);
      expect(settings.language).toBe('en');
      
      expect(settings.updateLanguage('zh')).toBe(true);
      expect(settings.language).toBe('zh');
      
      expect(settings.updateLanguage('de')).toBe(true);
      expect(settings.language).toBe('de');
      
      expect(settings.updateLanguage('es')).toBe(true);
      expect(settings.language).toBe('es');
      
      expect(settings.updateLanguage('ja')).toBe(true);
      expect(settings.language).toBe('ja');
    });

    test('サポートされていない言語は拒否される', () => {
      const settings = new Settings();
      const originalLanguage = settings.language;
      
      const result = settings.updateLanguage('fr');
      
      expect(result).toBe(false);
      expect(settings.language).toBe(originalLanguage);
    });

    test('空文字は拒否される', () => {
      const settings = new Settings();
      const originalLanguage = settings.language;
      
      const result = settings.updateLanguage('');
      
      expect(result).toBe(false);
      expect(settings.language).toBe(originalLanguage);
    });
  });

  describe('updateNotifications()', () => {
    test('通知設定を部分的に更新する', () => {
      const settings = new Settings();
      const result = settings.updateNotifications({ enabled: false });
      
      expect(result).toBe(true);
      expect(settings.notifications.enabled).toBe(false);
      expect(settings.notifications.sound).toBe(true); // 他の設定は保持される
      expect(settings.notifications.vibration).toBe(true);
    });

    test('複数の通知設定を同時に更新する', () => {
      const settings = new Settings();
      const result = settings.updateNotifications({ 
        enabled: false, 
        sound: false 
      });
      
      expect(result).toBe(true);
      expect(settings.notifications.enabled).toBe(false);
      expect(settings.notifications.sound).toBe(false);
      expect(settings.notifications.vibration).toBe(true); // 未指定は保持される
    });

    test('空のオブジェクトでも成功する', () => {
      const settings = new Settings();
      const originalNotifications = { ...settings.notifications };
      
      const result = settings.updateNotifications({});
      
      expect(result).toBe(true);
      expect(settings.notifications).toEqual(originalNotifications);
    });
  });

  describe('updateAutoStart()', () => {
    test('autoStartをtrueに設定する', () => {
      const settings = new Settings();
      const result = settings.updateAutoStart(true);
      
      expect(result).toBe(true);
      expect(settings.autoStart).toBe(true);
    });

    test('autoStartをfalseに設定する', () => {
      const settings = new Settings({ autoStart: true });
      const result = settings.updateAutoStart(false);
      
      expect(result).toBe(true);
      expect(settings.autoStart).toBe(false);
    });

    test('文字列"true"もtrueとして扱われる', () => {
      const settings = new Settings();
      const result = settings.updateAutoStart('true');
      
      expect(result).toBe(true);
      expect(settings.autoStart).toBe(true);
    });

    test('0はfalseとして扱われる', () => {
      const settings = new Settings({ autoStart: true });
      const result = settings.updateAutoStart(0);
      
      expect(result).toBe(true);
      expect(settings.autoStart).toBe(false);
    });

    test('1はtrueとして扱われる', () => {
      const settings = new Settings();
      const result = settings.updateAutoStart(1);
      
      expect(result).toBe(true);
      expect(settings.autoStart).toBe(true);
    });
  });

  describe('reset()', () => {
    test('すべての設定をデフォルトに戻す', () => {
      const settings = new Settings({
        pomodoroLength: 30 * 60,
        language: 'en',
        autoStart: true,
        notifications: { enabled: false }
      });
      
      const result = settings.reset();
      
      expect(result).toBe(true);
      expect(settings.pomodoroLength).toBe(DEFAULT_SETTINGS.pomodoroLength);
      expect(settings.shortBreakLength).toBe(DEFAULT_SETTINGS.shortBreakLength);
      expect(settings.longBreakLength).toBe(DEFAULT_SETTINGS.longBreakLength);
      expect(settings.language).toBe(DEFAULT_SETTINGS.language);
      expect(settings.notifications).toEqual(DEFAULT_SETTINGS.notifications);
      expect(settings.autoStart).toBe(DEFAULT_SETTINGS.autoStart);
      expect(settings.version).toBe(DEFAULT_SETTINGS.version);
    });
  });

  describe('toJSON()', () => {
    test('JSON形式で設定をエクスポートする', () => {
      const settings = new Settings({
        pomodoroLength: 30 * 60,
        language: 'en',
        autoStart: true
      });
      
      const json = settings.toJSON();
      
      expect(json).toEqual({
        pomodoroLength: 30 * 60,
        shortBreakLength: 5 * 60,
        longBreakLength: 15 * 60,
        language: 'en',
        notifications: DEFAULT_SETTINGS.notifications,
        autoStart: true,
        version: 1
      });
    });

    test('JSONオブジェクトにはメソッドが含まれない', () => {
      const settings = new Settings();
      const json = settings.toJSON();
      
      expect(typeof json.updatePomodoroLength).toBe('undefined');
      expect(typeof json.reset).toBe('undefined');
      expect(typeof json.toJSON).toBe('undefined');
    });
  });

  describe('fromJSON()', () => {
    test('JSON形式からSettingsインスタンスを復元する', () => {
      const data = {
        pomodoroLength: 35 * 60,
        shortBreakLength: 8 * 60,
        longBreakLength: 18 * 60,
        language: 'de',
        notifications: {
          enabled: false,
          sound: true,
          vibration: false
        },
        autoStart: true,
        version: 2
      };
      
      const settings = Settings.fromJSON(data);
      
      expect(settings).toBeInstanceOf(Settings);
      expect(settings.pomodoroLength).toBe(35 * 60);
      expect(settings.shortBreakLength).toBe(8 * 60);
      expect(settings.longBreakLength).toBe(18 * 60);
      expect(settings.language).toBe('de');
      expect(settings.notifications.enabled).toBe(false);
      expect(settings.notifications.sound).toBe(true);
      expect(settings.notifications.vibration).toBe(false);
      expect(settings.autoStart).toBe(true);
      expect(settings.version).toBe(2);
    });

    test('空のオブジェクトからもインスタンスを作成できる', () => {
      const settings = Settings.fromJSON({});
      
      expect(settings).toBeInstanceOf(Settings);
      expect(settings.pomodoroLength).toBe(DEFAULT_SETTINGS.pomodoroLength);
      expect(settings.language).toBe(DEFAULT_SETTINGS.language);
    });
  });
});

describe('DEFAULT_SETTINGS', () => {
  test('デフォルト設定値が正しく定義されている', () => {
    expect(DEFAULT_SETTINGS.pomodoroLength).toBe(25 * 60);
    expect(DEFAULT_SETTINGS.shortBreakLength).toBe(5 * 60);
    expect(DEFAULT_SETTINGS.longBreakLength).toBe(15 * 60);
    expect(DEFAULT_SETTINGS.language).toBe('ja');
    expect(DEFAULT_SETTINGS.notifications.enabled).toBe(true);
    expect(DEFAULT_SETTINGS.notifications.sound).toBe(true);
    expect(DEFAULT_SETTINGS.notifications.vibration).toBe(true);
    expect(DEFAULT_SETTINGS.autoStart).toBe(false);
    expect(DEFAULT_SETTINGS.version).toBe(1);
  });
});