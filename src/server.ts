// src/server.ts
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import openai from "./openai";
import prisma from "./prisma";
import insightRouter from "./routes/insight.route";
import { clerkMiddleware } from "@clerk/express";
import { errorMiddleware } from "./middlewares/error.middleware";
dotenv.config();

const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  })
);

app.use("/api/v1/insights", insightRouter);


app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
