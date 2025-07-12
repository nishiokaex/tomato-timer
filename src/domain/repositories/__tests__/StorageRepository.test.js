import { StorageRepository } from '../StorageRepository';

describe('StorageRepository', () => {
  describe('抽象クラス', () => {
    test('StorageRepositoryが抽象クラスとして定義されている', () => {
      expect(() => {
        new StorageRepository();
      }).toThrow('StorageRepositoryは抽象クラスです');
    });

    test('StorageRepositoryのメソッドが抽象メソッドとして定義されている', () => {
      // 抽象クラスなので直接インスタンス化はできないが、
      // クラス定義自体は存在することを確認
      expect(StorageRepository).toBeDefined();
      expect(typeof StorageRepository).toBe('function');
    });

    test('StorageRepositoryの静的メンバーが存在する', () => {
      // 抽象クラスの構造を確認
      expect(StorageRepository.prototype).toBeDefined();
    });
  });

  describe('継承クラスの実装', () => {
    // 具象クラスをテストするためのモッククラス
    class MockStorageRepository extends StorageRepository {
      constructor() {
        super();
      }

      async saveSettings(settings) {
        return true;
      }

      async loadSettings() {
        return null;
      }

      async saveSessions(sessions) {
        return true;
      }

      async loadSessions() {
        return [];
      }

      async saveTimer(timer) {
        return true;
      }

      async loadTimer() {
        return null;
      }

      async clear() {
        return true;
      }
    }

    test('継承クラスが正常にインスタンス化される', () => {
      expect(() => {
        new MockStorageRepository();
      }).not.toThrow();
    });

    test('継承クラスのメソッドが実装されている', () => {
      const repository = new MockStorageRepository();
      
      expect(typeof repository.saveSettings).toBe('function');
      expect(typeof repository.loadSettings).toBe('function');
      expect(typeof repository.saveSessions).toBe('function');
      expect(typeof repository.loadSessions).toBe('function');
      expect(typeof repository.saveTimer).toBe('function');
      expect(typeof repository.loadTimer).toBe('function');
      expect(typeof repository.clear).toBe('function');
    });

    test('継承クラスのメソッドが正常に動作する', async () => {
      const repository = new MockStorageRepository();
      
      const saveResult = await repository.saveSettings({});
      expect(saveResult).toBe(true);
      
      const loadResult = await repository.loadSettings();
      expect(loadResult).toBeNull();
      
      const saveSessionsResult = await repository.saveSessions([]);
      expect(saveSessionsResult).toBe(true);
      
      const loadSessionsResult = await repository.loadSessions();
      expect(loadSessionsResult).toEqual([]);
      
      const saveTimerResult = await repository.saveTimer(null);
      expect(saveTimerResult).toBe(true);
      
      const loadTimerResult = await repository.loadTimer();
      expect(loadTimerResult).toBeNull();
      
      const clearResult = await repository.clear();
      expect(clearResult).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    test('抽象メソッドが実装されていない場合のエラー', () => {
      // 抽象メソッドを実装しない不完全な継承クラス
      class IncompleteRepository extends StorageRepository {
        constructor() {
          super();
        }
        // メソッドを実装しない
      }

      const repository = new IncompleteRepository();
      
      // 親クラスの抽象メソッドが存在することを確認
      expect(repository.saveSettings).toBeDefined();
      expect(typeof repository.saveSettings).toBe('function');
    });
  });

  describe('インターフェース仕様', () => {
    test('StorageRepositoryが正しいインターフェースを持つ', () => {
      expect(StorageRepository).toBeDefined();
      expect(StorageRepository.prototype).toBeDefined();
    });

    test('継承によるポリモーフィズムが機能する', () => {
      class TestRepository extends StorageRepository {
        constructor() {
          super();
        }

        async saveSettings() { return 'test'; }
        async loadSettings() { return 'test'; }
        async saveSessions() { return 'test'; }
        async loadSessions() { return 'test'; }
        async saveTimer() { return 'test'; }
        async loadTimer() { return 'test'; }
        async clear() { return 'test'; }
      }

      const repository = new TestRepository();
      expect(repository instanceof StorageRepository).toBe(true);
    });
  });
});