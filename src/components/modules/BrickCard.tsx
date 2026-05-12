import { useTranslations } from 'next-intl';
import Badge from '@/components/ui/Badge';
import type { Brick } from '@/lib/bricks';

interface BrickCardProps {
  brick: Brick;
}

export default function BrickCard({ brick }: BrickCardProps) {
  const tb = useTranslations('bricks');
  const tm = useTranslations('modules_page');

  const statusLabel = (status: 'active' | 'dev' | 'soon') => {
    if (status === 'active') return tm('active');
    if (status === 'dev') return tm('in_dev');
    return tm('soon');
  };

  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-jukely-nuit/10 bg-white p-6"
      style={{ boxShadow: '0 1px 3px rgba(15,39,72,.04), 0 10px 30px rgba(15,39,72,.06)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold text-jukely-nuit">
          {tb(brick.nameKey as Parameters<typeof tb>[0])}
        </h3>
        <Badge status={brick.status} label={statusLabel(brick.status)} />
      </div>
      <p className="text-sm leading-relaxed text-jukely-ardoise">
        {tb(brick.descKey as Parameters<typeof tb>[0])}
      </p>
    </div>
  );
}
