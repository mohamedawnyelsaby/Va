import { Suspense } from 'react';
import { HeroSection } from '@/components/sections/hero';
import { FeaturesSection } from '@/components/sections/features';
import { PopularDestinations } from '@/components/sections/popular-destinations';
import { HowItWorks } from '@/components/sections/how-it-works';
import { PiIntegration } from '@/components/sections/pi-integration';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection locale={locale} />
        <FeaturesSection locale={locale} />
        <PopularDestinations locale={locale} />
        <HowItWorks locale={locale} />
        <PiIntegration locale={locale} />
      </Suspense>
    </div>
  );
}
