import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, statusCode: number = 500, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', err);
  if ((err as any)?.cause) {
    console.error('Error cause:', (err as any).cause);
  }

  if (err instanceof AppError) {
    const response: ApiResponse<null> = {
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
    const response: ApiResponse<null> = {
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
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    };
    res.status(401).json(response);
    return;
  }

  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    },
  };
  res.status(500).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  };
  res.status(404).json(response);
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}