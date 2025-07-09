export const TimerType = {
  POMODORO: 'pomodoro',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
};

export const TimerStatus = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed'
};

export class Timer {
  constructor(type = TimerType.POMODORO, duration = 25 * 60, version = 1) {
    this.id = this.generateId();
    this.type = type;
    this.duration = duration; // 秒単位
    this.remainingTime = duration;
    this.status = TimerStatus.IDLE;
    this.startTime = null;
    this.completedAt = null;
    this.version = version;
  }

  generateId() {
    return `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  start() {
    if (this.status === TimerStatus.IDLE || this.status === TimerStatus.PAUSED) {
      this.status = TimerStatus.RUNNING;
      this.startTime = Date.now();
      return true;
    }
    return false;
  }

  pause() {
    if (this.status === TimerStatus.RUNNING) {
      this.status = TimerStatus.PAUSED;
      return true;
    }
    return false;
  }

  reset() {
    this.remainingTime = this.duration;
    this.status = TimerStatus.IDLE;
    this.startTime = null;
    this.completedAt = null;
    return true;
  }

  complete() {
    this.status = TimerStatus.COMPLETED;
    this.completedAt = Date.now();
    this.remainingTime = 0;
    return true;
  }

  tick() {
    if (this.status === TimerStatus.RUNNING && this.remainingTime > 0) {
      this.remainingTime = Math.max(0, this.remainingTime - 1);
      
      if (this.remainingTime === 0) {
        this.complete();
        return true; // タイマー完了
      }
    }
    return false;
  }

  getFormattedTime() {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    return {
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      total: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  }

  getProgress() {
    return ((this.duration - this.remainingTime) / this.duration) * 100;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      duration: this.duration,
      remainingTime: this.remainingTime,
      status: this.status,
      startTime: this.startTime,
      completedAt: this.completedAt,
      version: this.version
    };
  }

  static fromJSON(data) {
    const timer = new Timer(data.type, data.duration, data.version);
    timer.id = data.id;
    timer.remainingTime = data.remainingTime;
    timer.status = data.status;
    timer.startTime = data.startTime;
    timer.completedAt = data.completedAt;
    return timer;
  }
}