import { useTranslations, useLocale } from 'next-intl';
import Button from '@/components/ui/Button';

export default function FinalCTA() {
  const t = useTranslations('final_cta');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  return (
    <section className="border-t border-jukely-nuit/10 bg-jukely-nuit px-6 py-32 text-center">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display mb-6 text-4xl font-bold text-jukely-craie">{t('title')}</h2>
        <p className="mb-10 text-lg text-jukely-brume">{t('desc')}</p>
        <Button href={localizedHref('/contact')} variant="primary" className="px-8 py-3 text-base">
          {t('cta')}
        </Button>
      </div>
    </section>
  );
}
