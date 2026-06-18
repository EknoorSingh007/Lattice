# Lattice

Lattice is a real-time peer-to-peer learning platform that empowers users to teach and learn new skills through live video sessions, collaborative communication, and secure authentication. Built using the MERN stack, Lattice integrates modern web technologies like WebRTC, Socket.io, and OAuth to create a seamless and scalable remote learning experience.

## 🚀 Features

- 🔗 **Live Video Calling** — Real-time 1-on-1 or group video sessions powered by WebRTC.
- 📡 **Real-Time Signaling** — Lightning-fast connection setup and messaging via Socket.io.
- 🔐 **Secure Authentication** — JWT-based login and OAuth integrations with Google and GitHub.
- 🧑‍🤝‍🧑 **Peer Learning Ecosystem** — Connect with others to share skills, teach, or join sessions.
- 📱 **Responsive Design** — Fully mobile-compatible and user-friendly UI built with React.js.

## 🛠️ Tech Stack

| Technology | Description |
|---|---|
| MongoDB | NoSQL database for storing user/session data |
| Express.js | Backend framework for routing & APIs |
| React.js | Frontend UI with hooks & component design |
| Node.js | JavaScript runtime for the backend |
| Socket.io | Real-time signaling for video/chat |
| WebRTC | Peer-to-peer media communication |
| JWT | Secure session-based authentication |
| OAuth 2.0 | Third-party login via Google & GitHub |

## 📁 Folder Structure

```
lattice/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── assets/
│   ├── public/
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
├── backend/                # Express backend
│   ├── routes/
│   ├── Controllers/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── .gitignore
├── README.md
└── package.json
```

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/eknoorsingh007/Lattice.git
cd Lattice
```

### 2. Set Up Environment Variables

Create a `.env` file inside the `backend/` folder with the following:

```env
MONGO_URI=your_mongo_db_connection_string
SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

### 3. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 4. Run the Application

Open two terminals:

```bash
# Terminal 1: Run the React frontend
cd frontend
npm start

# Terminal 2: Run the Express backend
cd backend
npm run dev
```

- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:4000`

## 👥 Contributors

| Name | Role |
|---|---|
| Eknoor Singh | Developer |
| Vipul | Developer |
