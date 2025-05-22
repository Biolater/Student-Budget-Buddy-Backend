import { NextFunction, Request, Response } from "express";
import { InsightService } from "../services/insight.service";
import { ApiError } from "../utils/ApiError";
import { successResponse } from "../utils/response";
import { getAuth } from "@clerk/express";

// Controller function to fetch insights for a budget
export const getInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { budgetId } = req.params;

    const { userId } = getAuth(req);
    if (!userId) {
      throw new ApiError(401, "User is not authenticated");
    }

    const insights = await InsightService.getBudgetInsights(budgetId, userId);
    if (!insights) {
      throw new ApiError(404, "Budget not found");
    }
    res.json(successResponse(insights));
  } catch (error) {
    next(error);
  }
};

export const getSpendingSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { budgetId } = req.params;

    const { userId } = getAuth(req);
    if (!userId) {
      throw new ApiError(401, "User is not authenticated");
    }

    const insights = await InsightService.getBudgetInsights(budgetId, userId);
    if (!insights) {
      throw new ApiError(404, "Budget not found");
    }
    res.json(successResponse(insights));
  } catch (error) {
    next(error);
  }
};