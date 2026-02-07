const DEBUG = process.env.DEBUG === 'true';

const debug = (...args) => {
  if (DEBUG) console.log(...args);
};

const debugError = (...args) => {
  if (DEBUG) console.error(...args);
};

module.exports = { debug, debugError, DEBUG };
