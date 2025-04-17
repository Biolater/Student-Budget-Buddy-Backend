import { Router } from "express";
import { asyncHandler } from "../asyncHandler";
import { getInsights } from "../controllers/insight.controller";

const insightRouter = Router();

insightRouter.get("/budget/:budgetId", asyncHandler(getInsights));

export default insightRouter;
