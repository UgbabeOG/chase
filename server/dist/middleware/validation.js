import { ZodError } from 'zod';
export function validateBody(schema) {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                const response = {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request body',
                        details,
                    },
                };
                res.status(400).json(response);
                return;
            }
            next(error);
        }
    };
}
export function validateQuery(schema) {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                const response = {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid query parameters',
                        details,
                    },
                };
                res.status(400).json(response);
                return;
            }
            next(error);
        }
    };
}
export function validateParams(schema) {
    return (req, res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const details = error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                const response = {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid route parameters',
                        details,
                    },
                };
                res.status(400).json(response);
                return;
            }
            next(error);
        }
    };
}
