/**
 * Custom application error with HTTP status.
 * Used with errorHandler middleware to return consistent JSON responses.
 */
export default class AppError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = new.target.name;

    // Capture proper stack trace (Node.js only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
