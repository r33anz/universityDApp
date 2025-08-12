class KardexError extends Error {
    constructor(message, statusCode = 500, details = null, errorCode = null) {
        super(message)
        this.name = "KardexError"
        this.statusCode = statusCode
        this.details = details
        this.errorCode = errorCode
    }
    
    static badRequest(message, details = null, errorCode = null) {
        return new KardexError(message, 400, details, errorCode)
    }
    
    static internal(message, details = null, errorCode = null) {
        return new KardexError(message, 500, details, errorCode)
    }
    
    static invalidFileFormat(details = null) {
        return new KardexError(
            "Formato de archivo no válido", 
            400, 
            details, 
            "INVALID_FILE_FORMAT"
        )
    }
    
    static fileUploadRequired(details = null) {
        return new KardexError(
            "Se requiere al menos un archivo PDF", 
            400, 
            details, 
            "FILE_UPLOAD_REQUIRED"
        )
    }
    
    static kardexProcessingError(details = null) {
        return new KardexError(
            "Error al procesar el kardex", 
            500, 
            details, 
            "KARDEX_PROCESSING_ERROR"
        )
    }
}

export default KardexError;