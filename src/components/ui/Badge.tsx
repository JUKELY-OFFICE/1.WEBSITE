type BadgeStatus = 'active' | 'dev' | 'soon';

const statusClasses: Record<BadgeStatus, string> = {
  active: 'bg-jukely-brique/15 text-jukely-brique border-jukely-brique/30',
  dev: 'bg-jukely-moutarde/20 text-jukely-ardoise border-jukely-moutarde/40',
  soon: 'bg-jukely-nuit/8 text-jukely-brume border-jukely-nuit/15',
};

interface BadgeProps {
  status: BadgeStatus;
  label: string;
}

export default function Badge({ status, label }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {label}
    </span>
  );
}
