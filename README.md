# RetryFlow

`RetryFlow` is functional and chainable retry utility!

You can easily chain method calls to set up your retry configuration in a clean and functional manner.


## Features

- ⛓️ **Functional Chain Invoke:** Configure the retry parameters using a fluent and functional chain.
- 🦸 **Retry Types:** Choose between two retry types: by a maximum number of retries or a maximum duration.
- ♨️ **Interval Control:** Set the interval between retries.
- ⏰ **Timeout:** Define a timeout for the entire retry process.
- 🛂 **Result Validation:** Support customize validation to check if the result of the callback can be resolved.

## Installation

To install RetryFlow, you can use npm or yarn:

```bash
npm install retry-flow
# or
yarn add retry-flow
```

## API Reference

| API                        | Argument Type                    | Description                                                                                       |
| -------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `func(callback)`           | `Function`                       | Accepts a callback function to be retried.                                                        |
| `interval(ms)`             | `number`                         | Sets the time interval between retry attempts (in milliseconds).                                   |
| `timeout(ms)`              | `number`                         | Sets the maximum time to wait for a successful operation (in milliseconds).                       |
| `retryTimes(times)`        | `number`                         | Configures the maximum number of retry attempts.                                                   |
| `retryDuration(duration)`   | `number`                         | Configures the maximum duration for retrying an operation (in milliseconds).                      |
| `checkPass(callback)`      | `Function`                       | Specifies a custom result check function.                                                          |
| `wait(interval)`           | `number`                         | A utility function that creates a pause for a specified time interval (in milliseconds).         |
| `start()`                  | None                             | Initiates the retry operation based on the configured settings. Returns a promise of the result.  |


### Example
Retry with duration:
```js

const fn = () => {}; // Function you need retry.

const retry = new RetryFlow()
  .func(fn)
  .timeout(5000) // Each invoke timeout.
  .interval(5000) // Retry interval for 5 seconds.
  .retryDuration(60000) // Retry for up to 60 seconds
  .checkPass((result) => {
    // Custom result check logic
    return result.statusCode === 200;
  });

retry.start()
  .then((result) => {
    console.log('fn succeeded:', result);
  })
  .catch((err) => {
    console.log('fn failed:', err);
  })

```

Retry with max times:
```js

const fn = () => {}; // Function you need retry.

const retry = new RetryFlow()
  .func(fn)
  .timeout(5000) // Each invoke timeout.
  .interval(3000) // Retry interval for 3 seconds.
  .retryTimes(3) // Retry up to 3 times.
  .checkPass((result) => {
    // Custom result check logic
    return result.statusCode === 200;
  });

retry.start()
  .then((result) => {
    console.log('fn succeeded:', result);
  })
  .catch((err) => {
    console.log('fn failed:', err);
  })

```

## License
[MIT](https://choosealicense.com/licenses/mit/)
