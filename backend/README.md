# EduGen Backend - Node.js + Supabase

Modern Node.js (Express) backend for the EduGen learning platform, using Supabase for database and authentication.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Initialize database
# Run migrations/001_initial_schema.sql in Supabase SQL Editor

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

---

## 📋 Requirements

- Node.js 16+
- npm or yarn
- Supabase account (free)
- Google Gemini API key

---

## 🔧 Environment Setup

Create `.env` file:

```ini
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini
GEMINI_API_KEY=your-api-key
GEMINI_MODEL=gemini-1.5-flash

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
FRONTEND_URL=http://localhost:5173
```

---

## 📁 Project Structure

```
backend/
├── server.js              # Express entry point
├── package.json           # Dependencies & scripts
├── .env                   # Environment variables
├── middleware/
│   └── auth.js            # JWT middleware
├── routes/
│   ├── auth.js            # Authentication
│   ├── topics.js          # Topic CRUD
│   ├── content.js         # Chapters
│   ├── assessments.js     # Quizzes & Exams
│   ├── chat.js            # AI Chat
│   ├── profile.js         # Profile & Notes
│   ├── analytics.js       # Study Tracking
│   ├── feedback.js        # User Feedback
│   └── flashcards.js      # Study Cards
├── utils/
│   ├── supabase.js        # Supabase client
│   ├── db.js              # Database operations
│   └── ai_engine.js       # AI content generation
├── sockets/
│   └── chatSocket.js      # WebSocket handlers
└── migrations/
    └── 001_initial_schema.sql
```

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Topics
- `POST /api/topics/create` - Create topic with roadmap
- `GET /api/topics` - List user's topics
- `GET /api/topics/<id>` - Get topic details
- `DELETE /api/topics/<id>` - Delete topic
- `POST /api/topics/<id>/generate-exam` - Generate exam

### Content
- `GET /api/chapters/<topic_id>` - Get chapters
- `GET /api/quizzes/<topic_id>` - Get quizzes
- `GET /api/exams/<topic_id>` - Get exams

### Assessment
- `POST /api/quiz/submit` - Submit quiz
- `POST /api/exam/exam/submit` - Submit exam
- `GET /api/results/<topic_id>` - Get results

### More
- See [MIGRATION.md](../MIGRATION.md) for complete API reference

---

## 🧠 AI Content Generation

Uses Google Gemini API to generate:
- Learning roadmaps
- Chapter content (blog posts)
- Quiz questions
- Midterm & final exams
- Flashcards

---

## 🔐 Authentication

- Supabase Auth handles user registration/login
- JWT tokens automatically included by frontend
- Row-Level Security (RLS) policies ensure data isolation
- All endpoints verify JWT tokens

---

## 📊 Database

**Supabase PostgreSQL** with:
- 11 tables (users, topics, chapters, quizzes, exams, results, notes, flashcards, profiles, analytics, achievements)
- Row-Level Security enabled
- Automatic timestamps (`created_at`, `updated_at`)
- JSONB support for complex data
- Foreign key constraints

---

## 🔄 WebSocket Chat

Real-time streaming chat via Socket.IO:

```javascript
socket.emit('chat_stream', {
  message: "What is React?",
  topic: "Web Development",
  context: "current chapter content",
  conversation_history: []
});

socket.on('chat_delta', (data) => {
  // Handle streaming chunks
});
```

---

## 🚢 Deployment

### Vercel
```bash
vercel --prod
```

### Railway
```bash
railway link
railway up
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 📝 Scripts

```bash
npm run dev      # Start with nodemon (development)
npm start        # Start production server
npm test         # Run tests (if configured)
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| Port 5000 in use | Change `PORT` in .env or: `lsof -i :5000` |
| DB connection error | Check Supabase URL/keys in .env |
| CORS errors | Add frontend URL to `CORS_ALLOWED_ORIGINS` |
| 401 Unauthorized | Ensure Bearer token is sent in Authorization header |

---

## 📚 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com)
- [Socket.IO Docs](https://socket.io/docs)
- [Google Gemini API](https://ai.google.dev)

See [MIGRATION.md](../MIGRATION.md) for Flask → Node.js migration details.

---

## License

MIT
