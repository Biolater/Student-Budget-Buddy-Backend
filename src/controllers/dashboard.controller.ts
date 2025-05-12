import { NextFunction, Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { ApiError } from "../utils/ApiError";
import { successResponse } from "../utils/response";
import { getAuth } from "@clerk/express";
import { SpendingTrendTimePeriod, TimePeriod } from "../types/dashboard.types";

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
