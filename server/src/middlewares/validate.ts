import type { Request, Response, NextFunction } from 'express';
import type { ObjectSchema } from 'joi';

/**
 * Middleware to validate request bodies against a Joi schema.
 * Returns 400 with error details if validation fails.
 */
export function validate(schema: ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
      return;
    }

    next();
  };
}
