// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong!</CardTitle>
          <CardDescription>
            We apologize for the inconvenience. An error occurred while processing your request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.message && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Error:</strong> {error.message}
              </p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  <strong>Error ID:</strong> {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full" size="lg">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => (window.location.href = '/')}
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            If the problem persists, please contact support at{' '}
            <a
              href="mailto:support@vatravel.com"
              className="text-primary hover:underline"
            >
              support@vatravel.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
