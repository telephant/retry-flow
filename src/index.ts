enum RetryType {
  times = 1,
  // duration = 2,
}

export default class Retryit {
  /**
   *    accept a callback
   *    support interval set
   *    support timeout set
   *    support pass result check
   *    functional invoke
   */

  private _callback: Function | null = null;

  private _interval: number = 3000;

  private _timeout: number = 5000;

  private _retryTimes: number = 3;

  private _retryType: RetryType = RetryType.times;

  private _curRetryTimes: number = 0;

  private _checkPassFn: Function | null = null;

  constructor() {
  }

  func(callback: Function) {
    if (typeof callback !== 'function') {
      throw new Error('func accept callback as Function type');
    }
    this._callback = callback;
    return this;
  }

  interval(ms: number) {
    this._interval = ms;
    return this;
  }

  timeout(ms: number) {
    this._timeout = ms;
    return this;
  }

  retryTimes(times: number) {
    this._retryType = RetryType.times;
    this._retryTimes = times;
    return this;
  }

  // retryDuration(duration: number) {
  //   this._retryType = RetryType.duration;
  //   this._retryTimes = duration;
  //   return this;
  // }

  checkPass(callback: Function) {
    this._checkPassFn = callback;
    return this;
  }

  async start() {
    if (!this._callback) {
      throw new Error('func() should be invoked before start()');
    }

    return new Promise((resolve, reject) => {
      if (this._retryType === RetryType.times) {
        return this.startTimes(resolve, reject);
      }
    });
  }

  async startTimes (resolve: Function, reject: Function) {
    if (!this._callback) {
      reject('func() should be invoked before start()');
      return;
    }

    let timeoutTimer: NodeJS.Timeout | null = null;
  
    const retryOrFailed = async (rejectReason?: string) => {
      timeoutTimer && clearTimeout(timeoutTimer);
  
      if (this._increaseTimes()) {
        await this.wait(this._interval);
        await this.startTimes(resolve, reject);
      } else {
        reject(rejectReason ?? `exceed max retry times - ${this._retryTimes}`);
        return;
      }
    };

    timeoutTimer = setTimeout(retryOrFailed, this._timeout);

    let res;
    try {
      res = await this._callback?.();

      clearTimeout(timeoutTimer);

      if (this._checkPassFn && !this._checkPassFn(res)) {
        await retryOrFailed();
        return;
      }

      this._clear();
      resolve(res);
    } catch (err: any) {
      await retryOrFailed(err);
    }
  }

  async wait(interval: number) {
    return new Promise(resolve => setTimeout(resolve, interval));
  }

  _increaseTimes() {
    if (this._curRetryTimes >= this._retryTimes) {
      return false;
    }

    // retry.
    this._curRetryTimes++;
    return true;
  }

  _clear() {
    this._curRetryTimes = 0;
  }
}
