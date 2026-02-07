const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true';

export const debug = (...args: unknown[]) => {
  if (DEBUG) console.log(...args);
};

export const debugError = (...args: unknown[]) => {
  if (DEBUG) console.error(...args);
};
