require('dotenv').config();

require('./events/subscriber');

const createError = require('http-errors');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const { connect } = require('./models/db');
const responseTimeMW = require('./middleware/responseTime');
const requestStatsMW = require('./middleware/requestStats');

const indexRouter = require('./routes/index');
const teachersRouter = require('./routes/teachers');

const app = express();

// ── Підключення до MongoDB Atlas ──────────────────────────────────────────────
connect().catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(responseTimeMW);
app.use(requestStatsMW);

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            version: '1.0.0',
            title: 'Courses API',
            description: 'REST API для керування викладачами навчального закладу',
        },
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
    },
    apis: ['./models/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Маршрути ──────────────────────────────────────────────────────────────────
app.use('/', indexRouter);
app.use('/teachers', teachersRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    next(createError(404));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500).render('error');
});

module.exports = app;
