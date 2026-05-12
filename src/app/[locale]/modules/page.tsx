import { useTranslations, useLocale } from 'next-intl';
import { BRICKS } from '@/lib/bricks';
import BrickCard from '@/components/modules/BrickCard';
import Button from '@/components/ui/Button';

export default function ModulesPage() {
  const t = useTranslations('modules_page');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  const active = BRICKS.filter((b) => b.status === 'active');
  const inDev = BRICKS.filter((b) => b.status === 'dev');
  const soon = BRICKS.filter((b) => b.status === 'soon');

  const groups = [
    { label: t('active'), bricks: active },
    { label: t('in_dev'), bricks: inDev },
    { label: t('soon'), bricks: soon },
  ].filter((g) => g.bricks.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16 text-center">
        <h1 className="font-display mb-4 text-4xl font-bold text-jukely-nuit">{t('title')}</h1>
        <p className="text-lg text-jukely-ardoise">{t('subtitle')}</p>
      </div>

      <div className="space-y-16">
        {groups.map((group) => (
          <div key={group.label}>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-widest text-jukely-moutarde">
              {group.label}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {group.bricks.map((brick) => (
                <BrickCard key={brick.id} brick={brick} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <Button href={localizedHref('/contact')} variant="primary">
          {t('cta')}
        </Button>
      </div>
    </div>
  );
}
