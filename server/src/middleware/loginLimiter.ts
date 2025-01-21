import rateLimit, { Options } from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

/*
const uploadLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 upload requests per windowMs
  message: {
    message: 'Too many upload requests from this IP, please try again after 5 minutes.',
  },
});
router.post('/upload-document', uploadLimiter, uploadMiddleware, controller.uploadDocument);
*/
export const createRateLimiter = (options: Partial<Options>) => {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000, // Default 1 minute
    max: options.max || 5,
    message: options.message || {
      message: "Too many requests from this IP, please try again later.",
    },
    handler: (
      req: Request,
      res: Response,
      next: NextFunction,
      opts: Options
    ): void => {
      res.status(opts.statusCode || 429).send(opts.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
