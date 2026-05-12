import { useTranslations } from 'next-intl';

export default function Process() {
  const t = useTranslations('process');

  const steps = [
    { num: t('step1_num'), title: t('step1_title'), desc: t('step1_desc') },
    { num: t('step2_num'), title: t('step2_title'), desc: t('step2_desc') },
    { num: t('step3_num'), title: t('step3_title'), desc: t('step3_desc') },
  ];

  return (
    <section className="border-t border-jukely-nuit/10 bg-jukely-craie px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display mb-14 text-center text-3xl font-bold text-jukely-nuit">
          {t('title')}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="rounded-xl border border-jukely-nuit/10 bg-white p-8"
              style={{ boxShadow: '0 1px 3px rgba(15,39,72,.04), 0 10px 30px rgba(15,39,72,.06)' }}
            >
              <p className="mb-4 text-sm font-bold text-jukely-moutarde">{step.num}</p>
              <h3 className="font-display mb-3 text-lg font-semibold text-jukely-nuit">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-jukely-ardoise">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
