# Migration Guide: Flask + MongoDB to Node.js + Supabase

## 🎯 Overview

This document details the complete migration of EduGen from a **Flask + MongoDB** stack to a modern **Node.js (Express) + Supabase (PostgreSQL)** architecture.

### What Changed

| Aspect | Before | After |
|---|---|---|
| **Backend Framework** | Flask (Python) | Express.js (Node.js) |
| **Database** | MongoDB (NoSQL) | Supabase/PostgreSQL (SQL) |
| **Authentication** | Flask-JWT | Supabase Auth + JWT |
| **Real-time** | Flask-SocketIO | Socket.IO for Node |
| **IDs** | MongoDB ObjectId | UUID (v4) |
| **Deployment** | Heroku/AWS | Vercel/Railway/DigitalOcean |

---

## 📊 Database Schema Changes

### New Table Structure

All MongoDB collections converted to PostgreSQL tables with:
- **UUIDs** instead of ObjectIds
- **Row-Level Security (RLS)** policies for data isolation
- **JSONB** for complex nested data
- **Automatic timestamps** with `updated_at` triggers
- **Foreign keys** for referential integrity

### Tables Created

```sql
-- Core Tables
profiles          -- User profile data
topics            -- Learning topics/courses
chapters          -- Course chapters with content
quizzes           -- Chapter assessments
exams             -- Comprehensive exams (midterm/final)
results           -- Assessment results with scores

-- User Data
notes             -- User annotations on chapters
flashcards        -- Study cards
analytics         -- Study time tracking
achievements      -- Badges and rewards

-- Feedback
feedback          -- User feedback/bug reports

-- Auth (Built-in Supabase)
auth.users        -- User accounts and authentication
```

See [backend/migrations/001_initial_schema.sql](backend/migrations/001_initial_schema.sql) for full schema.

---

## 🔐 Authentication Overhaul

### NEW Auth Endpoints

```
POST   /api/auth/signup              Register new user
POST   /api/auth/login               Login and get session
POST   /api/auth/logout              Logout (expires session)
GET    /api/auth/me                  Get current user (requires token)
POST   /api/auth/refresh-token       Refresh JWT token
POST   /api/auth/reset-password      Send password reset email
POST   /api/auth/update-password     Update user password
```

### Request Authentication

**All endpoints** (except auth/feedback) now require:
```http
Authorization: Bearer eyJhbGc...  (JWT from Supabase)
```

**Frontend automatically includes this** via axios interceptor:
```javascript
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
```

### User ID Handling

**Before**: Explicitly passed in request body
```json
POST /api/topics/create
{
  "user_id": "507f1f77bcf86cd799439011",  // Sent by client
  "topic_name": "Python Basics",
  "level": "beginner"
}
```

**After**: Auto-extracted from JWT token
```json
POST /api/topics/create
{
  "topic_name": "Python Basics",
  "level": "beginner"
  // user_id automatically from Authorization header
}
```

---

## 🔌 Backend API Changes

### Simplified Function Signatures

| Operation | Before | After |
|---|---|---|
| Create topic | `createTopic(user_id, name, level)` | `createTopic(name, level)` |
| Get topics | `getUserTopics(user_id)` | `getUserTopics()` |
| Get profile | `getProfile(user_id)` | `getProfile(user_id)` |
| Submit quiz | `submitQuiz(quiz_id, user_id, answers, score)` | `submitQuiz(quiz_id, answers, score)` |

### Endpoint Changes

**Modified Routes**:
```
GET  /api/topics/<user_id>          →  GET  /api/topics              (no user_id in URL)
GET  /api/topic/<topic_id>          →  GET  /api/topics/<topic_id>   (plural)
POST /api/exam/submit               →  POST /api/exam/exam/submit    (nested)
```

**New Routes**:
```
POST /api/topics/<id>/generate-exam     Generate midterm/final exam
GET  /api/topics/<id>/exams             Get exams for topic
```

**Removed Routes**:
```
GET  /api/exams/<exam_id>          (use WebSocket instead)
POST /api/exams/generate           (use /topics/<id>/generate-exam)
```

---

## 💻 Frontend API Client Updates

### Import Statement
```javascript
// NEW - Import Supabase
import { supabase } from "../supabaseClient";
```

### Updated Function Usage

**Before**:
```javascript
import * as learnpath from "../api/learnpath";
import { supabase } from "../supabaseClient";

const user = supabase.auth.getUser();
const topics = await learnpath.getUserTopics(user.id);
const profile = await learnpath.getProfile(user.id);
```

**After**:
```javascript
import * as learnpath from "../api/learnpath";

// User ID not needed - auto from JWT
const topics = await learnpath.getUserTopics();
const profile = await learnpath.getProfile();  // Still takes user_id for direct lookup
```

