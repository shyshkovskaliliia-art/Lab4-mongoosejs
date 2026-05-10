const mongoose = require('mongoose');

/**
 * @swagger
 * definitions:
 *   DeleteLog:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         description: Ідентифікатор запису
 *       documentId:
 *         type: string
 *         description: ObjectId видаленого документу
 *       documentType:
 *         type: string
 *         description: Назва колекції (тип документу)
 *       deletedAt:
 *         type: string
 *         format: date-time
 *         description: Час виконання операції
 */
const deleteLogSchema = new mongoose.Schema(
    {
        documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
        documentType: { type: String, required: true },
        deletedAt: { type: Date, default: Date.now },
    },
    { versionKey: false },
);

const DeleteLog = mongoose.model('DeleteLog', deleteLogSchema);

module.exports = DeleteLog;
