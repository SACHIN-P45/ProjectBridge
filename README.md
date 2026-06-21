# ProjectBridge 🌉

> **Where Students Meet Expert Developers for Academic Project Development**

A full-stack MERN application with real-time chat, Razorpay payments, Cloudinary file uploads, and role-based dashboards.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- A Cloudinary account (free tier works)
- A Razorpay account (test keys for development)

---

### 1. Backend Setup

```bash
cd server
npm install
```

Edit `.env` with your credentials:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/projectbridge
JWT_SECRET=your_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Visit: http://localhost:5173

---

## 🔑 Adding Razorpay Script

Add this to `client/index.html` before `</body>`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## 📁 Project Structure

```
projectBridge/
├── server/           # Express + MongoDB backend
│   ├── config/       # DB, Cloudinary, Razorpay
│   ├── controllers/  # Business logic
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── middleware/   # Auth, role, upload
│   ├── socket/       # Socket.IO handler
│   └── server.js     # Entry point
│
└── client/           # React + Vite frontend
    ├── src/
    │   ├── api/      # Axios instance
    │   ├── components/
    │   ├── context/  # Socket, Theme
    │   ├── pages/    # Student & Developer pages
    │   └── store/    # Redux slices
    └── vite.config.js
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| State | Redux Toolkit |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT |
| Real-time | Socket.IO |
| Payments | Razorpay |
| Files | Cloudinary + Multer |
| Routing | React Router v6 |
