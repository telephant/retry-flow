declare class RetryFlow {
    /**
     *  accept a callback
     *  support interval set
     *  support timeout set
     *  support max try times set
     *  support max try duration set
     *  support pass result check
     *  functional chain invoke
     */
    private _callback;
    private _interval;
    private _timeout;
    private _retryTimes;
    private _retryDuration;
    private _retryType;
    private _curRetryTimes;
    private _checkPassFn;
    private _stopWhenFn;
    private _durationStartTime;
    private _waitTimer;
    constructor();
    func(callback: Function): this;
    interval(ms: number): this;
    timeout(ms: number): this;
    retryTimes(times: number): this;
    retryDuration(duration: number): this;
    checkPass(callback: Function): this;
    stopWhen(callback: Function): this;
    wait(interval: number): Promise<unknown>;
    start(): Promise<unknown>;
    private _startTimes;
    private _startDuration;
    private _excuteCb;
    private _increaseTimes;
    private _inDuration;
    private _clearTimes;
    private _clearDuration;
}

export { RetryFlow as default };
