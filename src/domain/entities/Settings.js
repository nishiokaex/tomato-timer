export const DEFAULT_SETTINGS = {
  pomodoroLength: 25 * 60, // 25分
  shortBreakLength: 5 * 60, // 5分
  longBreakLength: 15 * 60, // 15分
  language: 'ja',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true
  },
  autoStart: false,
  version: 1
};

export class Settings {
  constructor(data = {}) {
    this.pomodoroLength = data.pomodoroLength || DEFAULT_SETTINGS.pomodoroLength;
    this.shortBreakLength = data.shortBreakLength || DEFAULT_SETTINGS.shortBreakLength;
    this.longBreakLength = data.longBreakLength || DEFAULT_SETTINGS.longBreakLength;
    this.language = data.language || DEFAULT_SETTINGS.language;
    this.notifications = { ...DEFAULT_SETTINGS.notifications, ...data.notifications };
    this.autoStart = data.autoStart !== undefined ? data.autoStart : DEFAULT_SETTINGS.autoStart;
    this.version = data.version || DEFAULT_SETTINGS.version;
  }

  updatePomodoroLength(length) {
    if (length > 0 && length <= 60 * 60) { // 最大60分
      this.pomodoroLength = length;
      return true;
    }
    return false;
  }

  updateShortBreakLength(length) {
    if (length > 0 && length <= 30 * 60) { // 最大30分
      this.shortBreakLength = length;
      return true;
    }
    return false;
  }

  updateLongBreakLength(length) {
    if (length > 0 && length <= 60 * 60) { // 最大60分
      this.longBreakLength = length;
      return true;
    }
    return false;
  }

  updateLanguage(language) {
    const supportedLanguages = ['ja', 'en', 'zh', 'de', 'es'];
    if (supportedLanguages.includes(language)) {
      this.language = language;
      return true;
    }
    return false;
  }

  updateNotifications(notifications) {
    this.notifications = { ...this.notifications, ...notifications };
    return true;
  }

  updateAutoStart(autoStart) {
    this.autoStart = Boolean(autoStart);
    return true;
  }

  reset() {
    Object.assign(this, DEFAULT_SETTINGS);
    return true;
  }

  toJSON() {
    return {
      pomodoroLength: this.pomodoroLength,
      shortBreakLength: this.shortBreakLength,
      longBreakLength: this.longBreakLength,
      language: this.language,
      notifications: this.notifications,
      autoStart: this.autoStart,
      version: this.version
    };
  }

  static fromJSON(data) {
    return new Settings(data);
  }
}