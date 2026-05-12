import { useTranslations } from 'next-intl';

export default function Testimonial() {
  const t = useTranslations('testimonial');

  return (
    <section className="border-t border-jukely-nuit/10 bg-jukely-ardoise px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 text-3xl text-jukely-moutarde">"</div>
        <blockquote className="font-display mb-8 text-xl font-medium leading-relaxed text-jukely-craie md:text-2xl">
          {t('quote')}
        </blockquote>
        <p className="text-sm text-jukely-brume">{t('author')}</p>
      </div>
    </section>
  );
}
