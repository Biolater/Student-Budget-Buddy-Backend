import { NextFunction, Request, Response } from "express";
import {
  ApiError,
  ValidationErrorDetail,
  validationError,
} from "../utils/ApiError";
import { errorResponse } from "../utils/response";
import { ZodError } from "zod";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.error(`[ERROR] ${err.message}\n${err.stack}`);

    // Convert Zod validation errors to our standardized ApiError format
    if (err instanceof ZodError) {
      const validationErrors: ValidationErrorDetail[] = err.errors.map(
        (error) => ({
          field: error.path.join("."),
          message: error.message,
          code: error.code,
        })
      );

      // Use our factory method to create a proper validation error
      const apiError = validationError(validationErrors);

      // Send the response with our errorResponse utility
      return res.status(apiError.statusCode).json({
        success: false,
        data: null,
        error: {
          code: apiError.statusCode,
          message: apiError.message,
          errors: apiError.errors,
        },
      });
    }

    // For ApiError instances, use the status code and message directly
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({
        success: false,
        data: null,
        error: {
          code: err.statusCode,
          message: err.message,
          ...(err.errors && { errors: err.errors }),
        },
      });
    }

    // For all other errors, treat as 500 Internal Server Error
    const serverError = new ApiError(
      500,
      err.message || "Internal Server Error",
      false
    );

    return res.status(serverError.statusCode).json({
      success: false,
      data: null,
      error: {
        code: serverError.statusCode,
        message: serverError.message,
      },
    });
  } catch (error) {
    // If an error occurs in our error handler, send a generic response
    console.error("Error in error handler:", error);
    res.status(500).json(errorResponse(500, "Internal server error"));
  }
}
