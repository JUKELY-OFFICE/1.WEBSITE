import { useTranslations, useLocale } from 'next-intl';
import Button from '@/components/ui/Button';

export default function AboutTeaser() {
  const t = useTranslations('about_teaser');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  return (
    <section className="border-t border-jukely-nuit/10 px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display mb-6 text-3xl font-bold text-jukely-nuit">{t('title')}</h2>
        <p className="mb-8 text-lg leading-relaxed text-jukely-ardoise">{t('desc')}</p>
        <Button href={localizedHref('/about')} variant="ghost">
          {t('cta')} →
        </Button>
      </div>
    </section>
  );
}
