/**
 * Base class for all domain-aware errors that should be translated to HTTP
 * responses by the errorHandler middleware. Subclasses just specialize the
 * name and add their own factory methods if needed.
 *
 * Anything thrown that is not an AppError is treated as an unexpected
 * 500 by the middleware (and only the message is leaked in development).
 */
export default class AppError extends Error {
  constructor(message, statusCode = 500, details = null, errorCode = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.errorCode = errorCode;
  }

  static badRequest(message, details = null, errorCode = null) {
    return new this(message, 400, details, errorCode);
  }

  static notFound(message, details = null, errorCode = null) {
    return new this(message, 404, details, errorCode);
  }

  static conflict(message, details = null, errorCode = null) {
    return new this(message, 409, details, errorCode);
  }

  static internal(message, details = null, errorCode = null) {
    return new this(message, 500, details, errorCode);
  }

  static invalidInput(message, details = null, errorCode = null) {
    return new this(message, 400, details, errorCode);
  }
}
