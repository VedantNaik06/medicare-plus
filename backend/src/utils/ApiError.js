// An error we throw on purpose. The central error handler turns it into a JSON response.
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code; // short machine-readable text, translated by the frontend
    this.details = details;
  }
}

export const notFound = (message = 'We could not find that item.') => new ApiError(404, 'NOT_FOUND', message);
