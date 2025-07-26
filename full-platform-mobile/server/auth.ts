import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Hash password with salt for storage
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare stored password hash with supplied password
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Configure authentication middleware
export function setupAuth(app: Express) {
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "development-secret-key", // Should be set in environment variables
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Since username is now an email, look up by username (which stores email)
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // API route for user registration
  app.post("/api/register", async (req, res, next) => {
    try {
      // Verify registration passcode
      const correctPasscode =
        process.env.REGISTRATION_PASSCODE || "mattmikeryan";
      if (req.body.registrationPasscode !== correctPasscode) {
        return res
          .status(400)
          .json({ message: "Invalid registration passcode" });
      }

      // Username is now an email - check if either username or email already exists
      // Since they should be the same, we check both to handle legacy data
      const existingUserByUsername = await storage.getUserByUsername(
        req.body.username,
      );
      const existingUserByEmail = await storage.getUserByEmail(req.body.email);

      if (existingUserByUsername || existingUserByEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Ensure username and email are the same (both are email addresses)
      const userData = {
        ...req.body,
        username: req.body.email, // Make sure username is set to email
        password: await hashPassword(req.body.password),
      };

      // Remove the passcode from the data we store
      delete userData.registrationPasscode;

      const newUser = await storage.createUser(userData);

      // Log the user in after registration
      req.login(newUser, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });

  // API route for user login
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // If this function is called, authentication was successful
    // req.user contains the authenticated user
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.status(200).json(userWithoutPassword);
  });

  // API route for user logout
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // API route to get current user info
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}
