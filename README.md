# CMS Platform (Flask + React + Tailwind)

Full‑stack CMS platform built with:

- **Backend:** Flask, SQLAlchemy, Flask-Login
- **Frontend:** React (Vite + JS), TailwindCSS
- **State management:** Zustand
- **Charts:** Recharts
- **Database:** PostgreSQL (recommended)
- **Authentication:** Session-based (Flask-Login)
- **Architecture:** Modular REST API + Block-based page builder (JSON
  content)

---

## 🚀 Features

### Core CMS

- Multi-site support
- Templates system
- Pages (admin-only create/edit)
- Posts (authenticated users)
- Block-based drag & drop editor
- JSON block tree storage in database

### Authentication & Roles

- User registration & login
- Roles: `admin` and `user`
- Admin-only routes protection
- Role change via Admin Dashboard

### Admin Dashboard

- Platform statistics overview:
  - Total users
  - Total sites
  - Total pages
  - Total posts
- Charts:
  - Users by role
  - Pages by status
  - Posts by status
  - Top sites by content
- User role management table

### External APIs (Frontend)

- Random Quote API
- Joke API
- Insert quote/joke directly into editor block

---

## 📁 Project Structure

    backend/
      app/
        models.py
        controllers/
        routes/
        utils/
      migrations/

    frontend/
      src/
        components/
        pages/
        stores/
        lib/
        auth/

---

## 🧠 Database Design

Content is stored as JSON block tree:

```json
{
  "version": 1,
  "blocks": [
    { "id": "uuid", "type": "text", "props": { "text": "Hello world" } }
  ]
}
```

Tables: - users - sites - templates - pages - posts

Unique constraints: - page slug unique per site - post slug unique per
site

---

## ⚙️ Backend Setup

### 1. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Environment variables

Create `.env`:

    FLASK_APP=app
    FLASK_ENV=development
    DATABASE_URL=postgresql://user:password@localhost/dbname
    SECRET_KEY=your_secret_key

### 4. Run migrations

```bash
flask db upgrade
```

### 5. Start backend

```bash
flask run
```

---

## 💻 Frontend Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

### 3. Build production version

```bash
npm run build
```

---

## 🧪 Testing

Frontend uses: - Vitest - React Testing Library

Run tests:

```bash
npm run test
```
