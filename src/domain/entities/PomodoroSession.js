export class PomodoroSession {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.startTime = data.startTime || Date.now();
    this.endTime = data.endTime || null;
    this.duration = data.duration || 25 * 60; // 秒単位
    this.actualDuration = data.actualDuration || null;
    this.type = data.type || 'pomodoro';
    this.completed = data.completed || false;
    this.date = data.date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    this.version = data.version || 1;
  }

  generateId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  complete() {
    this.completed = true;
    this.endTime = Date.now();
    this.actualDuration = Math.floor((this.endTime - this.startTime) / 1000);
    return true;
  }

  getFormattedDuration() {
    const duration = this.actualDuration || this.duration;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      total: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  }

  getDateObject() {
    return new Date(this.date);
  }

  isToday() {
    const today = new Date().toISOString().split('T')[0];
    return this.date === today;
  }

  isThisWeek() {
    const today = new Date();
    const sessionDate = new Date(this.date);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    return sessionDate >= startOfWeek;
  }

  isThisMonth() {
    const today = new Date();
    const sessionDate = new Date(this.date);
    return sessionDate.getMonth() === today.getMonth() && 
           sessionDate.getFullYear() === today.getFullYear();
  }

  toJSON() {
    return {
      id: this.id,
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      actualDuration: this.actualDuration,
      type: this.type,
      completed: this.completed,
      date: this.date,
      version: this.version
    };
  }

  static fromJSON(data) {
    return new PomodoroSession(data);
  }
}