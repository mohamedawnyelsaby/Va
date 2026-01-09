// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Page Not Found
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sorry, we couldn't find the page you're looking for. Perhaps you've
              mistyped the URL or the page has been moved.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Link>
          </Button>
        </div>

        <div className="mt-12">
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at{' '}
            <a
              href="mailto:support@vatravel.com"
              className="text-primary hover:underline"
            >
              support@vatravel.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
