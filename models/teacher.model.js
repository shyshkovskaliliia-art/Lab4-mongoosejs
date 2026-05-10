const mongoose = require('mongoose');

/**
 * @swagger
 * definitions:
 *   Teacher:
 *     type: object
 *     required:
 *       - full_name
 *       - start_date
 *     properties:
 *       _id:
 *         type: string
 *         description: Унікальний ідентифікатор документу (MongoDB ObjectId)
 *       full_name:
 *         type: string
 *         description: ПІБ викладача
 *       phone:
 *         type: string
 *         description: Телефон викладача
 *       address:
 *         type: string
 *         description: Адреса викладача
 *       birth_date:
 *         type: string
 *         format: date
 *         description: Дата народження (YYYY-MM-DD)
 *       start_date:
 *         type: string
 *         format: date
 *         description: Дата початку роботи (YYYY-MM-DD)
 */
const teacherSchema = new mongoose.Schema(
    {
        full_name: { type: String, required: true, trim: true },
        phone: { type: String, default: null },
        address: { type: String, default: null },
        birth_date: { type: Date, default: null },
        start_date: { type: Date, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

const Teacher = mongoose.model('Teacher', teacherSchema);

// ── Функції-хелпери (повторюють API попередньої моделі) ──────────────────────

async function getAll({ page = 1, limit = 10 } = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    return Teacher.find().skip(skip).limit(limitNum).lean();
}

async function getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Teacher.findById(id).lean();
}

/* eslint-disable camelcase */
async function create({ full_name, phone, address, birth_date, start_date }) {
    const doc = await Teacher.create({
        full_name,
        phone: phone || null,
        address: address || null,
        birth_date: birth_date || null,
        start_date,
    });
    return doc.toObject();
}
/* eslint-enable camelcase */

async function remove(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await Teacher.findByIdAndDelete(id);
    return result !== null;
}

module.exports = { Teacher, getAll, getById, create, remove };
