import { ZodError } from 'zod';
export function validateBody(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
                res.status(400).json({ error: 'Validation failed', details: messages });
                return;
            }
            next(error);
        }
    };
}
export function validateParams(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
                res.status(400).json({ error: 'Invalid parameters', details: messages });
                return;
            }
            next(error);
        }
    };
}
export function validateQuery(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const messages = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
                res.status(400).json({ error: 'Invalid query parameters', details: messages });
                return;
            }
            next(error);
        }
    };
}
