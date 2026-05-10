/**
 * Middleware B — вимірювання часу виконання + rate limiting.
 *
 * Заголовки X-Response-Time та X-Rate-Limit-Remaining встановлюються
 * через перехоплення res.end() — до того як відповідь реально надсилається.
 *
 * Не логує самостійно: генерує подію 'requestCompleted' через appEmitter.
 */

const appEmitter = require('../events/appEmitter');

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

const ipCounters = new Map();

function getRateInfo(ip) {
    const now = Date.now();
    let info = ipCounters.get(ip);
    if (!info || now > info.resetAt) {
        info = { count: 0, resetAt: now + WINDOW_MS };
        ipCounters.set(ip, info);
    }
    info.count += 1;
    return info;
}

// Експортуємо для юніт-тестів
module.exports.getRateInfo = getRateInfo;

function responseTimeMiddleware(req, res, next) {
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || '127.0.0.1';
    const rateInfo = getRateInfo(ip);

    // Перевірка Rate Limit
    if (rateInfo.count > MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Too Many Requests',
            message: `Перевищено ліміт запитів (${MAX_REQUESTS} за ${WINDOW_MS / 1000}с)`,
        });
    }

    const start = process.hrtime.bigint();

    // Перехоплюємо res.end щоб встановити заголовок ДО відправлення
    const originalEnd = res.end.bind(res);
    res.end = function (...args) {
        const end = process.hrtime.bigint();
        const responseTimeMs = Number(end - start) / 1_000_000;

        // Встановлюємо заголовки лише якщо вони ще не надіслані
        if (!res.headersSent) {
            res.setHeader('X-Response-Time', `${responseTimeMs.toFixed(3)}ms`);
            res.setHeader('X-Rate-Limit-Remaining', Math.max(0, MAX_REQUESTS - rateInfo.count));
        }

        // Генеруємо подію (лише для успішних відповідей — перевірка у subscriber)
        appEmitter.emit('requestCompleted', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            responseTimeMs: parseFloat(responseTimeMs.toFixed(3)),
            ip,
            userAgent: req.get('user-agent') || 'unknown',
            timestamp: new Date().toISOString(),
        });

        return originalEnd(...args);
    };

    return next();
}

module.exports = responseTimeMiddleware;
module.exports.getRateInfo = getRateInfo;
