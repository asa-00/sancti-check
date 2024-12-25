import express, { Request, Response, NextFunction } from "express";
import https from 'https';
import fs from 'fs';
import passport from 'passport';
import session from 'express-session';
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./database/db";
import logger from "./src/utils/logger";
import authRoutes from "./src/routes/authRoutes";
import clientRoutes from "./src/routes/clientRoutes";
import unSanctionsRoutes from "./src/routes/unSanctionsRoutes";
import ofacSanctionsRoutes from "./src/routes/ofacSanctionsRoutes";
import euSanctionsRoutes from "./src/routes/euSanctionsRoutes";
import sanctionsAggregatorRoutes from "./src/routes/sanctionsAggregatorRoutes";
import ukSanctionRoutes from "./src/routes/ukSanctionsRoutes";
import { errorHandler } from "./src/utils/errorHandler";
import authMiddleware from "./src/middleware/authMiddleware";
import userRoutes from "./src/routes/userRoutes";
import highQualityResultRoutes from "./src/routes/highQualityResultRoutes";

dotenv.config();

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 3000;
const SERVER_HOST = process.env.SERVER_HOST;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: true, cookie: { secure: true } }));
app.use(passport.initialize());
app.use(passport.session());
app.use("/public", express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/clients", authMiddleware, clientRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use('/api/high-quality-results', highQualityResultRoutes);
app.use("/api/sanctions/un", authMiddleware, unSanctionsRoutes);
app.use("/api/sanctions/ofac", authMiddleware, ofacSanctionsRoutes);
app.use("/api/sanctions/eu", authMiddleware, euSanctionsRoutes);
app.use("/api/sanctions/uk", authMiddleware, ukSanctionRoutes);
app.use("/api/sanctions", authMiddleware, sanctionsAggregatorRoutes);

app.use("/api/health", (req: Request, res: Response): void => {
  res.status(200).json({ message: "Server up and running!" });
});

app.use((req, res, next) => {
  if (req.secure) {
    return next();
  }
  res.redirect(`https://${req.headers.host}${req.url}`);
});

const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH as string),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH as string)
};

https.createServer(httpsOptions, app).listen(9756, (err?: Error) => {
  if (err) {
    logger.error('Error starting HTTPS server:', err.message);
  } else {
    logger.info('Server is running on port 9756');
  }
});

// Error handling
app.use(errorHandler);

app.listen(SERVER_PORT, (err?: Error) => {
  if (err) {
    logger.error('Error starting HTTP server:', err.message);
  } else {
    logger.info(`Server running on port ${SERVER_PORT}`);
  }
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
