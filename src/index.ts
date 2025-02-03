enum RetryType {
  times = 1,
  duration = 2,
}

export default class RetryFlow {
  /**
   *  accept a callback
   *  support interval set
   *  support timeout set
   *  support max try times set
   *  support max try duration set
   *  support pass result check
   *  functional chain invoke
   */
  private _callback: Function | null = null;

  private _interval: number = 3000;

  private _timeout: number = 5000;

  private _retryTimes: number = 3;

  private _retryDuration: number = 5000;

  private _retryType: RetryType = RetryType.times;

  private _curRetryTimes: number = 0;

  private _checkPassFn: Function | null = null;

  private _stopWhenFn: Function | null = null;

  private _durationStartTime: number = 0;

  private _waitTimer: NodeJS.Timeout | null = null;

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

  retryDuration(duration: number) {
    this._retryType = RetryType.duration;
    this._retryDuration = duration;
    return this;
  }

  checkPass(callback: Function) {
    this._checkPassFn = callback;
    return this;
  }

  stopWhen(callback: Function) {
    this._stopWhenFn = callback;
    return this;
  }

  async wait(interval: number) {
    return new Promise(resolve => this._waitTimer = setTimeout(resolve, interval));
  }

  async start() {
    if (!this._callback) {
      throw new Error('func() should be invoked before start()');
    }

    return new Promise((resolve, reject) => {
      switch (this._retryType) {
        case RetryType.times:
          return this._startTimes(resolve, reject);
        case RetryType.duration:
          this._durationStartTime = Date.now();
          return this._startDuration(resolve, reject);
        default:
          reject('error retry type');
      }
    });
  }

  private async _startTimes (resolve: Function, reject: Function) {
    if (!this._callback) {
      reject('func() should be invoked before start()');
      return;
    }

    let timeoutTimer: NodeJS.Timeout | null = null;

    const clearTimer = () => {
      timeoutTimer && clearTimeout(timeoutTimer);
    };
  
    const retryOrFailed = async (rejectReason?: string) => {
      clearTimer();
  
      if (this._increaseTimes()) {
        await this.wait(this._interval);
        await this._startTimes(resolve, reject);
      } else {
        this._clearTimes();
        reject(rejectReason ?? `exceed max retry times - ${this._retryTimes}`);
        return;
      }
    };

    const stopFn = async () => {
      clearTimer();
      this._clearTimes();

      reject(`stop when stopWhen`);
    };

    timeoutTimer = setTimeout(retryOrFailed, this._timeout);

    await this._excuteCb({
      success: async (res: any) => {
        clearTimer();
        this._clearTimes();
        resolve(res);
      },
      fail: async (reason: any) => {
        await retryOrFailed(reason);
      },
      stop: stopFn,
    });
  }

  private async _startDuration(resolve: Function, reject: Function) {
    if (!this._callback) {
      reject('func() should be invoked before start()');
      return;
    }

    const retryOrFailed = async (rejectReason?: string) => {
      if (this._inDuration()) {
        await this.wait(this._interval);
        await this._startDuration(resolve, reject);
      } else {
        this._clearDuration();
        reject(rejectReason ?? `exceed retry durantion ${this._retryDuration}`);
        return;
      }
    };

    const stopFn = async () => {
      this._clearDuration();
      
      reject('stop when stopWhen');
      return;
    };

    await this._excuteCb({
      success: async (res: any) => {
        this._clearDuration();
        resolve(res);
      },
      fail: async (reason: any) => {
        await retryOrFailed(reason);
      },
      stop: stopFn,
    });
  }

  private async _excuteCb (opts: { success: Function, fail: Function, stop: Function }) {
    const { success, fail, stop } = opts;

    let res;
    try {
      res = await this._callback?.();

      if (this._stopWhenFn && this._stopWhenFn(res)) {
        await stop();
        return;
      }

      if (this._checkPassFn && !this._checkPassFn(res)) {
        await fail();
        return;
      }

      await success(res);
    } catch (err: any) {
      await fail(err);
    }
  }

  private _increaseTimes() {
    if (this._curRetryTimes >= this._retryTimes) {
      return false;
    }

    // retry.
    this._curRetryTimes++;
    return true;
  }

  private _inDuration() {
    const now = Date.now();
    if (now - this._durationStartTime > this._retryDuration - this._interval) {
      return false;
    }

    return true;
  }

  private _clearTimes() {
    this._curRetryTimes = 0;
  }

  private _clearDuration() {
    this._durationStartTime = 0;
    this._waitTimer && clearTimeout(this._waitTimer);
  }
}
