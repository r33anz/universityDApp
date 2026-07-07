import AppError from './AppError.js';

export default class KardexError extends AppError {
    static invalidFileFormat(details = null) {
        return new this("Formato de archivo no válido", 400, details, "INVALID_FILE_FORMAT");
    }

    static fileUploadRequired(details = null) {
        return new this("Se requiere al menos un archivo PDF", 400, details, "FILE_UPLOAD_REQUIRED");
    }

    static kardexProcessingError(details = null) {
        return new this("Error al procesar el kardex", 500, details, "KARDEX_PROCESSING_ERROR");
    }

    static fileExists(message, details = null, errorCode = "FILE_ALREADY_EXISTS") {
        return new this(message, 409, details, errorCode);
    }

    static ipfsRemoveError(message, details = null, errorCode = "IPFS_REMOVE_ERROR") {
        return new this(message, 500, details, errorCode);
    }

    static contractError(message, details = null, errorCode = "CONTRACT_ERROR") {
        return new this(message, 500, details, errorCode);
    }
}
