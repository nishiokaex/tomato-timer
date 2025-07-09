export class StorageRepository {
  async saveSettings(settings) {
    throw new Error('StorageRepository.saveSettings must be implemented');
  }

  async loadSettings() {
    throw new Error('StorageRepository.loadSettings must be implemented');
  }

  async saveSessions(sessions) {
    throw new Error('StorageRepository.saveSessions must be implemented');
  }

  async loadSessions() {
    throw new Error('StorageRepository.loadSessions must be implemented');
  }

  async saveTimer(timer) {
    throw new Error('StorageRepository.saveTimer must be implemented');
  }

  async loadTimer() {
    throw new Error('StorageRepository.loadTimer must be implemented');
  }

  async clearAll() {
    throw new Error('StorageRepository.clearAll must be implemented');
  }

  async migrate(fromVersion, toVersion) {
    throw new Error('StorageRepository.migrate must be implemented');
  }
}