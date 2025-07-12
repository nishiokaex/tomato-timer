// 言語リソースの個別テスト
describe('Language Resources', () => {
  describe('Japanese (ja.json)', () => {
    test('日本語リソースファイルが正常に読み込める', () => {
      const ja = require('../ja.json');
      expect(ja).toBeDefined();
      expect(typeof ja).toBe('object');
    });

    test('基本的な翻訳キーが存在する', () => {
      const ja = require('../ja.json');
      expect(ja.timer).toBeDefined();
      expect(ja.settings).toBeDefined();
      expect(ja.statistics).toBeDefined();
      expect(ja.notifications).toBeDefined();
    });
  });

  describe('English (en.json)', () => {
    test('英語リソースファイルが正常に読み込める', () => {
      const en = require('../en.json');
      expect(en).toBeDefined();
      expect(typeof en).toBe('object');
    });

    test('基本的な翻訳キーが存在する', () => {
      const en = require('../en.json');
      expect(en.timer).toBeDefined();
      expect(en.settings).toBeDefined();
      expect(en.statistics).toBeDefined();
      expect(en.notifications).toBeDefined();
    });
  });

  describe('Chinese (zh.json)', () => {
    test('中国語リソースファイルが正常に読み込める', () => {
      const zh = require('../zh.json');
      expect(zh).toBeDefined();
      expect(typeof zh).toBe('object');
    });
  });

  describe('German (de.json)', () => {
    test('ドイツ語リソースファイルが正常に読み込める', () => {
      const de = require('../de.json');
      expect(de).toBeDefined();
      expect(typeof de).toBe('object');
    });
  });

  describe('Spanish (es.json)', () => {
    test('スペイン語リソースファイルが正常に読み込める', () => {
      const es = require('../es.json');
      expect(es).toBeDefined();
      expect(typeof es).toBe('object');
    });
  });
});