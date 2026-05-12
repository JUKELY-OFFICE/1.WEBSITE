import { useTranslations, useLocale } from 'next-intl';
import Button from '@/components/ui/Button';

export default function PricingSummary() {
  const t = useTranslations('pricing_summary');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  const items = [
    { label: t('setup_label'), desc: t('setup_desc') },
    { label: t('monthly_label'), desc: t('monthly_desc') },
    { label: t('custom_label'), desc: t('custom_desc') },
  ];

  return (
    <section className="border-t border-jukely-nuit/10 bg-jukely-craie px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display mb-14 text-center text-3xl font-bold text-jukely-nuit">
          {t('title')}
        </h2>
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-jukely-nuit/10 bg-white p-6 text-center"
              style={{ boxShadow: '0 1px 3px rgba(15,39,72,.04), 0 10px 30px rgba(15,39,72,.06)' }}
            >
              <p className="font-display mb-2 text-lg font-semibold text-jukely-moutarde">
                {item.label}
              </p>
              <p className="font-semibold text-jukely-nuit">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button href={localizedHref('/pricing')} variant="secondary">
            {t('cta')}
          </Button>
        </div>
      </div>
    </section>
  );
}
