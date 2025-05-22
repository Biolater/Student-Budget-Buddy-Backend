export type ValidationErrorDetail = {
  field: string;
  message: string;
  code: string;
};

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: ValidationErrorDetail[];

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: ValidationErrorDetail[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Factory method to create validation error
export const validationError = (errors: ValidationErrorDetail[]) => {
  return new ApiError(400, "Validation failed", true, errors);
};
