# 🎵 SongVoca — BE

[[CI]](https://github.com/Kimhyewon0621/songvoca-backend/actions/workflows/ci.yml)

## ▶️ Project Description

Learn Korean vocabulary through the songs you love🤍

SongVoca is a Korean vocabulary learning web app. Search for a K-pop or Korean song, load its lyrics, and let AI extract useful vocabulary into flashcards. Study words in context — the way language is actually used.

🌐 **Live Demo**: https://songvoca-fe.vercel.app/
🧱 **Backend Server** : https://songvoca-backend.onrender.com
💻 **Frontend Repository**: [songvoca-frontend](https://github.com/AyeongKwon/songvoca-fe)

## ✨ Features

- **Song Search** — Search songs by title or artist via LRCLIB API
- **AI Vocabulary Extraction** — Gemini AI extracts Korean words with definitions and grammar notes
- **Flashcard Study** — Flip cards with "I know" / "I don't know" tracking
- **My Library** — Save and manage songs with learning progress status

## 🖥️ Tech Stack

| Category | Technology |
| --- | --- |
| Web Token | JWS |
| Password Hashing | bcrypt |
| Database | postgreSQL |
| Deployment | Render |

## 📁 Project Structure

```
songvoca-backend/
├── .github/
│   └── workflows/
│       └── ci.yml
├── controllers/
│   ├── authController.js
│   ├── songController.js
│   ├── studyLogController.js
│   └── wordController.js
├── middleware/
│   ├── authMiddleware.js
│   └── corsMiddleware.js
├── models/
│   ├── songModel.js
│   ├── studyLogModel.js
│   ├── userModel.js
│   └── wordModel.js
├── node_modules/
├── routes/
│   ├── auth.js
│   ├── songs.js
│   ├── studylogs.js
│   └── words.js
├── tests/
│   ├── auth.test.js
│   ├── authController.test.js
│   ├── authMiddleware.test.js
│   ├── setup.js
│   ├── songs.test.js
│   ├── studylogs.test.js
│   └── words.test.js
├── .env.example
├── .gitignore
├── app.js
├── db.js
├── openapi.yaml
├── package-lock.json
├── package.json
├── README.md
└── server.js
```

## 🚀 Getting Started (How to Install and Run)

### Prerequisites

- Git
- Node.js 20+
- npm
- A Gemini API Key (Free Tier is sufficient) from Google AI Studio.

### Setup

```bash
# Clone the repository
git clone https://github.com/Kimhyewon0621/songvoca-backend.git
cd songvoca-backend

# Install dependencies
npm ci

# Set up environment variables
cp .env.example .env

# Start the local server
npm start
```

Server runs at `http://localhost:8080`.

### Environment Variables

Create a `.env` file at the project root.

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | The port number the server will run on | `8080` |
| `DATABASE_URL` | External Url of Database | `postgresql://USER:PASSWORD@HOST:PORT/DATABASE` |
| `JWT_EXPIRES_IN` | The Token Expire Time | `30m` |
| `JWT_SECRET` | Security & Auth | `YOUR_LONG_RANDOM_SECRET_KEY` |
| `ALLOWED_ORIGIN` | Frontend URL | `http://localhost:3000` |
| `GEMINI_API_KEY` | Gemini API Settings | `YOUR_GEMINI_API_KEY_HERE` |

- **PORT**: The port number on which the server will run (e.g., 4000, 8080). If the port is already in use, please change it to a different number.
- **DATABASE_URL**: The connection string for your database. Enter your own database URL (e.g., MongoDB Atlas, Render PostgreSQL).
- **JWT_SECRET**: The secret key used to sign and verify JWT tokens. For security, use a long, random string. (You can generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- **JWT_EXPIRES_IN**: The expiration time for the JWT token (e.g., `1h` for one hour, `30m` for 30 minutes).
- **ALLOWED_ORIGIN**: The frontend URL allowed to access this backend API (e.g., `http://localhost:3000` or your deployed frontend domain).
- **GEMINI_API_KEY**: Your Google Gemini API key (Free Tier is sufficient). If you don't have one, please generate a key at Google AI Studio before starting the server.

### Test

```bash
# Run test
npm test

# Check test coverage
npm test:coverage

```

## 📝 AI Usage

This project uses the **Google Gemini API** for Korean vocabulary extraction from song lyrics.

AI tools such as **GitHub Copilot** and **Claude** were used during development.

## 📄 License

This project is for academic purposes — ITM519 Web Programming, SeoulTech, 2026.