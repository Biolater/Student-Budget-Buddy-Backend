import { NextFunction, Router, Request, Response } from "express";
import { asyncHandler } from "../asyncHandler";
import { getInsights } from "../controllers/insight.controller";
import { getAuth } from "@clerk/express";

const insightRouter = Router();

// Custom auth middleware that returns JSON instead of redirecting
const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
  }

  next();
};

insightRouter.get(
  "/budget/:budgetId",
  asyncHandler(checkAuth),
  asyncHandler(getInsights)
);

export default insightRouter;
