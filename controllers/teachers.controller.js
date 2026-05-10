const Teacher = require('../models/teacher.model');

/**
 * @swagger
 * /teachers:
 *   get:
 *     description: Отримати список всіх викладачів
 *     tags:
 *       - Teachers
 *     parameters:
 *       - name: page
 *         in: query
 *         type: integer
 *       - name: limit
 *         in: query
 *         type: integer
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Список викладачів
 *       500:
 *         description: Внутрішня помилка сервера
 */
const getTeachers = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
        const teachers = await Teacher.getAll({ page, limit });
        return res.status(200).json(teachers);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     description: Отримати викладача за ID
 *     tags:
 *       - Teachers
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Дані викладача
 *       404:
 *         description: Викладача не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */
const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.getById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ error: 'Викладача не знайдено' });
        }
        return res.status(200).json(teacher);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers:
 *   post:
 *     description: Додати нового викладача
 *     tags:
 *       - Teachers
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Teacher'
 *     produces:
 *       - application/json
 *     responses:
 *       201:
 *         description: Викладача успішно створено
 *       400:
 *         description: Некоректні дані
 *       500:
 *         description: Внутрішня помилка сервера
 */
const createTeacher = async (req, res) => {
    const {
        full_name: fullName,
        phone,
        address,
        birth_date: birthDate,
        start_date: startDate,
    } = req.body;
    try {
        if (!fullName || !startDate) {
            return (
                res
                    .status(400)
                    // eslint-disable-next-line quotes
                    .json({ error: "Поля 'full_name' та 'start_date' є обов'язковими" })
            );
        }
        const teacher = await Teacher.create({
            full_name: fullName,
            phone,
            address,
            birth_date: birthDate,
            start_date: startDate,
        });
        return res.status(201).json(teacher);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     description: Видалити викладача за ID
 *     tags:
 *       - Teachers
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Викладача успішно видалено
 *       404:
 *         description: Викладача не знайдено
 *       500:
 *         description: Внутрішня помилка сервера
 */
const deleteTeacher = async (req, res) => {
    try {
        const deleted = await Teacher.remove(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Викладача не знайдено' });
        }
        return res.status(200).json({ message: 'Викладача успішно видалено' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { getTeachers, getTeacherById, createTeacher, deleteTeacher };
