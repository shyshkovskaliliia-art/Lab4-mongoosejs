# Courses App — Express.js REST API

REST API для керування викладачами навчального закладу на базі Express.js та MySQL.

## Структура проекту

```
courses-app/
├── app.js                    # Точка входу Express
├── bin/www                   # HTTP сервер
├── config/
│   └── db.config.js          # Конфігурація БД (з .env)
├── controllers/
│   └── teachers.controller.js # Обробники запитів (A)
├── events/
│   ├── appEmitter.js         # Custom EventEmitter (*)
│   └── subscriber.js         # Слухач подій → файл/консоль (*)
├── middleware/
│   ├── responseTime.js       # Middleware B: час + rate limit
│   └── requestStats.js       # Middleware C: статистика + маскування
├── models/
│   ├── db.js                 # MySQL обгортка
│   └── teacher.model.js      # CRUD для таблиці teachers
├── routes/
│   └── teachers.js           # Маршрути /teachers
├── tests/
│   ├── teachers.test.js      # Unit-тести ендпойнтів (D)
│   ├── middleware.test.js    # Unit-тести middleware B і C (D)
│   └── emitter.test.js       # Unit-тести EventEmitter (*) (D)
├── logs/
│   └── stats.json            # JSON-лог запитів (автоствоюється)
└── .env.example              # Шаблон змінних середовища
```

## Налаштування

```bash
cp .env.example .env
# Заповніть DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
npm install
```

### База даних

Запустіть `courses.sql` для створення схеми, потім підключіться до БД `courses_db`.

## Запуск

```bash
npm start        # http://localhost:3000
```

## API — /teachers

| Метод  | URL             | Опис                    |
|--------|-----------------|-------------------------|
| GET    | /teachers       | Список викладачів       |
| GET    | /teachers/:id   | Викладач за ID          |
| POST   | /teachers       | Створити викладача       |
| DELETE | /teachers/:id   | Видалити викладача       |

### Параметри GET /teachers

- `page` — номер сторінки (за замовч. 1)
- `limit` — кількість на сторінці (за замовч. 10)

### Тіло POST /teachers

```json
{
  "full_name": "Іваненко Іван Іванович",
  "phone": "+380501234567",
  "address": "вул. Шевченка, 1",
  "birth_date": "1980-05-15",
  "start_date": "2005-09-01"
}
```

## Middleware

### B — responseTime (middleware/responseTime.js)

- Вимірює час виконання через `process.hrtime.bigint()`
- Додає заголовок `X-Response-Time: 3.142ms`
- Додає заголовок `X-Rate-Limit-Remaining: 99`
- Rate limiting: `RATE_LIMIT_MAX` запитів за `RATE_LIMIT_WINDOW_MS` мс з однієї IP → 429

### C — requestStats (middleware/requestStats.js)

- Збирає path params, query params, User-Agent
- Маскує `password`, `token`, `email` → `***`
- **Не логує сам** — генерує подію `requestStats`

### Custom EventEmitter (*)

```
Middleware B/C → appEmitter.emit('requestCompleted'/'requestStats')
                      ↓
             subscriber.js слухає події
                      ↓
         ┌────────────┴────────────┐
       консоль               logs/stats.json
```

## Тести

```bash
npm test              # Всі тести (28)
npm run test:cover    # З покриттям
```
