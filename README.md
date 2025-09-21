# Bridge - Social Connection Platform

Bridge is a social connection app that matches people into small groups based on shared interests for meaningful conversations and friendships.

## Features

- Algorithm-based group matching (no swiping)
- Small groups of 4-6 people
- Real-time messaging
- Interest-based matching across multiple categories
- JWT authentication

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Socket.io Client

**Backend:** Node.js, Express, Prisma ORM, SQLite/PostgreSQL, Socket.io, JWT

## Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/nthottathil/Bridge.git
cd bridge-app
```

2. **Install backend**
```bash
cd server
npm install
npx prisma migrate dev --name init
npm run dev
```

3. **Install frontend** (new terminal)
```bash
cd client
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
bridge-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main application
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Styles
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── src/
│   │   └── index.ts       # Server entry
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
└── README.md
```

## Environment Variables

Create `.env` file in server directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### User
- `GET /api/user/profile` - Get profile (auth required)
- `PUT /api/user/profile` - Update profile
- `POST /api/user/interests` - Set interests

### Groups
- `POST /api/matching/find-group` - Find new group
- `GET /api/groups` - Get user's groups
- `POST /api/groups/:groupId/messages` - Send message

## Usage

1. Create an account via the signup page
2. Select at least 5 interests
3. Click "Find New Group" to get matched
4. Start chatting with your group

## Development

**Backend scripts:**
- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run prisma:studio` - Database GUI

**Frontend scripts:**
- `npm run dev` - Development server
- `npm run build` - Production build

## Database Schema

- **User**: User accounts and profiles
- **Interest**: Available interests
- **Group**: Group chats (4-6 members)
- **Message**: Chat messages
- **GroupMember**: User-group relationships
- **UserInterest**: User-interest relationships

## Known Issues

- Messages don't persist on page refresh
- Matching algorithm needs work
- No image upload functionality yet


## Contact

- **Author**: Neha Thottathil