### New Auth Functions
```javascript
// NEW in learnpath.js
signup(email, password, fullName)       // Register
login(email, password)                  // Login
logout()                                // Logout
getCurrentUser()                        // Get current user data
```

---

## 🛠️ Setup Instructions

### 1. Supabase Setup

1. Create project at https://supabase.com
2. Copy **Project URL** and **Anon Key** from Settings
3. Go to SQL Editor
4. Run [backend/migrations/001_initial_schema.sql](backend/migrations/001_initial_schema.sql)

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
echo "SUPABASE_URL=https://your-project.supabase.co" > .env
echo "SUPABASE_ANON_KEY=eyJ..." >> .env
echo "SUPABASE_SERVICE_ROLE_KEY=eyJ..." >> .env
echo "GEMINI_API_KEY=AIzaSy..." >> .env
echo "PORT=5000" >> .env

# Start server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Create .env.local
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > .env.local
echo "VITE_SUPABASE_ANON_KEY=eyJ..." >> .env.local
echo "VITE_BACKEND_URL=http://localhost:5000/api" >> .env.local

# Start app
npm run dev
```

---

## 📝 Environment Variables

### Backend .env

```ini
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # For admin operations

# Google Gemini API
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:4173

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend .env.local

```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_BACKEND_URL=http://localhost:5000/api
```

---

## 🔄 API Endpoint Reference

### Authentication (NEW)
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh-token`

### Topics Management
- `POST /api/topics/create` - Create topic with AI-generated roadmap
- `GET /api/topics` - List user's topics
- `GET /api/topics/<id>` - Get single topic with status
- `GET /api/topics/status/<id>` - Check generation progress
- `DELETE /api/topics/<id>` - Delete topic
- `POST /api/topics/<id>/complete` - Mark topic complete
- `POST /api/topics/<id>/generate-exam` - Generate exam
- `GET /api/topics/<id>/exams` - Get all topic exams

### Content Retrieval
- `GET /api/chapters/<topic_id>` - Get chapter list
- `GET /api/quizzes/<topic_id>` - Get quizzes (auto-generated)
- `GET /api/exams/<topic_id>` - Get exams for topic

### Assessment
- `POST /api/quiz/submit` - Submit quiz answers
- `POST /api/exam/exam/submit` - Submit exam
- `GET /api/results/<topic_id>` - Get aggregated results

### Learning Resources
- `POST /api/chat` - Send message to AI tutor
- `ws: chat_stream` - WebSocket streaming chat
- `POST /api/flashcards/create` - Create study cards
- `GET /api/flashcards/<user_id>/<topic_id>` - Get flashcards
- `POST /api/profile/create` - Create note
- `GET /api/profile/<user_id>/<topic_id>` - Get notes
- `PUT /api/profile/update/<note_id>` - Update note
- `DELETE /api/profile/delete/<note_id>` - Delete note

### User Profile
- `GET /api/profile/<user_id>` - Get profile
- `POST /api/profile/update` - Update profile info
- `POST /api/profile/upload-profile-picture` - Upload avatar

### Analytics & Feedback
- `POST /api/analytics/study` - Track study session
- `GET /api/analytics/<user_id>/<topic_id>` - Get topic analytics
- `GET /api/analytics/user/<user_id>` - Get all user analytics
- `POST /api/feedback` - Submit feedback (public)

---

## 🚀 Deployment

### Backend (Express on Node.js)

**Vercel**:
```bash
npm install -g vercel
vercel --prod
```

**Railway**:
```bash
railway link
railway up
```

**Docker**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Frontend (Already configured)

Deploy folder: `frontend/dist`

**Vercel**: Already configured in [vercel.json](vercel.json)
```bash
npm run build
vercel --prod
```

---

## ✅ Migration Checklist

- [ ] Create Supabase project
- [ ] Run SQL migration script
- [ ] Copy Supabase credentials to backend .env
- [ ] Install backend dependencies (`npm install`)
- [ ] Test backend locally (`npm run dev`)
- [ ] Update frontend .env.local
- [ ] Test frontend locally (`npm run dev`)
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test WebSocket chat
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test production environment

---

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| `401 Unauthorized` | Check JWT token, ensure Supabase session is active |
| `CORS Error` | Add frontend URL to `CORS_ALLOWED_ORIGINS` in .env |
| `Database connection failed` | Verify Supabase URL and keys, check network |
| `Endpoint not found (404)` | Verify route in Express app.js, check axios baseURL |
| `WebSocket connection failed` | Check Socket.IO CORS settings, verify port 5000 |

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com)
- [Socket.IO Documentation](https://socket.io/docs)
- [Google Gemini API](https://ai.google.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

## Summary of Benefits

✅ **Node.js Advantages**:
- Faster async I/O performance
- Better real-time support
- Easier to deploy (Vercel, Railway, etc.)
- Modern JavaScript ecosystem

✅ **Supabase Advantages**:
- Built-in Row-Level Security
- Serverless infrastructure
- Real-time subscriptions
- Better JSON support (JSONB)
- Automatic backups
- PostgreSQL ecosystem

✅ **Overall Improvements**:
- Better security with RLS policies
- Easier to scale horizontally
- Reduced DevOps complexity
- Improved data consistency
- Better real-time capabilities
- Modern tech stack
            onExamCreated(exam, topic);
        } finally {
            onLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input value={topic} onChange={...} />
            <button type="submit">Start Exam</button>
        </form>
    );
}
```

