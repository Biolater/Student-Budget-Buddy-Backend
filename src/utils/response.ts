export function successResponse<T>(data: T) {
  return {
    success: true,
    data,
    error: null,
  };
}

export function errorResponse(code: number, message: string) {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  };
}
