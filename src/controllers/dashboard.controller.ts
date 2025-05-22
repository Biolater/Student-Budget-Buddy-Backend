import { NextFunction, Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { ApiError } from "../utils/ApiError";
import { successResponse } from "../utils/response";
import { getAuth } from "@clerk/express";
import { SpendingTrendTimePeriod, TimePeriod } from "../types/dashboard.types";
import { GetUpcomingFinancialEventsQueryParamsSchema } from "../schemas/dashboard.schema";

export const getSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = getAuth(req);
    const { timePeriod } = req.query;
    if (!userId) {
      throw new ApiError(401, "User is not authenticated");
    }

    const summary = await DashboardService.getSummary({
      userId,
      timePeriod: timePeriod as TimePeriod,
    });

    res.json(successResponse(summary));
  } catch (error) {
    next(error);
  }
};

export const getSpendingTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = getAuth(req);
    const { timePeriod } = req.query;
    if (!userId) {
      throw new ApiError(401, "User is not authenticated");
    }

    const spendingTrends = await DashboardService.getSpendingTrends({
      userId,
      timePeriod: timePeriod as SpendingTrendTimePeriod,
    });

    res.json(successResponse(spendingTrends));
  } catch (error) {
    next(error);
  }
};

export const getSpendingByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = getAuth(req);
    const { timePeriod } = req.query;
    if (!userId) {
      throw new ApiError(401, "User is not authenticated");
    }

    const spendingByCategory = await DashboardService.getSpendingByCategory({
      userId,
      timePeriod: timePeriod as TimePeriod,
    });

    res.json(successResponse(spendingByCategory));
  } catch (error) {
    next(error);
  }
};
export const getUpcomingFinancialEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = getAuth(req); // Assuming getAuth works with Clerk's express integration on req
    if (!userId) {
      // Throwing ApiError here ensures it gets caught by your global error handler
      throw new ApiError(401, "User is not authenticated");
    }

    // Input validation for query parameters
    const { limit, daysAhead, isActive } =
      GetUpcomingFinancialEventsQueryParamsSchema.parse(req.query);

    const events = await DashboardService.getUpcomingFinancialEvents({
      userId,
      limit,
      daysAhead,
      isActive,
    });

    res.json(successResponse(events));
  } catch (error) {
    next(error);
  }
};
