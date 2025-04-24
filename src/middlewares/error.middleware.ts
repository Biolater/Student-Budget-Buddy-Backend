import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { errorResponse } from "../utils/response";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const statusCode = (err as ApiError).statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json(errorResponse(statusCode, message));
  } catch (error) {
    next(error);
  }
}
