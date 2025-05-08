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

dotenv.config();

const app = express();
const port = 3001;

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:3000", // Allow frontend origin
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

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
