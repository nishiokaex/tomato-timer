import { AsyncStorageRepository } from '../repositories/AsyncStorageRepository';

export class StorageService {
  constructor(repository = new AsyncStorageRepository()) {
    this.repository = repository;
  }

  async initialize() {
    try {
      await this.repository.initializeStorage();
      return true;
    } catch (error) {
      console.error('ストレージサービスの初期化に失敗しました:', error);
      throw error;
    }
  }

  async saveSettings(settings) {
    try {
      return await this.repository.saveSettings(settings);
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      throw error;
    }
  }

  async loadSettings() {
    try {
      return await this.repository.loadSettings();
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
      throw error;
    }
  }

  async saveSessions(sessions) {
    try {
      return await this.repository.saveSessions(sessions);
    } catch (error) {
      console.error('セッションの保存に失敗しました:', error);
      throw error;
    }
  }

  async loadSessions() {
    try {
      return await this.repository.loadSessions();
    } catch (error) {
      console.error('セッションの読み込みに失敗しました:', error);
      throw error;
    }
  }

  async saveTimer(timer) {
    try {
      return await this.repository.saveTimer(timer);
    } catch (error) {
      console.error('タイマーの保存に失敗しました:', error);
      throw error;
    }
  }

  async loadTimer() {
    try {
      return await this.repository.loadTimer();
    } catch (error) {
      console.error('タイマーの読み込みに失敗しました:', error);
      throw error;
    }
  }

  async saveAll(settings, sessions, timer) {
    try {
      return await this.repository.saveAll(settings, sessions, timer);
    } catch (error) {
      console.error('全データの保存に失敗しました:', error);
      throw error;
    }
  }

  async loadAll() {
    try {
      return await this.repository.loadAll();
    } catch (error) {
      console.error('全データの読み込みに失敗しました:', error);
      throw error;
    }
  }

  async clearAll() {
    try {
      return await this.repository.clearAll();
    } catch (error) {
      console.error('全データの削除に失敗しました:', error);
      throw error;
    }
  }

  async exportData() {
    try {
      const data = await this.loadAll();
      return {
        settings: data.settings.toJSON(),
        sessions: data.sessions.map(session => session.toJSON()),
        timer: data.timer ? data.timer.toJSON() : null,
        exportedAt: new Date().toISOString(),
        version: 1
      };
    } catch (error) {
      console.error('データのエクスポートに失敗しました:', error);
      throw error;
    }
  }

  async importData(importedData) {
    try {
      if (!importedData || !importedData.version) {
        throw new Error('無効なデータ形式です');
      }

      // バージョンチェック
      if (importedData.version > 1) {
        throw new Error('サポートされていないデータバージョンです');
      }

      // データの復元
      const { settings, sessions, timer } = importedData;
      
      if (settings) {
        await this.saveSettings(settings);
      }
      
      if (sessions && Array.isArray(sessions)) {
        await this.saveSessions(sessions);
      }
      
      if (timer) {
        await this.saveTimer(timer);
      }

      return true;
    } catch (error) {
      console.error('データのインポートに失敗しました:', error);
      throw error;
    }
  }
}

// シングルトンインスタンス
let storageServiceInstance = null;

export const getStorageService = () => {
  if (!storageServiceInstance) {
    storageServiceInstance = new StorageService();
  }
  return storageServiceInstance;
};