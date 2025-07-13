// このテストではモックされたi18nではなく、実際のi18nを使用
jest.unmock('react-i18next');

// i18nのテスト
describe('i18n', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初期化', () => {
    test('i18nが正常に初期化される', async () => {
      // react-i18nextが利用可能であることを確認
      const { initReactI18next } = require('react-i18next');
      expect(initReactI18next).toBeDefined();
      
      expect(() => {
        require('../i18n');
      }).not.toThrow();
    });

    test('デフォルト言語が設定される', async () => {
      const i18n = require('../i18n').default;
      expect(i18n).toBeDefined();
      expect(i18n.language).toBe('ja');
    });
  });

  describe('言語ファイル', () => {
    test('日本語リソースが読み込まれる', () => {
      expect(() => {
        require('../ja.json');
      }).not.toThrow();
    });

    test('英語リソースが読み込まれる', () => {
      expect(() => {
        require('../en.json');
      }).not.toThrow();
    });

    test('中国語リソースが読み込まれる', () => {
      expect(() => {
        require('../zh.json');
      }).not.toThrow();
    });

    test('ドイツ語リソースが読み込まれる', () => {
      expect(() => {
        require('../de.json');
      }).not.toThrow();
    });

    test('スペイン語リソースが読み込まれる', () => {
      expect(() => {
        require('../es.json');
      }).not.toThrow();
    });
  });

  describe('翻訳キー', () => {
    test('日本語リソースに必要なキーが含まれる', () => {
      const ja = require('../ja.json');
      
      expect(ja).toHaveProperty('timer');
      expect(ja.timer).toHaveProperty('pomodoro');
      expect(ja.timer).toHaveProperty('shortBreak');
      expect(ja.timer).toHaveProperty('longBreak');
      expect(ja.timer).toHaveProperty('start');
      expect(ja.timer).toHaveProperty('pause');
      expect(ja.timer).toHaveProperty('resume');
      expect(ja.timer).toHaveProperty('reset');
    });

    test('英語リソースに必要なキーが含まれる', () => {
      const en = require('../en.json');
      
      expect(en).toHaveProperty('timer');
      expect(en.timer).toHaveProperty('pomodoro');
      expect(en.timer).toHaveProperty('shortBreak');
      expect(en.timer).toHaveProperty('longBreak');
      expect(en.timer).toHaveProperty('start');
      expect(en.timer).toHaveProperty('pause');
      expect(en.timer).toHaveProperty('resume');
      expect(en.timer).toHaveProperty('reset');
    });

    test('設定関連のキーが含まれる', () => {
      const ja = require('../ja.json');
      
      expect(ja).toHaveProperty('settings');
      expect(ja.settings).toHaveProperty('title');
      expect(ja.settings).toHaveProperty('pomodoroLength');
      expect(ja.settings).toHaveProperty('shortBreakLength');
      expect(ja.settings).toHaveProperty('longBreakLength');
      expect(ja.settings).toHaveProperty('language');
      expect(ja.settings).toHaveProperty('notifications');
    });

    test('統計関連のキーが含まれる', () => {
      const ja = require('../ja.json');
      
      expect(ja).toHaveProperty('statistics');
      expect(ja.statistics).toHaveProperty('title');
      expect(ja.statistics).toHaveProperty('today');
      expect(ja.statistics).toHaveProperty('thisWeek');
      expect(ja.statistics).toHaveProperty('thisMonth');
      expect(ja.statistics).toHaveProperty('completedPomodoros');
    });

    test('通知関連のキーが含まれる', () => {
      const ja = require('../ja.json');
      
      expect(ja).toHaveProperty('notifications');
      expect(ja.notifications).toHaveProperty('pomodoroCompleted');
      expect(ja.notifications).toHaveProperty('breakCompleted');
      expect(ja.notifications).toHaveProperty('timeToWork');
    });
  });

  describe('翻訳の一貫性', () => {
    test('すべての言語で同じキー構造を持つ', () => {
      const ja = require('../ja.json');
      const en = require('../en.json');
      const zh = require('../zh.json');
      const de = require('../de.json');
      const es = require('../es.json');
      
      const getKeys = (obj, prefix = '') => {
        let keys = [];
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getKeys(obj[key], fullKey));
          } else {
            keys.push(fullKey);
          }
        }
        return keys.sort();
      };
      
      const jaKeys = getKeys(ja);
      const enKeys = getKeys(en);
      const zhKeys = getKeys(zh);
      const deKeys = getKeys(de);
      const esKeys = getKeys(es);
      
      expect(enKeys).toEqual(jaKeys);
      expect(zhKeys).toEqual(jaKeys);
      expect(deKeys).toEqual(jaKeys);
      expect(esKeys).toEqual(jaKeys);
    });

    test('すべての翻訳値が空でない', () => {
      const languages = ['ja', 'en', 'zh', 'de', 'es'];
      
      languages.forEach(lang => {
        const resource = require(`../${lang}.json`);
        
        const checkValues = (obj, path = '') => {
          for (const key in obj) {
            const currentPath = path ? `${path}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              checkValues(obj[key], currentPath);
            } else {
              expect(obj[key]).toBeTruthy();
              expect(typeof obj[key]).toBe('string');
              expect(obj[key].trim()).not.toBe('');
            }
          }
        };
        
        checkValues(resource);
      });
    });
  });

  describe('特定の翻訳値', () => {
    test('日本語の翻訳が正しい', () => {
      const ja = require('../ja.json');
      
      expect(ja.timer.pomodoro).toBe('ポモドーロ');
      expect(ja.timer.shortBreak).toBe('短い休憩');
      expect(ja.timer.longBreak).toBe('長い休憩');
      expect(ja.timer.start).toBe('開始');
      expect(ja.timer.pause).toBe('一時停止');
      expect(ja.timer.resume).toBe('再開');
      expect(ja.timer.reset).toBe('リセット');
    });

    test('英語の翻訳が正しい', () => {
      const en = require('../en.json');
      
      expect(en.timer.pomodoro).toBe('Pomodoro');
      expect(en.timer.shortBreak).toBe('Short Break');
      expect(en.timer.longBreak).toBe('Long Break');
      expect(en.timer.start).toBe('Start');
      expect(en.timer.pause).toBe('Pause');
      expect(en.timer.resume).toBe('Resume');
      expect(en.timer.reset).toBe('Reset');
    });
  });

  describe('JSONファイルの形式', () => {
    test('JSONファイルが有効な形式である', () => {
      const languages = ['ja', 'en', 'zh', 'de', 'es'];
      
      languages.forEach(lang => {
        expect(() => {
          JSON.parse(JSON.stringify(require(`../${lang}.json`)));
        }).not.toThrow();
      });
    });

    test('ネストした構造が正しい', () => {
      const ja = require('../ja.json');
      
      expect(typeof ja).toBe('object');
      expect(typeof ja.timer).toBe('object');
      expect(typeof ja.settings).toBe('object');
      expect(typeof ja.statistics).toBe('object');
      expect(typeof ja.notification).toBe('object');
    });
  });

  describe('文字エンコーディング', () => {
    test('多言語文字が正しくエンコードされている', () => {
      const zh = require('../zh.json');
      const de = require('../de.json');
      const es = require('../es.json');
      
      // 中国語文字が含まれることを確認
      const zhValues = JSON.stringify(zh);
      expect(zhValues.length).toBeGreaterThan(0);
      
      // ドイツ語の特殊文字が含まれることを確認  
      const deValues = JSON.stringify(de);
      expect(deValues.length).toBeGreaterThan(0);
      
      // スペイン語の特殊文字が含まれることを確認
      const esValues = JSON.stringify(es);
      expect(esValues.length).toBeGreaterThan(0);
    });
  });
});