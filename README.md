# Courses App — Лабораторна робота №4

REST API для керування викладачами навчального закладу на базі **Express.js** + **MongoDB Atlas** + **Mongoose.js**.

## Що реалізовано в лаб. роботі №4

- Міграція з MySQL на **MongoDB Atlas** як джерело даних
- Підключення **Mongoose.js** (ODM) для визначення схем і моделей
- Mongoose **Schema** та **Model** для колекції `teachers`
- Окрема колекція `deletelogs` для логування операцій видалення
- **Middleware** `deleteLog` — при DELETE автоматично зберігає `documentId`, `documentType`, `deletedAt`
- REST API: **GET**, **POST**, **DELETE**
- Swagger UI документація

## Структура проекту

```
courses-app-lab4/
├── app.js                        # Точка входу Express + підключення MongoDB
├── bin/www                       # HTTP сервер
├── config/
│   └── db.config.js              # Конфігурація (mongoUri з .env)
├── controllers/
│   └── teachers.controller.js    # Обробники запитів
├── events/
│   ├── appEmitter.js             # Custom EventEmitter
│   └── subscriber.js             # Слухач подій → файл/консоль
├── middleware/
│   ├── deleteLog.js              # Middleware логування видалень (новий)
│   ├── responseTime.js           # Middleware: час відповіді + rate limit
│   └── requestStats.js           # Middleware: статистика запитів
├── models/
│   ├── db.js                     # Підключення Mongoose
│   ├── teacher.model.js          # Mongoose Schema + Model для Teacher
│   └── deleteLog.model.js        # Mongoose Schema + Model для DeleteLog (новий)
├── routes/
│   └── teachers.js               # Маршрути /teachers
├── tests/
│   ├── teachers.test.js          # Unit-тести ендпойнтів
│   ├── middleware.test.js        # Unit-тести middleware
│   └── emitter.test.js           # Unit-тести EventEmitter
├── logs/
│   └── stats.json                # JSON-лог запитів (автостворюється)
├── .env.example                  # Шаблон змінних середовища
└── README.md
```

## Встановлення та запуск

### 1. Клонувати репозиторій

```bash
git clone https://github.com/ТВІЙлогін/courses-app-lab4.git
cd courses-app-lab4
```

### 2. Встановити залежності

```bash
npm install
```

### 3. Створити .env файл

```bash
cp .env.example .env
```

Заповнити `.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/courses_db?retryWrites=true&w=majority&appName=Cluster0
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

> Connection String береться з MongoDB Atlas → Cluster0 → Connect → Drivers

### 4. Запустити сервер

```bash
npm start
```

Сервер запускається на `http://localhost:3000`  
Swagger UI доступний на `http://localhost:3000/api-docs`

## API — /teachers

| Метод  | URL             | Опис                          | Статус |
|--------|-----------------|-------------------------------|--------|
| GET    | /teachers       | Список викладачів (пагінація) | 200    |
| GET    | /teachers/:id   | Викладач за MongoDB ObjectId  | 200    |
| POST   | /teachers       | Створити викладача            | 201    |
| DELETE | /teachers/:id   | Видалити викладача            | 200    |

### GET /teachers — параметри

| Параметр | Тип    | За замовч. | Опис                    |
|----------|--------|------------|-------------------------|
| page     | number | 1          | Номер сторінки          |
| limit    | number | 10         | Кількість записів       |

### POST /teachers — тіло запиту

```json
{
  "full_name": "Іваненко Іван Іванович",
  "phone": "+380991234567",
  "address": "м. Чернівці, вул. Університетська, 28",
  "birth_date": "1985-05-15",
  "start_date": "2010-09-01"
}
```

> `full_name` та `start_date` — обов'язкові поля

### Приклад відповіді POST 201

```json
{
  "_id": "6631a2f4e1b23c0012345678",
  "full_name": "Іваненко Іван Іванович",
  "phone": "+380991234567",
  "address": "м. Чернівці, вул. Університетська, 28",
  "birth_date": "1985-05-15T00:00:00.000Z",
  "start_date": "2010-09-01T00:00:00.000Z",
  "createdAt": "2026-04-29T21:47:00.000Z",
  "updatedAt": "2026-04-29T21:47:00.000Z"
}
```

## Middleware

### deleteLog (middleware/deleteLog.js)

При успішному видаленні (HTTP 200) автоматично зберігає запис у колекцію `deletelogs`:

```json
{
  "_id": "6631b300e1b23c0087654321",
  "documentId": "6631a2f4e1b23c0012345678",
  "documentType": "Teacher",
  "deletedAt": "2026-04-29T21:47:00.000Z"
}
```

### responseTime (middleware/responseTime.js)

- Вимірює час виконання через `process.hrtime.bigint()`
- Додає заголовок `X-Response-Time: 3.142ms`
- Додає заголовок `X-Rate-Limit-Remaining: 99`
- Rate limiting: `RATE_LIMIT_MAX` запитів за `RATE_LIMIT_WINDOW_MS` мс → 429

### requestStats (middleware/requestStats.js)

- Збирає path params, query params, User-Agent
- Маскує чутливі поля (`password`, `token`, `email`) → `***`
- Генерує подію `requestStats` через AppEmitter

### EventEmitter

```
Middleware → appEmitter.emit('requestCompleted' / 'requestStats')
                  ↓
           subscriber.js слухає події
                  ↓
     ┌────────────┴────────────┐
   консоль               logs/stats.json
```

## Mongoose моделі

### Teacher Schema

| Поле       | Тип    | Обов'язкове | Опис                    |
|------------|--------|-------------|-------------------------|
| full_name  | String | так         | ПІБ викладача           |
| phone      | String | ні          | Номер телефону          |
| address    | String | ні          | Адреса                  |
| birth_date | Date   | ні          | Дата народження         |
| start_date | Date   | так         | Дата початку роботи     |
| createdAt  | Date   | авто        | Час створення документу |
| updatedAt  | Date   | авто        | Час оновлення документу |

### DeleteLog Schema

| Поле         | Тип      | Опис                        |
|--------------|----------|-----------------------------|
| documentId   | ObjectId | ID видаленого документу     |
| documentType | String   | Тип документу ("Teacher")   |
| deletedAt    | Date     | Час виконання операції      |

## Тести

```bash
npm test              # Всі тести
npm run test:cover    # З покриттям коду
npm run lint          # Перевірка коду ESLint
```

## Технології

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Mongoose.js](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Jest](https://jestjs.io/)
