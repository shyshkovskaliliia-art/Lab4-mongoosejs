const fs = require('fs');
const path = require('path');
const appEmitter = require('./appEmitter');

const LOG_FILE = path.join(__dirname, '../logs/stats.json');

// Ініціалізуємо файл логів якщо не існує
function ensureLogFile() {
    const dir = path.dirname(LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '[]', 'utf-8');
}

function appendToLogFile(entry) {
    ensureLogFile();
    let data = [];
    try {
        const raw = fs.readFileSync(LOG_FILE, 'utf-8');
        data = JSON.parse(raw);
    } catch {
        data = [];
    }
    data.push(entry);
    fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Підписка на подію "requestCompleted" (від middleware B) ──────────────────
appEmitter.on('requestCompleted', stat => {
    // Записуємо у файл лише для успішних відповідей (2xx/3xx)
    if (stat.status < 400) {
        appendToLogFile({ event: 'requestCompleted', ...stat });
    }
    // Завжди пишемо в консоль (для зручності розробки)
    console.log(
        `[requestCompleted] ${stat.method} ${stat.path} → ${stat.status} | ${stat.responseTimeMs}ms | IP: ${stat.ip}`,
    );
});

// ── Підписка на подію "requestStats" (від middleware C) ──────────────────────
appEmitter.on('requestStats', stat => {
    appendToLogFile({ event: 'requestStats', ...stat });
    console.log(
        `[requestStats] ${stat.method} ${stat.path} | UA: ${
            stat.userAgent
        } | pathParams: ${JSON.stringify(stat.pathParams)} | query: ${JSON.stringify(
            stat.queryParams,
        )}`,
    );
});

module.exports = { appendToLogFile };
