import Retry from '../index';

describe('Retry Test', () => {
  it('should throw error if did not set func() before start', async () => {
    const retry = new Retry()
      .interval(100)
      .timeout(1000)
      .retryTimes(3);

    const promise = retry.start();

    await expect(promise).rejects.toThrowError('func() should be invoked before start()');
  });

  it('should resolve after successful execution', async () => {
    const successCallback = jest.fn().mockResolvedValue('Success');

    const retry = new Retry()
      .func(successCallback)
      .interval(100)
      .timeout(1000)
      .retryTimes(3);

    const result = await retry.start();

    expect(successCallback).toHaveBeenCalledTimes(1);
    expect(result).toBe('Success');
  });

  it('should reject after multiple failures', async () => {
    const failureCallback = jest.fn().mockRejectedValue('Failure');

    const retry = new Retry()
      .func(failureCallback)
      .interval(100)
      .timeout(1000)
      .retryTimes(3);

    await expect(retry.start()).rejects.toEqual('Failure');
    expect(failureCallback).toHaveBeenCalledTimes(4);
  });

  it('should resolve after 2 failures and 1 success', async () => {
    const callback = jest.fn()
      .mockRejectedValueOnce('Failure 1')
      .mockRejectedValueOnce('Failure 2')
      .mockResolvedValue('Success');

    const retry = new Retry()
      .func(callback)
      .interval(100)
      .timeout(1000)
      .retryTimes(3);

    const result = await retry.start();

    expect(callback).toHaveBeenCalledTimes(3);
    expect(result).toBe('Success');
  });

  it('should resolve after 1 failures and 1 success', async () => {
    const callback = jest.fn()
      .mockRejectedValueOnce('Failure 1')
      .mockResolvedValue('Success');

    const retry = new Retry()
      .func(callback)
      .interval(100)
      .timeout(1000)
      .retryTimes(3);

    const result = await retry.start();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(result).toBe('Success');
  });

  it('should respect the interval between retries', async () => {
    const interval = 1000;
    const callback = jest.fn()
      .mockRejectedValueOnce('Failure 1')
      .mockRejectedValueOnce('Failure 2')
      .mockResolvedValue('Success');

    const retry = new Retry()
      .func(callback)
      .interval(interval)
      .timeout(10000)
      .retryTimes(3);


    const promise = retry.start();

    await retry.wait(interval);
    expect(callback).toHaveBeenCalledTimes(1);

    await retry.wait(interval);
    expect(callback).toHaveBeenCalledTimes(2);

    await retry.wait(interval);
    expect(callback).toHaveBeenCalledTimes(3);

    await expect(promise).resolves.toBe('Success');
  });

  it('should resolve after 1 failures and 1 success', async () => {
    const callback = jest.fn()
      .mockRejectedValueOnce('Failure 1')
      .mockResolvedValue('Success');

    const retry = new Retry()
      .func(callback)
      .interval(100)
      .timeout(1000)
      .retryTimes(3);

    const result = await retry.start();

    expect(callback).toHaveBeenCalledTimes(2);
    expect(result).toBe('Success');
  });

  it('should return true if checkPass callback returns true', async () => {
    const callback = jest.fn();
    const checkPass = jest.fn().mockReturnValue(true);

    const retry = new Retry()
      .func(callback)
      .checkPass(checkPass);

    await expect(retry.start()).resolves.toBeUndefined();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(checkPass).toHaveBeenCalledWith(undefined);
  });

  it('should return false if checkPass callback returns false', async () => {
    const callback = jest.fn();
    const checkPass = jest.fn().mockReturnValue(false);

    const retry = new Retry()
      .func(callback)
      .interval(100)
      .timeout(1000)
      .retryTimes(3)
      .checkPass(checkPass);

    await expect(retry.start()).rejects.toEqual('exceed max retry times - 3');

    expect(callback).toHaveBeenCalledTimes(4);
    expect(checkPass).toHaveBeenCalledWith(undefined);
  });

  it('should return true if checkPass callback returns true in retry', async () => {
    const callback = jest.fn().mockReturnValue(1);
    const checkPass = jest.fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const retry = new Retry()
      .func(callback)
      .interval(100)
      .timeout(1000)
      .retryTimes(3)
      .checkPass(checkPass);

    await expect(retry.start()).resolves.toBe(1);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(checkPass).toHaveBeenCalledWith(1);
  });
});
