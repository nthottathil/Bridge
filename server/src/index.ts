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
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

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
    const { email, password, name, age } = req.body;

    console.log('Signup attempt:', { email, name, age });

    // Validate age
    const userAge = age ? parseInt(age) : null;
    if (userAge && userAge < 18) {
      return res.status(400).json({ error: 'You must be 18 or older to use Bridge' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with only the fields that exist in our schema
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        age: userAge
      }
    });

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

    console.log('User created successfully:', user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age
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

    console.log('Login attempt:', email);

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

    console.log('Login successful:', user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar,
        age: user.age
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
        age: age ? parseInt(age) : undefined,
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

// ==================== ONBOARDING ROUTE (SIMPLIFIED) ====================
app.post('/api/user/onboarding', authenticateToken, async (req: any, res) => {
  try {
    const { personality, interests, goals, expertise, description } = req.body;
    const userId = req.user.userId;

    console.log('Onboarding data received:', { userId, personality, interests: interests?.length });

    // For now, just save the basic info we can
    if (personality || description) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          personality,
          description,
          onboardingCompleted: true
        }
      });
    }

    // Handle interests
    if (interests && interests.length > 0) {
      // Remove existing interests
      await prisma.userInterest.deleteMany({ where: { userId } });

      // Add new interests
      for (const interestName of interests) {
        let interest = await prisma.interest.findFirst({
          where: { name: interestName }
        });

        if (!interest) {
          interest = await prisma.interest.create({
            data: {
              name: interestName,
              category: 'User Generated'
            }
          });
        }

        await prisma.userInterest.create({
          data: {
            userId,
            interestId: interest.id
          }
        });
      }
    }

    res.json({ success: true, message: 'Onboarding completed successfully' });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
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

// ==================== MATCHING ROUTES (SIMPLIFIED) ====================
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

    // Simple matching - find users with similar interests
    const userInterestIds = user.interests.map(ui => ui.interestId);

    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { not: userId },
        interests: {
          some: {
            interestId: { in: userInterestIds }
          }
        }
      },
      include: {
        interests: true
      },
      take: 5
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
        name: `${user.name}'s Tribe`,
        description: 'A new group of friends with shared interests',
        members: {
          create: [
            { userId, role: 'member' },
            ...potentialMatches.slice(0, 4).map(match => ({
              userId: match.id,
              role: 'member' as const
            }))
          ]
        }
      },
      include: {
        members: {
          include: {
            user: true
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
    { category: 'Sports', interests: ['Basketball', 'Soccer', 'Tennis', 'Running', 'Yoga', 'Badminton'] },
    { category: 'Business', interests: ['Startups', 'Investing', 'Marketing', 'Entrepreneurship', 'Finance'] },
    { category: 'Lifestyle', interests: ['Cooking', 'Travel', 'Fashion', 'Wellness', 'Meditation'] },
    { category: 'Current Affairs', interests: ['Geopolitics', 'Climate Change', 'Social Justice', 'Technology Trends'] }
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api/test`);
  
  // Seed database on first run
  const interestCount = await prisma.interest.count();
  if (interestCount === 0) {
    await seedDatabase();
  }
});