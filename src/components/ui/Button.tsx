import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-jukely-moutarde text-jukely-nuit font-semibold hover:opacity-90 active:opacity-80',
  secondary:
    'border border-jukely-nuit/30 text-jukely-nuit hover:border-jukely-nuit/60 hover:bg-jukely-nuit/5',
  ghost: 'text-jukely-ardoise hover:text-jukely-nuit',
};

export default function Button({
  href,
  onClick,
  variant = 'primary',
  children,
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded px-5 py-2.5 text-sm transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const classes = `${base} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
