# SkillSwap

A peer-to-peer skill exchange platform. Users offer skills they can teach, and find others who teach what they want to learn — then swap knowledge directly.

## Features

- **Auth** — JWT-based registration & login
- **Smart Matching** — algorithmic match scoring by skill overlap + rating boost
- **Recommendation Feed** — personalized home feed showing top matches
- **Skill Search** — search users by any skill in real time
- **Real-time Chat** — Socket.io powered in-app messaging per accepted swap
- **Review & Rating System** — 1–5 star reviews after completed swaps
- **In-app Notifications** — live toast + notification centre for new requests, accepted swaps, messages, and reviews
- **Swap Management** — send, accept, reject swap requests

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express 4 |
| Realtime | Socket.io v4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

## Project Structure

```
skillswap/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── notificationController.js
│   │   ├── reviewController.js
│   │   ├── swapController.js
│   │   └── userController.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Review.js
│   │   ├── SwapRequest.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── swapRoutes.js
│   │   └── userRoutes.js
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   ├── ReviewModal.jsx
        │   ├── Shell.jsx
        │   └── ToastNotification.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── NotificationContext.jsx
        │   └── SocketContext.jsx
        └── pages/
            ├── Chat.jsx
            ├── Dashboard.jsx
            ├── Discover.jsx
            ├── Login.jsx
            ├── Notifications.jsx
            ├── Profile.jsx
            ├── Register.jsx
            └── Swaps.jsx
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env if backend is not on localhost:5000
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

## API Reference

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List users (optional `?skill=X` search) |
| GET | `/api/users/matches` | Recommendation feed |
| GET | `/api/users/:id` | Get user + rating summary |
| PUT | `/api/users/me` | Update profile |

### Swaps
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/swaps` | Create swap request |
| GET | `/api/swaps` | My swaps |
| PATCH | `/api/swaps/:id` | Accept / reject |

### Chat
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/chat/:swapId/messages` | Load messages |
| POST | `/api/chat/:swapId/messages` | Send message (REST fallback) |

### Reviews
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/reviews` | Create review |
| GET | `/api/reviews/user/:userId` | User reviews + avg rating |
| GET | `/api/reviews/swap/:swapId` | Check if reviewed |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications/read-all` | Mark all read |
| PATCH | `/api/notifications/:id/read` | Mark one read |

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_swap` | `swapId` | Join a chat room |
| `leave_swap` | `swapId` | Leave a chat room |
| `send_message` | `{ swapId, text }` | Send a message |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | Message object | New chat message |
| `notification` | `{ type, title, body }` | In-app notification |

## Production Deployment

### Environment variables (backend)
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=https://your-frontend-domain.com
```

### Environment variables (frontend)
```
VITE_API_URL=https://your-api-domain.com/api
VITE_SOCKET_URL=https://your-api-domain.com
```

### Build frontend
```bash
cd frontend && npm run build
# Serve the dist/ folder via nginx, Vercel, Netlify, etc.
```

### Deployment options
- **Backend**: Railway, Render, Fly.io, or any Node.js host
- **Frontend**: Vercel, Netlify, or serve `dist/` from the same host
- **Database**: MongoDB Atlas (free tier works)
