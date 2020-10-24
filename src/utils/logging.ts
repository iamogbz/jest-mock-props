export const log = (...args: unknown[]): void => log.default(...args);
// eslint-disable-next-line no-console
log.default = log.warn = (...args: unknown[]): void => console.warn(...args);

export default log;
