import { useTranslations } from 'next-intl';
import ContactForm from '@/components/contact/ContactForm';

export default function ContactPage() {
  const t = useTranslations('contact_page');

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <div className="mb-12 text-center">
        <h1 className="font-display mb-4 text-4xl font-bold text-jukely-nuit">{t('title')}</h1>
        <p className="text-lg text-jukely-ardoise">{t('subtitle')}</p>
      </div>

      <ContactForm />

      <div className="mt-10 flex flex-col items-center gap-2 text-center text-sm text-jukely-brume">
        <a href={`mailto:${t('email')}`} className="hover:text-jukely-nuit transition">
          {t('email')}
        </a>
        <a href={`tel:${t('phone').replace(/\s/g, '')}`} className="hover:text-jukely-nuit transition">
          {t('phone')}
        </a>
      </div>
    </div>
  );
}
