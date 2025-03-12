
export class ApiError extends Error {
    constructor(message, statusCode, details = null) {
      super(message)
      this.name = "ApiError"
      this.statusCode = statusCode
      this.details = details
    }
  
    getStatusErrorMessage() {
      return this.message
    }
  }
  
  