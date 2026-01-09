import { Suspense } from 'react';
import { HeroSection } from '@/components/sections/hero';
import { FeaturesSection } from '@/components/sections/features';
import { PopularDestinations } from '@/components/sections/popular-destinations';
import { HowItWorks } from '@/components/sections/how-it-works';
import { PiIntegration } from '@/components/sections/pi-integration';
import { Testimonials } from '@/components/sections/testimonials';
import { CTASection } from '@/components/sections/cta';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getTranslations } from '@/lib/i18n/server';

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations(locale, 'home');

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection locale={locale} />
        <FeaturesSection locale={locale} />
        <PopularDestinations locale={locale} />
        <HowItWorks locale={locale} />
        <PiIntegration locale={locale} />
        <Testimonials locale={locale} />
        <CTASection locale={locale} />
      </Suspense>
    </div>
  );
}
