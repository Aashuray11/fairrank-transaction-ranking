# FairRank

FairRank is a production-style full-stack transaction ranking platform built to demonstrate backend engineering fundamentals and a premium fintech dashboard experience.

## What It Does

- Processes transactions with validation and duplicate detection
- Maintains fair rankings using points, volume, and recent activity
- Prevents abuse with a daily transaction cap
- Exposes summary, leaderboard, dashboard, and analytics APIs
- Provides a modern React dashboard with charts, search, theme persistence, and animations

## Tech Stack

### Backend
- Python
- Flask
- Flask-CORS
- PyMongo
- MongoDB Atlas
- python-dotenv
- Gunicorn

### Frontend
- React + Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Hot Toast
- Recharts
- Framer Motion
- React Icons

## Project Structure

```text
backend/
  app.py
  config.py
  database/db.py
  routes/
  services/
  utils/
  requirements.txt
frontend/
  src/
  index.html
  tailwind.config.js
  vite.config.js
```

## Setup

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Set your MongoDB Atlas URI in `.env`.

Run locally:

```bash
python app.py
```

Production:

```bash
gunicorn -c gunicorn.conf.py app:app
```

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Production build:

```bash
npm run build
```

## Environment Variables

### Backend
- `MONGO_URI`
- `DB_NAME`
- `PORT`
- `FLASK_ENV`
- `CORS_ORIGINS`
- `LOG_LEVEL`

### Frontend
- `VITE_API_BASE_URL`

## API Documentation

### POST /transaction
Process a transaction.

Request:

```json
{
  "transactionId": "TXN1001",
  "userId": "USER001",
  "amount": 1000,
  "type": "purchase"
}
```

Success response:

```json
{
  "success": true,
  "message": "Transaction processed successfully",
  "data": {
    "pointsEarned": 100
  }
}
```

Errors:
- `400` for invalid input
- `409` for duplicate transaction IDs
- `429` when the daily limit is exceeded

### GET /summary/<userId>
Returns the current user profile, totals, fairness score, rank, last activity, and the last five transactions.

Returns `404` if the user does not exist.

### GET /ranking
Returns the leaderboard, sorted by fairness score descending.

Query params:
- `page`
- `limit`
- `search`

### GET /dashboard
Returns KPI data, recent transactions, and top users for the dashboard.

### GET /analytics
Returns chart datasets for revenue, transactions, rewards, and weekly activity.

## Ranking Algorithm

Fairness score is computed from multiple factors:

$$
Fairness\ Score = (0.6 \times Total\ Points) + (0.3 \times Transaction\ Count) + (0.1 \times Recent\ Activity\ Bonus)
$$

Recent activity bonus:
- Active within 24 hours: `+50`
- Active within 7 days: `+20`
- Otherwise: `+0`

## Duplicate Prevention Strategy

- A unique MongoDB index is created on `transactionId`
- Duplicate transaction attempts return `409 Conflict`
- This prevents replayed requests from being processed twice

## Concurrency Handling

- MongoDB `$inc` is used for atomic total updates
- Multi-collection writes are wrapped in MongoDB sessions/transactions when available
- A fallback path is included for standalone MongoDB environments without replica-set transactions

## Anti-Abuse Mechanisms

- Each user is limited to 50 transactions per day
- Additional requests are rejected with `Daily transaction limit exceeded`
- This helps protect ranking fairness and blocks spamming behavior

## Deployment

### Backend on Render
- Build command: `pip install -r backend/requirements.txt`
- Start command: `gunicorn -c backend/gunicorn.conf.py app:app`
- Set environment variables in Render dashboard

### Frontend on Vercel
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_BASE_URL` to the backend URL

### MongoDB Atlas
- Create a cluster
- Allow network access for your deployment IPs
- Put the Atlas connection string in `MONGO_URI`

## Video Demonstration Outline

For a 3 to 5 minute demo, cover:
- Architecture overview
- Transaction API and validation flow
- Duplicate prevention and daily limit enforcement
- Concurrency and atomic updates
- Fairness ranking logic
- Frontend dashboard walkthrough
- Trade-offs and limitations

## Notes

- The frontend uses a Node-compatible Vite 5 setup for local development on the current environment.
- Charts and leaderboard data are fetched from the backend APIs and refresh automatically where required.
