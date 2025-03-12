class StudentSerror extends Error{
    constructor(message, statusCode = 500, details = null, errorCode = null) {
        super(message)
        this.name = "ApiError"
        this.statusCode = statusCode
        this.details = details
        this.errorCode = errorCode
      }
    
      static badRequest(message, details = null, errorCode = null) {
        return new StudentSerror(message, 400, details, errorCode)
      }
    
      static notFound(message, details = null, errorCode = null) {
        return new StudentSerror(message, 404, details, errorCode)
      }
    
      static unauthorized(message, details = null, errorCode = null) {
        return new StudentSerror(message, 401, details, errorCode)
      }
    
      static forbidden(message, details = null, errorCode = null) {
        return new StudentSerror(message, 403, details, errorCode)
      }
    
      static internal(message, details = null, errorCode = null) {
        return new StudentSerror(message, 500, details, errorCode)
      }
    
      static conflict(message, details = null, errorCode = null) {
        return new StudentSerror(message, 409, details, errorCode)
      }
}

export default StudentSerror;