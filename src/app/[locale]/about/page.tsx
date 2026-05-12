import { useTranslations } from 'next-intl';
import TeamCard from '@/components/about/TeamCard';

export default function AboutPage() {
  const t = useTranslations('about_page');

  const differentiators = [t('diff1'), t('diff2'), t('diff3'), t('diff4')];

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <div className="mb-16 text-center">
        <h1 className="font-display mb-4 text-4xl font-bold text-jukely-nuit">{t('title')}</h1>
      </div>

      <section className="mb-20">
        <h2 className="font-display mb-6 text-2xl font-bold text-jukely-nuit">{t('mission_title')}</h2>
        <p className="text-lg leading-relaxed text-jukely-ardoise">{t('mission_desc')}</p>
      </section>

      <section className="mb-20">
        <h2 className="font-display mb-10 text-2xl font-bold text-jukely-nuit">{t('team_title')}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <TeamCard name={t('member1_name')} role={t('member1_role')} />
          <TeamCard name={t('member2_name')} role={t('member2_role')} />
        </div>
      </section>

      <section>
        <h2 className="font-display mb-8 text-2xl font-bold text-jukely-nuit">{t('diff_title')}</h2>
        <ul className="space-y-4">
          {differentiators.map((diff) => (
            <li key={diff} className="flex items-start gap-3">
              <span className="mt-1 font-bold text-jukely-moutarde">✓</span>
              <span className="text-jukely-ardoise">{diff}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
