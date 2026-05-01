export function errorHandler(err, req, res, _next) {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal server error';
    console.error(`[ERROR] ${err.message}`, {
        path: req.path,
        method: req.method,
        statusCode,
        stack: err.stack,
    });
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
export function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Route not found',
    });
}
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
