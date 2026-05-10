/* eslint-disable no-restricted-syntax */
/**
 * Middleware C — збір статистики запитів.
 *
 * Маскує чутливі поля (password, token, email) значенням '***'.
 * Не логує самостійно: генерує подію 'requestStats' через appEmitter.
 */

const appEmitter = require('../events/appEmitter');

const SENSITIVE_KEYS = ['password', 'token', 'email'];

function maskSensitive(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const lk = key.toLowerCase();
        result[key] = SENSITIVE_KEYS.some(s => lk.includes(s)) ? '***' : value;
    }
    return result;
}

module.exports.maskSensitive = maskSensitive;

function requestStatsMiddleware(req, res, next) {
    // Перехоплюємо res.end (після того як роутер розпарсив params)
    const originalEnd = res.end.bind(res);
    res.end = function (...args) {
        const maskedPathParams = maskSensitive(req.params || {});
        const maskedQueryParams = maskSensitive(req.query || {});

        appEmitter.emit('requestStats', {
            method: req.method,
            path: req.path,
            pathParams: maskedPathParams,
            queryParams: maskedQueryParams,
            userAgent: req.get('user-agent') || 'unknown',
            ip: req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1',
            timestamp: new Date().toISOString(),
        });

        return originalEnd(...args);
    };

    next();
}

module.exports = requestStatsMiddleware;
module.exports.maskSensitive = maskSensitive;
