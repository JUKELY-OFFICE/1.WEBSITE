import { useTranslations, useLocale } from 'next-intl';
import Button from '@/components/ui/Button';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  return (
    <section className="bg-jukely-nuit flex min-h-[90vh] flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-jukely-moutarde">
          Jukely
        </p>
        <h1 className="font-display mb-6 text-4xl font-bold leading-tight tracking-tight text-jukely-craie md:text-6xl">
          {t('tagline')}
        </h1>
        <p className="mb-10 text-lg text-jukely-brume md:text-xl">{t('sub')}</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button href={localizedHref('/modules')} variant="primary">
            {t('cta_primary')}
          </Button>
          <Button href={localizedHref('/contact')} variant="ghost" className="text-jukely-craie hover:text-jukely-moutarde">
            {t('cta_secondary')} →
          </Button>
        </div>
      </div>
    </section>
  );
}
