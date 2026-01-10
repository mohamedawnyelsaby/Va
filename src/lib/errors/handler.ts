// src/lib/errors/handler.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: Date) {
    super('Too many requests', 429, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
  }
}

// Error Handler
export function handleError(error: unknown): NextResponse {
  console.error('Error:', error);

  // Zod Validation Error
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Prisma Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'A record with this value already exists',
          code: 'DUPLICATE_ERROR',
          details: { fields: error.meta?.target },
        },
        { status: 409 }
      );
    }

    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          error: 'Referenced record not found',
          code: 'FOREIGN_KEY_ERROR',
        },
        { status: 400 }
      );
    }

    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }
  }

  // App Errors
  if (error instanceof AppError) {
    const response: any = {
      error: error.message,
      code: error.code,
    };

    if (error.details) {
      response.details = error.details;
    }

    const headers: HeadersInit = {};
    
    if (error instanceof RateLimitError && error.details?.retryAfter) {
      headers['Retry-After'] = error.details.retryAfter.toISOString();
    }

    return NextResponse.json(response, { 
      status: error.statusCode,
      headers,
    });
  }

  // Unknown errors
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : 'Something went wrong',
    },
    { status: 500 }
  );
}

// Async Handler Wrapper
export function asyncHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleError(error);
    }
  };
}
