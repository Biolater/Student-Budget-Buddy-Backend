import { NextFunction, Request, Response } from "express";
import { InsightService } from "../services/insightService";
import { ApiError } from "../utils/ApiError";
import { successResponse } from "../utils/response";

// Controller function to fetch insights for a budget
export const getInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { budgetId } = req.params;
    // @ts-ignore - Bypassing TypeScript error for auth property
    const userId = req?.auth?.userId!;
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
    const { startDate, endDate } = req.query;
    // @ts-ignore - Bypassing TypeScript error for auth property
    const userId = req?.auth?.userId!;
    const insights = await InsightService.getBudgetInsights(budgetId, userId);
    if (!insights) {
      throw new ApiError(404, "Budget not found");
    }
    res.json(successResponse(insights));
  } catch (error) {
    next(error);
  }
};
