declare class Retryit {
    /**
     *    accept a callback
     *    support interval set
     *    support timeout set
     *    support pass result check
     *    functional invoke
     */
    private _callback;
    private _interval;
    private _timeout;
    private _retryTimes;
    private _retryType;
    private _curRetryTimes;
    private _checkPassFn;
    constructor();
    func(callback: Function): this;
    interval(ms: number): this;
    timeout(ms: number): this;
    retryTimes(times: number): this;
    checkPass(callback: Function): this;
    start(): Promise<unknown>;
    startTimes(resolve: Function, reject: Function): Promise<void>;
    wait(interval: number): Promise<unknown>;
    _increaseTimes(): boolean;
    _clear(): void;
}

export { Retryit as default };
