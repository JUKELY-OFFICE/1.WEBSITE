import { useTranslations, useLocale } from 'next-intl';
import { PREVIEW_BRICKS } from '@/lib/bricks';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function BricksPreview() {
  const t = useTranslations('bricks_preview');
  const tb = useTranslations('bricks');
  const tm = useTranslations('modules_page');
  const locale = useLocale();
  const localizedHref = (href: string) => (locale === 'en' ? `/en${href}` : href);

  const statusLabel = (status: 'active' | 'dev' | 'soon') => {
    if (status === 'active') return tm('active');
    if (status === 'dev') return tm('in_dev');
    return tm('soon');
  };

  return (
    <section className="border-t border-jukely-nuit/10 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display mb-14 text-center text-3xl font-bold text-jukely-nuit">
          {t('title')}
        </h2>
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          {PREVIEW_BRICKS.map((brick) => (
            <div
              key={brick.id}
              className="rounded-xl border border-jukely-nuit/10 bg-white p-6"
              style={{ boxShadow: '0 1px 3px rgba(15,39,72,.04), 0 10px 30px rgba(15,39,72,.06)' }}
            >
              <div className="mb-3">
                <Badge status={brick.status} label={statusLabel(brick.status)} />
              </div>
              <h3 className="mb-2 font-semibold text-jukely-nuit">
                {tb(brick.nameKey as Parameters<typeof tb>[0])}
              </h3>
              <p className="text-sm leading-relaxed text-jukely-ardoise">
                {tb(brick.descKey as Parameters<typeof tb>[0])}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button href={localizedHref('/modules')} variant="secondary">
            {t('cta')}
          </Button>
        </div>
      </div>
    </section>
  );
}
