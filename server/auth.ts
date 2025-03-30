import express, { Express, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import { User as SelectUser } from '@shared/schema';
import { OAuth2Client } from 'google-auth-library';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Initialize Google OAuth client
  const googleClient = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'lifepulse-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  };

  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Local Strategy for username/password auth
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password || !(await comparePasswords(password, user.password))) {
        return done(null, false, { message: 'Invalid username or password' });
      } else {
        return done(null, user);
      }
    }),
  );

  // Serialize/deserialize user
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  // Regular email/password registration
  app.post('/api/register', async (req, res, next) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const emailUser = await storage.getUserByEmail(email);
      if (emailUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Log in the new user
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Traditional login endpoint
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || 'Authentication failed' });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // Don't send the password to the client
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Google login endpoint
  app.post('/api/login/google', async (req, res) => {
    try {
      const { token } = req.body;
      
      // Verify the Google token
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ error: 'Invalid token' });
      }
      
      // Check if user exists with this Google ID
      let user = await storage.getUserByGoogleId(payload.sub!);
      
      if (!user) {
        // Check if a user with this email already exists
        user = await storage.getUserByEmail(payload.email);
        
        if (user) {
          // Update existing user with Google info
          user = await storage.updateUser(user.id, {
            googleId: payload.sub,
            googleProfilePic: payload.picture,
            accessToken: token,
          });
        } else {
          // Create new user from Google data
          const displayName = payload.name || 'User';
          const nameParts = displayName.split(' ');
          const firstName = nameParts[0] || 'New';
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'User';
          
          user = await storage.createUser({
            username: payload.email.split('@')[0] + Math.floor(Math.random() * 1000),
            email: payload.email,
            firstName,
            lastName,
            googleId: payload.sub,
            googleProfilePic: payload.picture,
            accessToken: token,
            profileImage: payload.picture,
          });
        }
      }
      
      // Log in the user
      req.login(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: 'Login failed' });
        }
        
        // Don't send sensitive info to the client
        const { password, accessToken, refreshToken, ...userWithoutSensitiveData } = user;
        return res.json(userWithoutSensitiveData);
      });
    } catch (error) {
      console.error('Google login error:', error);
      res.status(500).json({ error: 'Google authentication failed' });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  // Current user endpoint
  app.get('/api/me', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Don't send sensitive info to the client
    const { password, accessToken, refreshToken, ...userWithoutSensitiveData } = req.user;
    res.json(userWithoutSensitiveData);
  });
}