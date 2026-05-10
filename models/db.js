const mongoose = require('mongoose');
const config = require('../config/db.config');

async function connect() {
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB connected via Mongoose');
    return mongoose.connection;
}

module.exports = { connect };
