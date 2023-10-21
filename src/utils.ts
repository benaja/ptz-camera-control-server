export function throttle<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T {
  let previousTimestamp = 0;
  let timeout: NodeJS.Timeout | null = null;

  function throttled(this: any, ...args: any[]) {
    const now = Date.now();

    if (!previousTimestamp) {
      previousTimestamp = now;
    }

    const remaining = wait - (now - previousTimestamp);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previousTimestamp = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(this, args);
        previousTimestamp = now;
        timeout = null;
      }, wait);
    }
  }

  return throttled as T;
}
