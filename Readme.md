# Проект на Express.js + PostgreSQL

Реализующий:

-   Получение данных с Skinport API с кешированием.
-   Списание баланса пользователя с проверкой на достаточность средств. А так же баланс не может уйти в минус.

---

## 📦 Установка и запуск

### 1. Клонировать репозиторий
```bash
git clone https://github.com/Muxitdin/kolikosoft-backend-test.git
cd kolikosoft-backend-test
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Настроить файл `.env` в корне проекта

```bash
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

### 4. Запустить приложение

```bash
npm run dev
```

---

## 📝 Документация

### 1. Получение данных с Skinport API

#### Запрос

```bash
GET /api/items
```

### 2. Списание баланса пользователя

#### Запрос

```bash
POST /api/buy
```

#### Request Body

```json
{
  "userId": 1,
  "amount": 100
}
```