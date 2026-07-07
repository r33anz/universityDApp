import AppError from '../error/AppError.js';
import config from '../../infrastructure/config/env.js';

/**
 * Centralized Express error handler. Translates any AppError subclass into
 * the canonical JSON error response; treats anything else as an opaque 500.
 *
 * Must be registered AFTER all routes via `app.use(errorHandler)`.
 */
export default function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            details: err.details,
            errorCode: err.errorCode,
        });
    }

    console.error('[errorHandler] Unexpected error:', err);
    return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        details: config.isDevelopment ? err.message : null,
        errorCode: 'INTERNAL_SERVER_ERROR',
    });
}
