// server/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ==================== MIDDLEWARE ====================
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==================== USER ROUTES ====================
app.get('/api/user/profile', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        interests: {
          include: {
            interest: true
          }
        },
        groups: {
          include: {
            group: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req: any, res) => {
  try {
    const { name, bio, age, location } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name,
        bio,
        age,
        location
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/api/user/interests', authenticateToken, async (req: any, res) => {
  try {
    const { interestIds } = req.body;

    // Remove existing interests
    await prisma.userInterest.deleteMany({
      where: { userId: req.user.userId }
    });

    // Add new interests
    const interests = await Promise.all(
      interestIds.map((interestId: string) =>
        prisma.userInterest.create({
          data: {
            userId: req.user.userId,
            interestId
          }
        })
      )
    );

    res.json({ success: true, interests });
  } catch (error) {
    console.error('Interest update error:', error);
    res.status(500).json({ error: 'Failed to update interests' });
  }
});

// ==================== INTERESTS ROUTES ====================
app.get('/api/interests', async (req, res) => {
  try {
    const interests = await prisma.interest.findMany({
      orderBy: { category: 'asc' }
    });

    res.json(interests);
  } catch (error) {
    console.error('Interests fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
});

// ==================== MATCHING ROUTES ====================
app.post('/api/matching/find-group', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    // Get user with interests
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        interests: {
          include: {
            interest: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Simple matching algorithm - find users with similar interests
    const userInterestIds = user.interests.map(ui => ui.interestId);

    // Find other users with at least 2 common interests
    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { not: userId },
        interests: {
          some: {
            interestId: { in: userInterestIds }
          }
        },
        groups: {
          none: {} // Users not in any group yet
        }
      },
      include: {
        interests: true
      },
      take: 5 // Get up to 5 matches for a group of 6
    });

    if (potentialMatches.length < 3) {
      return res.json({ 
        message: 'Not enough matches available. Please try again later.',
        matched: false 
      });
    }

    // Create a new group
    const group = await prisma.group.create({
      data: {
        name: `Group ${Date.now()}`,
        description: 'A new group of friends with shared interests',
        members: {
          create: [
            { userId, role: 'member' },
            ...potentialMatches.map(match => ({
              userId: match.id,
              role: 'member' as const
            }))
          ]
        },
        interests: {
          create: userInterestIds.slice(0, 3).map(interestId => ({
            interestId
          }))
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        interests: {
          include: {
            interest: true
          }
        }
      }
    });

    res.json({
      matched: true,
      group
    });
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

// ==================== GROUP ROUTES ====================
app.get('/api/groups', authenticateToken, async (req: any, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: req.user.userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        interests: {
          include: {
            interest: true
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    res.json(groups);
  } catch (error) {
    console.error('Groups fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

app.get('/api/groups/:groupId', authenticateToken, async (req: any, res) => {
  try {
    const { groupId } = req.params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true
          }
        },
        interests: {
          include: {
            interest: true
          }
        },
        messages: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(m => m.userId === req.user.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    res.json(group);
  } catch (error) {
    console.error('Group fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// ==================== CHAT/MESSAGE ROUTES ====================
app.post('/api/groups/:groupId/messages', authenticateToken, async (req: any, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;

    const message = await prisma.message.create({
      data: {
        content,
        userId: req.user.userId,
        groupId
      },
      include: {
        user: true
      }
    });

    // Emit to socket room
    io.to(groupId).emit('new_message', message);

    res.json(message);
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ==================== SOCKET.IO HANDLERS ====================
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_group', (groupId: string) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  socket.on('leave_group', (groupId: string) => {
    socket.leave(groupId);
    console.log(`User ${socket.id} left group ${groupId}`);
  });

  socket.on('send_message', async (data) => {
    const { groupId, userId, content } = data;

    try {
      const message = await prisma.message.create({
        data: {
          content,
          userId,
          groupId
        },
        include: {
          user: true
        }
      });

      io.to(groupId).emit('new_message', message);
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ==================== SEED DATA ====================
async function seedDatabase() {
  const interestCategories = [
    { category: 'Technology', interests: ['AI/ML', 'Web Development', 'Blockchain', 'Cybersecurity', 'Gaming'] },
    { category: 'Science', interests: ['Physics', 'Biology', 'Chemistry', 'Astronomy', 'Environmental Science'] },
    { category: 'Arts', interests: ['Music', 'Painting', 'Photography', 'Film', 'Creative Writing'] },
    { category: 'Sports', interests: ['Basketball', 'Soccer', 'Tennis', 'Running', 'Yoga'] },
    { category: 'Business', interests: ['Startups', 'Investing', 'Marketing', 'Entrepreneurship', 'Finance'] },
    { category: 'Lifestyle', interests: ['Cooking', 'Travel', 'Fashion', 'Wellness', 'Meditation'] },
    { category: 'Philosophy', interests: ['Ethics', 'Existentialism', 'Political Philosophy', 'Stoicism', 'Eastern Philosophy'] },
    { category: 'Social Issues', interests: ['Climate Change', 'Social Justice', 'Education', 'Mental Health', 'Urban Planning'] }
  ];

  for (const cat of interestCategories) {
    for (const interestName of cat.interests) {
      await prisma.interest.upsert({
        where: { name: interestName },
        update: {},
        create: {
          name: interestName,
          category: cat.category
        }
      });
    }
  }

  console.log('Database seeded with interests');
}

// ==================== SERVER STARTUP ====================
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Seed database on first run
  const interestCount = await prisma.interest.count();
  if (interestCount === 0) {
    await seedDatabase();
  }
});