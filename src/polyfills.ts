/**
 * Essential polyfills for Android 6.0+ WebView / Chrome 60+
 * Handles Array.prototype.at, String.prototype.replaceAll, Object.hasOwn, and structuredClone.
 */

// 1. Array.prototype.at polyfill
if (!Array.prototype.at) {
  Array.prototype.at = function (n: number) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  };
}

// 2. String.prototype.replaceAll polyfill
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (searchValue: any, replaceValue: any) {
    if (searchValue instanceof RegExp) {
      if (!searchValue.global) {
        throw new TypeError('String.prototype.replaceAll called with a non-global RegExp');
      }
      return this.replace(searchValue, replaceValue);
    }
    return this.split(String(searchValue)).join(String(replaceValue));
  };
}

// 3. Object.hasOwn polyfill
if (!Object.hasOwn) {
  Object.hasOwn = function (object: any, key: PropertyKey): boolean {
    return object !== null && object !== undefined && Object.prototype.hasOwnProperty.call(object, key);
  };
}

// 4. structuredClone polyfill fallback
if (typeof (globalThis as any).structuredClone !== 'function') {
  (globalThis as any).structuredClone = function <T>(obj: T): T {
    if (obj === undefined) return undefined as any;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  };
}

export {};
