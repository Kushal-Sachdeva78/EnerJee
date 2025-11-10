import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Demo credentials - ONLY FOR DEMO/TESTING PURPOSES
const DEMO_USERNAME = "demo1234";
const DEMO_PASSWORD = "123456";

const DEMO_USER = {
  id: "demo-user-001",
  email: "demo@enerjee.app",
  firstName: "Demo",
  lastName: "User",
  profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
};

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Login endpoint - username/password authentication
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate credentials
      if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Upsert user in database
      await storage.upsertUser({
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        firstName: DEMO_USER.firstName,
        lastName: DEMO_USER.lastName,
        profileImageUrl: DEMO_USER.profileImageUrl,
      });

      // Store user in session
      (req.session as any).user = DEMO_USER;
      
      res.json({ success: true, user: DEMO_USER });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    const sessionUser = (req.session as any).user;
    
    if (!sessionUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(sessionUser.id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const sessionUser = (req.session as any).user;

  if (!sessionUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Attach user to request for downstream handlers
  (req as any).user = sessionUser;
  next();
};
