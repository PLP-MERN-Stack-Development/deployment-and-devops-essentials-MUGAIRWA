# Real-Time Chat Application with Socket.io

A full-featured real-time chat application built with React and Socket.io, enabling seamless bidirectional communication between clients and server. This application demonstrates advanced real-time features including messaging, private chats, file sharing, notifications, and more.

## 🚀 Project Overview

This project implements a comprehensive chat system that allows users to communicate in real-time through various channels. The application features a modern React frontend with a robust Node.js backend powered by Socket.io for instant messaging capabilities. Users can join global chat rooms, send private messages, share files, react to messages, and receive notifications across devices.

The application showcases best practices in real-time web development, including connection management, state synchronization, and performance optimization.

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework for styling
- **Clerk** - Authentication and user management
- **Socket.io Client** - Real-time bidirectional communication
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Socket.io** - Real-time communication library
- **MongoDB Atlas** - Cloud database service
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing

### Development Tools
- **Nodemon** - Automatic server restart during development
- **ESLint** - Code linting and formatting
- **Vite Plugin React** - React integration for Vite

### Deployment & DevOps
- **GitHub Actions** - CI/CD pipelines
- **Render/Railway/Heroku** - Backend deployment platforms
- **Vercel/Netlify** - Frontend deployment platforms
- **MongoDB Atlas** - Database hosting

# Deployed Applications

- **Backend URL**: https://deployment-and-devops-essentials-mugairwa.onrender.com
- **Frontend URL**: https://deployment-and-devops-essentials-mu-ten.vercel.app/

## ✨ Features Implemented

### Core Chat Functionality
- ✅ Real-time messaging with instant delivery
- ✅ User authentication with username-based system
- ✅ Global chat room for all users
- ✅ Message timestamps and sender identification
- ✅ Online/offline user status indicators
- ✅ Connection status monitoring

### Advanced Chat Features
- ✅ Private messaging between users
- ✅ Multiple chat rooms and channels
- ✅ "User is typing" indicators
- ✅ File and image sharing capabilities
- ✅ Message reactions (👍 ❤️ 😂)
- ✅ Read receipts for message delivery confirmation
- ✅ Message pagination for performance
- ✅ Message search functionality (API ready)

### Real-Time Notifications
- ✅ Sound notifications for new messages
- ✅ Browser notifications (Web Notifications API)
- ✅ Unread message count in document title
- ✅ User join/leave notifications
- ✅ Private message alerts

### Performance & UX Optimizations
- ✅ Automatic reconnection logic for dropped connections
- ✅ Message delivery acknowledgments
- ✅ Responsive design for desktop and mobile
- ✅ Dark mode support
- ✅ Efficient state management
- ✅ Memory management for message history

## 📁 Project Structure

```
deployment-and-devops-essentials-MUGAIRWA/
├── client/                          # React frontend application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Utility libraries
│   │   ├── pages/                   # Page components
│   │   ├── App.jsx                  # Main application component
│   │   ├── index.css                # Global styles with TailwindCSS
│   │   └── main.jsx                 # Application entry point
│   ├── index.html                   # HTML template
│   ├── package.json                 # Client dependencies and scripts
│   ├── vite.config.js               # Vite configuration
│   └── README.md                    # Frontend documentation
├── server/                          # Node.js backend application
│   ├── src/
│   │   ├── config/                  # Database and configuration
│   │   ├── controllers/             # Route controllers
│   │   ├── middleware/              # Express middleware
│   │   ├── models/                  # Mongoose models
│   │   ├── routes/                  # API routes
│   │   ├── utils/                   # Utility functions
│   │   └── server.js                # Main server file
│   └── package.json                 # Server dependencies and scripts
├── .github/workflows/               # GitHub Actions CI/CD workflows
├── Week7-Assignment.md              # Assignment specifications
├── README.md                        # Project documentation
└── TODO.md                          # Task tracking
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- MongoDB Atlas account
- Clerk account for authentication
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd deployment-and-devops-essentials-MUGAIRWA
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**
   Create `.env` files in both client and server directories:

   **Server (.env)**
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

   **Client (.env.local)**
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   VITE_API_BASE_URL=http://localhost:5000
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The client will be available at `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

## 📖 Usage

### Getting Started
1. Open the application in your browser
2. Enter a username to connect to the chat
3. Start sending messages in the global chat room

### Key Features Usage

#### Sending Messages
- Type your message in the input field
- Press Enter or click Send to broadcast to the current room

#### Private Messaging
- Click on a user from the online users list
- Send messages that will only be visible to the selected user

#### Creating Rooms
- Enter a room name in the "New room name" field
- Click Create to add a new chat room
- Switch between rooms using the room buttons

#### File Sharing
- Click the file input to select an image or document
- Click Upload to share the file with other users
- Images display inline, other files show as download links

#### Message Reactions
- Hover over a message to see reaction buttons
- Click 👍, ❤️, or 😂 to add reactions to messages

#### Notifications
- Grant browser notification permission when prompted
- Receive sound and visual notifications for new messages
- Unread count appears in the browser tab title

## 🔌 API Endpoints

### REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages` | Get paginated messages for a room |
| GET | `/api/users` | Get list of online users |
| GET | `/api/rooms` | Get list of available rooms |
| POST | `/upload` | Upload a file |

### Query Parameters for `/api/messages`
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of messages per page (default: 20)
- `room` (string): Room name to filter messages (default: 'general')

### Socket.io Events

#### Client to Server Events
- `user_join` - User joins the chat
- `send_message` - Send a message to current room
- `private_message` - Send private message to specific user
- `join_room` - Join a specific room
- `create_room` - Create a new room
- `send_file` - Share a file
- `add_reaction` - Add reaction to message
- `mark_as_read` - Mark message as read
- `typing` - Update typing status

#### Server to Client Events
- `receive_message` - New message in room
- `private_message` - New private message
- `user_list` - Updated list of online users
- `user_joined` - User joined notification
- `user_left` - User left notification
- `typing_users` - List of currently typing users
- `message_updated` - Message updated (reactions/read receipts)
- `room_list` - Updated list of rooms
- `message_ack` - Message delivery acknowledgment

## 🚀 Deployment

### Backend Deployment
The backend can be deployed to services like:
- **Render** - Free tier available
- **Railway** - Easy Node.js deployment
- **Heroku** - Traditional PaaS
- **Vercel** - Serverless functions (with modifications)

### Frontend Deployment
The frontend can be deployed to:
- **Vercel** - Optimized for React apps
- **Netlify** - Static site hosting with form handling
- **GitHub Pages** - Free hosting for public repositories

### Environment Variables for Production
```env
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Build Commands
```bash
# Build client for production
cd client
npm run build

# Start server in production
cd server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

