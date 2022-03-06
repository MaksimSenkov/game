export default class Timer {
  constructor() {
    this.time = undefined;
    this.timer = undefined;
  }
  set(cb, time) {
    this.time = time;

    return new Promise((resolve, reject) => {
      this.timer = setTimeout(() => {
        cb();
        resolve();
      }, time * 1000);
    });
  }
  get getTime() {
    return this.time;
  }
  kill() {
    clearTimeout(this.timer);
  }
}
