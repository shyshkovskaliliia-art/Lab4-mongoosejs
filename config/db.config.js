require('dotenv').config();

const config = {
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/courses_db',
    listPerPage: 10,
};

module.exports = config;
