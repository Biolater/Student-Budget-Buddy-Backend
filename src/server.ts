// src/server.ts
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import openai from "./openai";
import prisma from "./prisma";
import insightRouter from "./routes/insight.route";
import { clerkMiddleware } from "@clerk/express";
import { errorMiddleware } from "./middlewares/error.middleware";
import cors from "cors"; // Import cors
import dashboardRouter from "./routes/dashboard.route";
import assistantRouter from "./routes/assistant.route";

dotenv.config();

const app = express();
const port = 3001;

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://student-bugdet-buddy-lyje.vercel.app",
  ], // Allow multiple origins
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions)); // Use cors middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  })
);

app.use("/api/v1/insights", insightRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/ai/assistant", assistantRouter)

// Add a catch-all route handler to catch 404 errors
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: 404,
      message: "Route not found"
    }
  });
});

// Error handler must be registered last, and Express recognizes it by the 4 parameters
app.use(errorMiddleware as express.ErrorRequestHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});