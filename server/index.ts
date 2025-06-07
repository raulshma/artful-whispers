import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { auth } from "./auth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:8081",
  "http://localhost:19006", // Default Expo web port
  "http://192.168.1.3:5000", // Mobile app IP (corrected)
  "http://192.168.1.9:5000", // Alternative mobile IP
  "http://192.168.1.100:5000", // Alternative mobile IP
  "http://10.0.2.2:5000", // Android emulator
  "exp://192.168.0.194:8081",
  "exp://192.168.1.3:8081", // Updated Expo development (corrected)
  "exp://192.168.1.9:8081", // Alternative Expo development
  "exp://localhost:8081",
];

// Add CORS middleware for mobile app support
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`🌐 CORS check - Origin: ${origin}, Path: ${req.path}`);
  
  // Allow requests with no origin (like mobile apps) or matching origins
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    console.log(`✅ CORS allowed for origin: ${origin || 'no-origin'}`);
  } else {
    // For development, be more permissive with mobile app origins
    if (origin && (origin.includes('192.168.') || origin.includes('10.0.') || origin.includes('localhost'))) {
      res.header("Access-Control-Allow-Origin", origin);
      console.log(`✅ CORS allowed for development origin: ${origin}`);
    } else {
      console.log(`❌ CORS not allowed for origin: ${origin}`);
      console.log(`📝 Allowed origins:`, allowedOrigins);
    }
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, Set-Cookie"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    console.log(`🔄 CORS preflight for ${req.path}`);
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add better-auth API routes
app.all("/api/auth/*", async (req, res) => {
  console.log(`🔐 Auth request: ${req.method} ${req.url} from origin: ${req.headers.origin}`);
  console.log(`🔐 Auth headers:`, {
    origin: req.headers.origin,
    cookie: req.headers.cookie,
    authorization: req.headers.authorization,
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent']
  });
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`🔐 Auth request body:`, req.body);
  }
  
  // Convert Express request to Web API Request
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const webRequest = new Request(url, {
    method: req.method,
    headers: req.headers as any,
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? JSON.stringify(req.body)
        : undefined,
  });

  try {
    const response = await auth.handler(webRequest);
    console.log(`🔐 Auth response: ${response.status} ${response.statusText}`);
    console.log(`🔐 Auth response headers:`, Object.fromEntries(response.headers.entries()));

    // Convert Web API Response to Express response
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
      if (key.toLowerCase() === 'set-cookie') {
        console.log(`🍪 Setting cookie:`, value);
      }
    });

    const body = await response.text();
    console.log(`🔐 Auth response body:`, body.substring(0, 200) + (body.length > 200 ? '...' : ''));
    res.send(body);
  } catch (error) {
    console.error(`🔐 Auth handler error:`, error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
