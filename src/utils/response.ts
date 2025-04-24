export function successResponse<T>(data: T) {
  return {
    success: true,
    data,
  };
}

export function errorResponse(code: number, message: string) {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}
