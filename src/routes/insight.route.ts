import { NextFunction, Router, Request, Response } from "express";
import { asyncHandler } from "../asyncHandler";
import { getInsights, getSpendingSummary } from "../controllers/insight.controller";
import { getAuth } from "@clerk/express";
import { errorResponse } from "../utils/response";

const insightRouter = Router();

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json(errorResponse(401, "User not authenticated"));
    return;
  }

  next();
};

insightRouter.get(
  "/budget/:budgetId",
/*   asyncHandler(checkAuth),
 */  asyncHandler(getInsights)
);

insightRouter.get(
  "/spending-summary/",
  asyncHandler(checkAuth),
  asyncHandler(getSpendingSummary)
);

export default insightRouter;