### Benefits
- ✅ Easier to test (components are isolated)
- ✅ Better state management (useState, props)
- ✅ Reusable components
- ✅ Faster development
- ✅ Better maintainability
- ✅ Performance optimizations (React.memo, etc.)

## Backend Refactoring

### v1 FastAPI
```python
from fastapi import FastAPI
from openai import OpenAI

app = FastAPI()

@app.post("/create_exam")
async def create_exam(request: ExamRequest):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(...)
```

### v2 Flask  
```python
from flask import Flask, jsonify
import google.generativeai as genai

app = Flask(__name__)

@app.route('/api/create_exam', methods=['POST'])
def create_exam():
    model = get_model()
    response = model.generate_content(prompt)
```

### Key Differences

| Aspect | v1 (FastAPI) | v2 (Flask) |
|--------|------------|----------|
| **Framework** | FastAPI | Flask |
| **AI Service** | OpenAI (paid) | Google Gemini (free) |
| **Model** | GPT-3.5-turbo | gemini-1.5-flash |
| **Response Timing** | ~3-5 sec | ~5-10 sec* |
| **Cost** | $0.002 / 10 calls | Free (quotas apply) |
| **Setup** | Complex CORS config | Simple CORS config |

*May vary based on load & network

## API Endpoint Changes

### v1 Endpoints
```
POST http://127.0.0.1:8000/create_exam
POST http://127.0.0.1:8000/generate_learning_tree
```

### v2 Endpoints
```
POST http://127.0.0.1:5000/api/create_exam
POST http://127.0.0.1:5000/api/generate_learning_tree
GET http://127.0.0.1:5000/api/health
```

## Environment Setup Comparison

### v1
```bash
# Only backend setup
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=your_key
python server.py
```

### v2
```bash
# Backend setup
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
export GEMINI_API_KEY=your_key
python app.py

# Frontend setup (new!)
cd frontend
npm install
npm start
```

## Dependency Comparison

### v1 (Python only)
- openai>=1.0.0
- fastapi>=0.100.0
- uvicorn[standard]>=0.20.0
- pydantic>=2.0.0
- python-multipart>=0.0.6

### v2 
**Backend (Python)**
- Flask>=2.3.0
- Flask-CORS>=4.0.0
- google-generativeai>=0.3.0
- python-dotenv>=1.0.0

**Frontend (Node.js)**
- react@^18.2.0
- axios@^1.4.0
- d3@^7.8.5

## Running Both Versions

You can run both v1 and v2 side-by-side:

```
learning-path-recommender/
├── index.html        ← v1 (original)
├── server.py         ← v1 (original)
├── script.js         ← v1 (original)
├── requirements.txt  ← v1 (original)
│
└── v2-gemini-react/  ← v2 (new)
    ├── backend/
    └── frontend/
```

**v1 Access**: http://127.0.0.1:8000 (set up Live Server)
**v2 Access**: http://localhost:3000 (after npm start)

## Migration Path for Users

If you were using v1:

1. **Keep v1 as backup** (don't delete)
2. **Install Node.js** if you don't have it
3. **Follow v2 setup guide** in SETUP_GUIDE.md
4. **Test v2** with same topics as v1
5. **Compare results** - Gemini may give different trees
6. **Gradually transition** to v2
7. **Archive v1** once comfortable

## Known Differences in Output

Since v1 uses OpenAI and v2 uses Gemini:
- 🔄 Tree structures may vary (different models)
- 🔄 Question wording will be different
- 🔄 Exam difficulty might differ slightly
- ✅ Functionality and flow remain the same
- ✅ Color-coding logic is identical

## Rollback Instructions

If you need to go back to v1:

```bash
# Stop v2 services
# (close React dev server & Flask server)

# Use original files
# v1 still exists in parent directory
cd ..
python server.py
# Then open index.html with Live Server
```

## Next Steps

1. ✅ Complete v2 setup (SETUP_GUIDE.md)
2. ⬜ Test with various topics
3. ⬜ Compare v1 vs v2 outputs
4. ⬜ Deploy to cloud (optional)
5. ⬜ Add user authentication (enhancement)
6. ⬜ Build mobile app (future)
