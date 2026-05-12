import { useTranslations } from 'next-intl';

export default function PainPoints() {
  const t = useTranslations('pain');

  const items = [
    { num: '01', title: t('item1_title'), desc: t('item1_desc') },
    { num: '02', title: t('item2_title'), desc: t('item2_desc') },
    { num: '03', title: t('item3_title'), desc: t('item3_desc') },
  ];

  return (
    <section className="border-t border-jukely-nuit/10 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display mb-14 text-center text-3xl font-bold text-jukely-nuit">
          {t('title')}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.num}
              className="rounded-xl border border-jukely-nuit/10 bg-white p-8 shadow-sm"
              style={{ boxShadow: '0 1px 3px rgba(15,39,72,.04), 0 10px 30px rgba(15,39,72,.06)' }}
            >
              <p className="mb-3 text-sm font-bold text-jukely-moutarde">{item.num}</p>
              <h3 className="mb-3 font-semibold text-jukely-nuit leading-snug">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-jukely-ardoise">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
