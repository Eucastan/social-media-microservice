import logger  from "../configs/logger.js";

export const errorMiddleware = (err, req, res, next) => {
  logger.error({
    message: err.message || "Internal Server Error",
    stack: err.stack,
    route: req.originalUrl,
    method: req.method,
  });

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
};

