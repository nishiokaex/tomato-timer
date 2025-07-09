import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageRepository } from '../../domain/repositories/StorageRepository';
import { Settings } from '../../domain/entities/Settings';
import { PomodoroSession } from '../../domain/entities/PomodoroSession';
import { Timer } from '../../domain/entities/Timer';

export class AsyncStorageRepository extends StorageRepository {
  constructor() {
    super();
    this.STORAGE_KEYS = {
      SETTINGS: 'tomato-timer-settings',
      SESSIONS: 'tomato-timer-sessions',
      TIMER: 'tomato-timer-current-timer',
      VERSION: 'tomato-timer-version'
    };
    this.CURRENT_VERSION = 1;
  }

  async saveSettings(settings) {
    try {
      const data = JSON.stringify(settings.toJSON());
      await AsyncStorage.setItem(this.STORAGE_KEYS.SETTINGS, data);
      return true;
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      throw error;
    }
  }

  async loadSettings() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        return Settings.fromJSON(parsed);
      }
      return new Settings();
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
      return new Settings();
    }
  }

  async saveSessions(sessions) {
    try {
      const data = JSON.stringify(sessions.map(session => session.toJSON()));
      await AsyncStorage.setItem(this.STORAGE_KEYS.SESSIONS, data);
      return true;
    } catch (error) {
      console.error('セッションの保存に失敗しました:', error);
      throw error;
    }
  }

  async loadSessions() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SESSIONS);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.map(sessionData => PomodoroSession.fromJSON(sessionData));
      }
      return [];
    } catch (error) {
      console.error('セッションの読み込みに失敗しました:', error);
      return [];
    }
  }

  async saveTimer(timer) {
    try {
      if (timer) {
        const data = JSON.stringify(timer.toJSON());
        await AsyncStorage.setItem(this.STORAGE_KEYS.TIMER, data);
      } else {
        await AsyncStorage.removeItem(this.STORAGE_KEYS.TIMER);
      }
      return true;
    } catch (error) {
      console.error('タイマーの保存に失敗しました:', error);
      throw error;
    }
  }

  async loadTimer() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.TIMER);
      if (data) {
        const parsed = JSON.parse(data);
        return Timer.fromJSON(parsed);
      }
      return null;
    } catch (error) {
      console.error('タイマーの読み込みに失敗しました:', error);
      return null;
    }
  }

  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(this.STORAGE_KEYS));
      return true;
    } catch (error) {
      console.error('全データの削除に失敗しました:', error);
      throw error;
    }
  }

  async getVersion() {
    try {
      const version = await AsyncStorage.getItem(this.STORAGE_KEYS.VERSION);
      return version ? parseInt(version, 10) : 0;
    } catch (error) {
      console.error('バージョンの取得に失敗しました:', error);
      return 0;
    }
  }

  async setVersion(version) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.VERSION, version.toString());
      return true;
    } catch (error) {
      console.error('バージョンの設定に失敗しました:', error);
      throw error;
    }
  }

  async migrate(fromVersion, toVersion) {
    try {
      console.log(`データベースをバージョン ${fromVersion} から ${toVersion} にマイグレーションしています...`);
      
      // 現在はマイグレーションは不要（バージョン1のみ）
      // 将来的にデータ構造が変更された場合はここで処理
      
      if (fromVersion < 1 && toVersion >= 1) {
        // 初期バージョンのマイグレーション
        console.log('初期バージョンのマイグレーションを実行中...');
        // 必要に応じてデータの変換処理を実装
      }
      
      await this.setVersion(toVersion);
      console.log(`マイグレーションが完了しました。現在のバージョン: ${toVersion}`);
      return true;
    } catch (error) {
      console.error('マイグレーションに失敗しました:', error);
      throw error;
    }
  }

  async initializeStorage() {
    try {
      const currentVersion = await this.getVersion();
      
      if (currentVersion < this.CURRENT_VERSION) {
        await this.migrate(currentVersion, this.CURRENT_VERSION);
      }
      
      return true;
    } catch (error) {
      console.error('ストレージの初期化に失敗しました:', error);
      throw error;
    }
  }

  // バッチ操作
  async saveAll(settings, sessions, timer) {
    try {
      const operations = [
        ['settings', settings ? JSON.stringify(settings.toJSON()) : null],
        ['sessions', sessions ? JSON.stringify(sessions.map(s => s.toJSON())) : null],
        ['timer', timer ? JSON.stringify(timer.toJSON()) : null]
      ];

      const validOperations = operations
        .filter(([key, data]) => data !== null)
        .map(([key, data]) => [this.STORAGE_KEYS[key.toUpperCase()], data]);

      if (validOperations.length > 0) {
        await AsyncStorage.multiSet(validOperations);
      }
      
      return true;
    } catch (error) {
      console.error('バッチ保存に失敗しました:', error);
      throw error;
    }
  }

  async loadAll() {
    try {
      const keys = [
        this.STORAGE_KEYS.SETTINGS,
        this.STORAGE_KEYS.SESSIONS,
        this.STORAGE_KEYS.TIMER
      ];
      
      const results = await AsyncStorage.multiGet(keys);
      const data = {};
      
      results.forEach(([key, value]) => {
        if (value) {
          try {
            const parsed = JSON.parse(value);
            switch (key) {
              case this.STORAGE_KEYS.SETTINGS:
                data.settings = Settings.fromJSON(parsed);
                break;
              case this.STORAGE_KEYS.SESSIONS:
                data.sessions = Array.isArray(parsed) ? parsed.map(s => PomodoroSession.fromJSON(s)) : [];
                break;
              case this.STORAGE_KEYS.TIMER:
                data.timer = Timer.fromJSON(parsed);
                break;
            }
          } catch (parseError) {
            console.error(`パース エラー for ${key}:`, parseError);
          }
        }
      });
      
      return {
        settings: data.settings || new Settings(),
        sessions: data.sessions || [],
        timer: data.timer || null
      };
    } catch (error) {
      console.error('バッチ読み込みに失敗しました:', error);
      return {
        settings: new Settings(),
        sessions: [],
        timer: null
      };
    }
  }
}