const express = require('express');
const {
    getTeachers,
    getTeacherById,
    createTeacher,
    deleteTeacher,
} = require('../controllers/teachers.controller');
const deleteLogMiddleware = require('../middleware/deleteLog');

const router = express.Router();

router.get('/', getTeachers);
router.get('/:id', getTeacherById);
router.post('/', createTeacher);
router.delete('/:id', deleteLogMiddleware('Teacher'), deleteTeacher);

module.exports = router;
