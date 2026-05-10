/**
 * Middleware для логування операцій видалення.
 *
 * При видаленні документу зберігає в колекцію DeleteLog:
 *   - documentId   — ObjectId видаленого документу
 *   - documentType — тип (назва колекції)
 *   - deletedAt    — час операції
 *
 * Використання в роуті DELETE:
 *   router.delete('/:id', deleteLogMiddleware('Teacher'), deleteTeacher);
 */

const DeleteLog = require('../models/deleteLog.model');

function deleteLogMiddleware(documentType) {
    return async function (req, res, next) {
        // Перехоплюємо res.json, щоб отримати статус після виконання контролера
        const originalJson = res.json.bind(res);
        res.json = async function (body) {
            // Логуємо лише успішне видалення (статус 200)
            if (res.statusCode === 200 && req.params.id) {
                try {
                    await DeleteLog.create({
                        documentId: req.params.id,
                        documentType,
                        deletedAt: new Date(),
                    });
                    console.log(
                        `[deleteLog] ${documentType} id=${
                            req.params.id
                        } deleted at ${new Date().toISOString()}`,
                    );
                } catch (err) {
                    console.error('[deleteLog] Помилка збереження лога:', err.message);
                }
            }
            return originalJson(body);
        };
        next();
    };
}

module.exports = deleteLogMiddleware;
