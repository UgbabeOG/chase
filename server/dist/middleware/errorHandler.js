export class AppError extends Error {
    code;
    statusCode;
    details;
    constructor(code, message, statusCode = 500, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
}
export function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    if (err instanceof AppError) {
        const response = {
            success: false,
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
            },
        };
        res.status(err.statusCode).json(response);
        return;
    }
    if (err.name === 'ValidationError') {
        const response = {
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: err.message,
            },
        };
        res.status(400).json(response);
        return;
    }
    if (err.name === 'UnauthorizedError') {
        const response = {
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            },
        };
        res.status(401).json(response);
        return;
    }
    const response = {
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
        },
    };
    res.status(500).json(response);
}
export function notFoundHandler(req, res) {
    const response = {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
    };
    res.status(404).json(response);
}
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
