import { useTranslations, useLocale } from 'next-intl';
import Button from '@/components/ui/Button';

export default function PricingPage() {
  const t = useTranslations('pricing_page');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  const plans = [
    {
      title: t('setup_title'),
      price: t('setup_price'),
      type: t('setup_type'),
      includes: t('setup_includes'),
      highlight: false,
    },
    {
      title: t('monthly_title'),
      price: t('monthly_price'),
      type: t('monthly_type'),
      includes: t('monthly_includes'),
      highlight: true,
    },
    {
      title: t('custom_title'),
      price: t('custom_price'),
      type: t('custom_type'),
      includes: t('custom_includes'),
      highlight: false,
    },
  ];

  const faqs = [
    { q: t('faq1_q'), a: t('faq1_a') },
    { q: t('faq2_q'), a: t('faq2_a') },
    { q: t('faq3_q'), a: t('faq3_a') },
    { q: t('faq4_q'), a: t('faq4_a') },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16 text-center">
        <h1 className="font-display mb-4 text-4xl font-bold text-jukely-nuit">{t('title')}</h1>
        <p className="text-lg text-jukely-ardoise">{t('subtitle')}</p>
      </div>

      <div className="mb-24 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={`flex flex-col gap-4 rounded-xl border p-8 ${
              plan.highlight
                ? 'border-jukely-moutarde/50 bg-jukely-nuit'
                : 'border-jukely-nuit/10 bg-white'
            }`}
            style={{ boxShadow: '0 1px 3px rgba(15,39,72,.04), 0 10px 30px rgba(15,39,72,.06)' }}
          >
            <p className={`text-sm font-semibold uppercase tracking-widest ${plan.highlight ? 'text-jukely-moutarde' : 'text-jukely-moutarde'}`}>
              {plan.title}
            </p>
            <p className={`font-display text-2xl font-bold ${plan.highlight ? 'text-jukely-craie' : 'text-jukely-nuit'}`}>
              {plan.price}
            </p>
            <p className={`text-xs ${plan.highlight ? 'text-jukely-brume' : 'text-jukely-brume'}`}>{plan.type}</p>
            <hr className={plan.highlight ? 'border-jukely-craie/10' : 'border-jukely-nuit/10'} />
            <p className={`text-sm leading-relaxed ${plan.highlight ? 'text-jukely-brume' : 'text-jukely-ardoise'}`}>
              {plan.includes}
            </p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-2xl">
        <h2 className="font-display mb-10 text-2xl font-bold text-jukely-nuit">{t('faq_title')}</h2>
        <div className="space-y-8">
          {faqs.map((faq) => (
            <div key={faq.q} className="border-b border-jukely-nuit/10 pb-8 last:border-0">
              <p className="mb-2 font-semibold text-jukely-nuit">{faq.q}</p>
              <p className="text-sm leading-relaxed text-jukely-ardoise">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-20 text-center">
        <Button href={localizedHref('/contact')} variant="primary">
          {locale === 'en' ? 'Book a call' : 'Prendre rendez-vous'}
        </Button>
      </div>
    </div>
  );
}
