const { EventEmitter } = require('events');

/**
 * Центральний EventEmitter додатку.
 * Middleware генерують події — слухачі вирішують, куди їх відправити.
 *
 * Події:
 *  - 'requestCompleted'  { time, path, params, query, ip, userAgent, status }
 *  - 'requestStats'      { path, pathParams, queryParams, userAgent, ip, timestamp }
 */
class AppEmitter extends EventEmitter {}

module.exports = new AppEmitter();
