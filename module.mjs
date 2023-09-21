
const require = (await import('node:module')).createRequire(import.meta.url);

export const { EventEmitterWrapper, createWrapper } = require('./index.js');

export default EventEmitterWrapper;
