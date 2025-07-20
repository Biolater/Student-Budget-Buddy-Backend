import { Router } from "express";
import { asyncHandler } from "../asyncHandler";
import {
  getInsights,
  getSpendingSummary,
} from "../controllers/insight.controller";
import checkAuth from "../utils/auth.utils";

const insightRouter = Router();

insightRouter.get(
  "/budget/:budgetId",
  asyncHandler(checkAuth),
  asyncHandler(getInsights)
);

insightRouter.get(
  "/spending-summary/",
  asyncHandler(checkAuth),
  asyncHandler(getSpendingSummary)
);

export default insightRouter;
