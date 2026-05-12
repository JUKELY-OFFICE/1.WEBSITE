import { useTranslations } from 'next-intl';

export default function Solution() {
  const t = useTranslations('solution');

  const items = [
    { title: t('item1_title'), desc: t('item1_desc') },
    { title: t('item2_title'), desc: t('item2_desc') },
    { title: t('item3_title'), desc: t('item3_desc') },
  ];

  return (
    <section className="border-t border-jukely-nuit/10 bg-jukely-nuit px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display mb-14 text-center text-3xl font-bold text-jukely-craie">
          {t('title')}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col gap-3">
              <div className="h-1 w-12 rounded bg-jukely-moutarde" />
              <h3 className="font-display text-lg font-semibold text-jukely-moutarde">{item.title}</h3>
              <p className="text-sm leading-relaxed text-jukely-brume">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
