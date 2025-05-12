import { NextFunction, Router, Request, Response } from "express";
import { asyncHandler } from "../asyncHandler";
import { getAuth } from "@clerk/express";
import { errorResponse } from "../utils/response";
import checkAuth from "../utils/auth.utils";
import {
  getSpendingTrends,
  getSummary,
} from "../controllers/dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get(
  "/summary",
  asyncHandler(checkAuth),
  asyncHandler(getSummary)
);

dashboardRouter.get(
  "/spending-trends",
  asyncHandler(checkAuth),  
  asyncHandler(getSpendingTrends)
);

export default dashboardRouter;
