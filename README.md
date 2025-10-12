# 🌉 Bridge - Find Your Tribe

Bridge is an innovative social connection platform that uses intelligent matching algorithms to connect like-minded individuals in small, meaningful groups. Unlike traditional social apps, Bridge focuses on quality over quantity, creating tribes of 4-6 people based on personality compatibility, shared interests, and complementary expertise.

## ✨ Features

### Core Features
- **Smart Matching Algorithm** - Advanced compatibility scoring based on personality, interests, goals, and expertise
- **Small Group Focus** - Intimate groups of 4-6 people for meaningful connections
- **Age Verification** - 18+ only platform with government ID verification flow
- **Comprehensive Onboarding** - Detailed personality and interest assessment
- **Real-time Messaging** - WebSocket-powered group chat
- **Secure Authentication** - JWT-based auth with bcrypt password hashing

### Onboarding Process
1. **Age Verification** - Users must be 18 or older
2. **Government ID Check** - Verification screen for trust and safety
3. **Personality Assessment** - Choose from 6 personality types
4. **Interest Selection** - Select from 40+ interests across 7 categories
5. **Goal Setting** - Define personal and professional objectives
6. **Expertise Sharing** - Specify knowledge areas to share with others
7. **Personal Description** - 30-word self-description

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icons

### Backend
- **Node.js & Express** - Server framework
- **TypeScript** - Type-safe development
- **Prisma ORM** - Modern database toolkit
- **SQLite** - Development database (PostgreSQL ready)
- **Socket.io** - WebSocket server
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Git
- Windows/Mac/Linux OS

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Bridge.git
cd Bridge
```

2. **Backend Setup**
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
echo PORT=5000 > .env
echo NODE_ENV=development >> .env
echo DATABASE_URL="file:./dev.db" >> .env
echo JWT_SECRET=your-secret-key-change-in-production >> .env
echo CLIENT_URL=http://localhost:5173 >> .env

# Setup database
npx prisma generate
npx prisma db push

# Start the server
npm run dev
```

3. **Frontend Setup** (New Terminal)
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173 (or 5174 if 5173 is in use)
- Backend API: http://localhost:5000
- Test endpoint: http://localhost:5000/api/test

## 🗂️ Project Structure

```
Bridge/
├── client/                        # React frontend
│   ├── src/
│   │   ├── App.jsx               # Main application with all views
│   │   ├── main.jsx              # Application entry point
│   │   └── index.css             # Tailwind CSS styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                        # Node.js backend
│   ├── src/
│   │   └── index.ts              # Express server with all routes
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create `.env` in the server directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"  # SQLite for dev, use PostgreSQL URL for production
JWT_SECRET=your-super-secret-jwt-key-change-this
CLIENT_URL=http://localhost:5173
```

## 🛣️ API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create new account | No |
| POST | `/api/auth/login` | Login user | No |

### User Profile
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/profile` | Get user profile | Yes |
| PUT | `/api/user/profile` | Update profile | Yes |
| POST | `/api/user/interests` | Update interests | Yes |
| POST | `/api/user/onboarding` | Complete onboarding | Yes |

### Matching & Groups
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/matching/find-group` | Find compatible group | Yes |
| GET | `/api/groups` | Get user's groups | Yes |
| GET | `/api/groups/:groupId` | Get specific group | Yes |

### Messaging
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/groups/:groupId/messages` | Send message | Yes |

### Other
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/interests` | Get all interests | No |
| GET | `/api/test` | Test server connection | No |

## 📱 Application Flow

1. **Landing Page** → User arrives at the platform
2. **Sign Up** → Create account with name, email, age, password
3. **Gov ID Verification** → Trust and safety verification screen
4. **Onboarding** → Complete personality and interest assessment
5. **Matching** → Algorithm finds compatible tribe members
6. **Dashboard** → View groups and start chatting

## 🎯 Matching Algorithm

The matching algorithm considers multiple factors:

- **Personality Compatibility** (25 points) - Similar personality types
- **Shared Interests** (10 points per match) - Common hobbies and topics
- **Shared Goals** (15 points per match) - Aligned objectives
- **Complementary Expertise** (20 points) - Diverse knowledge areas
- **Age Proximity** (±5 years) - Similar life stages

Groups are formed with 4-6 members who score highest in compatibility.

## 🔐 Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **CORS Protection** - Configured for specific origins
- **Input Validation** - Server-side validation
- **Age Verification** - 18+ requirement
- **SQL Injection Protection** - Prisma ORM parameterized queries

## 🚦 Development Scripts

### Backend Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open Prisma Studio GUI
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```powershell
# Windows PowerShell
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**CORS Errors**
- Ensure both servers are running
- Check that CLIENT_URL in .env matches your React app URL
- Try using `127.0.0.1` instead of `localhost`

**Database Issues**
```bash
# Reset database completely
npx prisma migrate reset --force

# Or just push schema changes
npx prisma db push
```

**TypeScript Errors**
```bash
# Regenerate Prisma types
npx prisma generate

# Clear npm cache
npm cache clean --force
npm install
```

## 🎨 UI Features

- **Gradient Backgrounds** - Purple to blue gradients throughout
- **Glassmorphism** - Frosted glass effect on cards
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - Loading states and transitions
- **Dark Theme** - Easy on the eyes
- **Accessibility** - Semantic HTML and ARIA labels

## 📈 Future Enhancements

- [ ] Video chat integration
- [ ] Mobile app (React Native)
- [ ] AI-powered conversation starters
- [ ] Event planning within groups
- [ ] Skill exchange marketplace
- [ ] Group achievements and badges
- [ ] Advanced privacy controls
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)
- [ ] Email notifications

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contact

- **Author**: Neha Thottathil
- **Email**: nthottathil@live.co.uk
- **GitHub**: [@nthottathil](https://github.com/nthottathil)

