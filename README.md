# Connectly

Connectly is a modern, responsive full-stack social media application developed for the **CodeAlpha Full Stack Development Internship (Task 2)**. Built using Node.js, Express, MongoDB, and Vanilla JavaScript, Connectly delivers a real-world social experience with user profiles, text and image posts, real-time engagement (likes & comments), follow relationships, user discovery, notifications, and an adaptive theme system (Light & Dark modes).

---

## 🎨 Design & Visual Identity

Connectly features an editorial aesthetic with support for both Light and Dark themes:

- **Light Mode:** Slate-white surfaces (`#FFFFFF`), light page background (`#F8FAFC`), deep slate typography (`#0F172A`), and indigo primary actions (`#6366F1`).
- **Dark Mode:** Deep slate background (`#0F172A`), dark card surfaces (`#1E293B`), white text (`#FFFFFF`), and indigo/purple accents (`#6366F1` / `#8B5CF6`).
- **Responsive Layout:** Desktop top navigation header and mobile-first bottom action bar with touch targets (min 44px).

---

## ✨ Features

- **User Registration & Authentication:** Secure login & registration using JWT (JSON Web Tokens) and `bcryptjs` password hashing.
- **User Profiles:** Custom avatars, bio, followers count, following count, and published post stream.
- **Follow & Unfollow System:** Dynamic relationship tracking with self-follow and duplicate follow prevention.
- **Followers & Following Lists:** Interactive modal views displaying creator connection lists.
- **Post Management:** Create, view, edit, and delete text and image posts.
- **Likes & Comments:** Like/unlike posts with heart pulse animations, and inline comment threads with owner deletion permissions.
- **User Search:** Real-time live search by username.
- **Notifications System:** Alert updates for new followers, post likes, and comments with read/unread tracking.
- **Theme Manager:** Real-time Light & Dark mode toggle with preference persistence in `localStorage`.
- **Toast Notifications:** Non-blocking visual feedback for actions and errors.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** & **CSS3** (CSS Custom Properties, Flexbox & CSS Grid)
- **Vanilla JavaScript (ES6+)** (No heavy frontend frameworks)

### Backend
- **Node.js** & **Express.js**
- **RESTful APIs** with structured controllers and routers
- **JWT (`jsonwebtoken`)** for stateless authentication
- **bcryptjs** for password hashing
- **cors** & **dotenv**

### Database
- **MongoDB** & **Mongoose ODM**
- Persistent MongoDB storage with embedded fallback for zero-config local development.

---

## 📁 Project Structure

```
CodeAlpha_SocialMediaPlatform/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── postRoutes.js
│   │   ├── commentRoutes.js
│   │   └── notificationRoutes.js
│   ├── utils/
│   │   ├── db.js
│   │   └── seed.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── feed.js
│   │   ├── profile.js
│   │   ├── search.js
│   │   ├── notifications.js
│   │   ├── create-post.js
│   │   ├── theme.js
│   │   ├── toast.js
│   │   └── nav.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── feed.html
│   ├── profile.html
│   ├── search.html
│   ├── notifications.html
│   ├── create-post.html
│   └── 404.html
│
└── README.md
```

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and set your variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

> **Note:** Never commit real secrets or passwords to Git. The `.env` file is excluded in `.gitignore`.

---

## 🚀 Installation & Running

### 1. Install Dependencies

Navigate to the `backend/` directory and install dependencies:

```bash
cd backend
npm install
```

### 2. Start the Backend Server

Start the development server with auto-reload:

```bash
npm run dev
# or for production
npm start
```

### 3. Open the Application

Open your browser and navigate to:
```
http://localhost:5000
```

---

## 🗄️ Database Setup

Connectly supports two MongoDB deployment modes:

1. **Local MongoDB Instance:**
   Set `MONGO_URI=mongodb://localhost:27017/connectly` in `backend/.env`.
2. **MongoDB Atlas (Cloud):**
   Set your cloud URI in `backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/connectly?retryWrites=true&w=majority
   ```

When started for the first time, the backend automatically seeds sample accounts for instant testing.

---

## 👥 Demo Accounts

You can test the application using pre-configured demo credentials or register a new user:

- **User 1:** `alex@example.com` / `password123`
- **User 2:** `elena@example.com` / `password123`

---

## 📡 API Overview

| Group | Method | Endpoint | Description | Auth Required |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register new user | No |
| **Auth** | `POST` | `/api/auth/login` | Login user & return JWT | No |
| **Auth** | `GET` | `/api/auth/me` | Get current user details | Yes |
| **Users** | `GET` | `/api/users/search?q=` | Search users by username | No |
| **Users** | `GET` | `/api/users/:id` | Get user profile details | No |
| **Users** | `PUT` | `/api/users/:id` | Update profile (username, bio, avatar) | Yes |
| **Users** | `POST` | `/api/users/:id/follow` | Follow a user | Yes |
| **Users** | `DELETE` | `/api/users/:id/follow` | Unfollow a user | Yes |
| **Posts** | `GET` | `/api/posts` | Get feed posts (all or following) | No |
| **Posts** | `POST` | `/api/posts` | Publish text or image post | Yes |
| **Posts** | `PUT` | `/api/posts/:id` | Edit own post | Yes |
| **Posts** | `DELETE` | `/api/posts/:id` | Delete own post | Yes |
| **Posts** | `POST` | `/api/posts/:id/like` | Like a post | Yes |
| **Posts** | `DELETE` | `/api/posts/:id/like` | Unlike a post | Yes |
| **Comments** | `GET` | `/api/posts/:id/comments` | Get comments for a post | No |
| **Comments** | `POST` | `/api/posts/:id/comments` | Add comment to post | Yes |
| **Comments** | `DELETE` | `/api/comments/:id` | Delete comment | Yes |
| **Notifications** | `GET` | `/api/notifications` | Fetch user notifications | Yes |
| **Notifications** | `PUT` | `/api/notifications/:id/read` | Mark single notification read | Yes |
| **Notifications** | `PUT` | `/api/notifications/read-all` | Mark all notifications read | Yes |

---

## 📸 Screenshots

*(Add screenshots of Connectly here before uploading to GitHub)*

- **Home Feed (Light & Dark Mode)**
- **User Profile Page**
- **Mobile Navigation View**
- **Create Post Modal**

---

## 🔮 Future Improvements

1. Media upload integration via Cloudinary or AWS S3.
2. WebSockets / Socket.io for instant real-time notification pushes.
3. Direct messaging between connected users.

---

## 📜 License & Acknowledgements

Developed for the **CodeAlpha Full Stack Development Internship Program**.
