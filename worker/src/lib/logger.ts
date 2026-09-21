type LogArgs = unknown[];

function info(...args: LogArgs): void {
  console.log(new Date().toISOString(), ...args);
}

function warn(...args: LogArgs): void {
  console.warn(new Date().toISOString(), ...args);
}

function error(...args: LogArgs): void {
  console.error(new Date().toISOString(), ...args);
}

const logger = { info, warn, error };

export default logger;
