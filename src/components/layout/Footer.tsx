import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-jukely-nuit/10 bg-jukely-nuit py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-display text-sm font-bold text-jukely-craie">JUKELY</p>
          <p className="text-xs text-jukely-brume">{t('tagline')}</p>
          <div className="flex gap-6 text-xs text-jukely-brume">
            <Link href="#" className="hover:text-jukely-craie transition">
              {t('legal')}
            </Link>
            <span>© {new Date().getFullYear()} Jukely</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
