'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const otherLocale = locale === 'fr' ? 'en' : 'fr';

  const getPathWithoutLocale = (pathname: string) => pathname.replace(/^\/(fr|en)/, '') || '/';

  const switchLocalePath = () => {
    const path = getPathWithoutLocale(pathname);
    return `/${otherLocale}${path === '/' ? '' : path}`;
  };

  const navLinks = [
    { href: '/modules', label: t('modules') },
    { href: '/pricing', label: t('pricing') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  const localizedHref = (href: string) => `/${locale}${href}`;

  const isDashboard = pathname.includes('/WebFrontDashboard');
  const isTVDisplay = pathname.includes('/TVDisplay');
  const hideNavbar = isDashboard || isTVDisplay;

  if (hideNavbar) return null;

  return (
    <nav className="border-b border-jukely-nuit/10 bg-jukely-craie/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href={`/${locale}`}
          className="font-display text-xl font-bold tracking-tight text-jukely-nuit"
        >
          JUKELY
        </Link>

        {isDashboard ? (
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => window?.dispatchEvent(new CustomEvent('jukely-dashboard-refresh'))}
              className="rounded-lg border border-jukely-nuit/20 bg-white/5 px-4 py-2 text-sm text-jukely-nuit transition hover:bg-white/10"
            >
              Rafraîchir
            </button>
            <button
              type="button"
              onClick={() => window?.dispatchEvent(new CustomEvent('jukely-dashboard-toggle-fullscreen'))}
              className="rounded-lg border border-jukely-nuit/20 bg-white/5 px-4 py-2 text-sm text-jukely-nuit transition hover:bg-white/10"
            >
              Plein écran
            </button>
          </div>
        ) : (
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={localizedHref(link.href)}
                className="text-sm text-jukely-ardoise transition hover:text-jukely-nuit"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={switchLocalePath()}
              className="rounded border border-jukely-nuit/20 px-3 py-1 text-xs text-jukely-ardoise transition hover:border-jukely-nuit/40 hover:text-jukely-nuit"
            >
              {otherLocale.toUpperCase()}
            </Link>
            <Link
              href={`/${locale}/WebFrontLogin`}
              className="rounded-lg bg-jukely-nuit px-4 py-2 text-sm font-medium text-jukely-craie transition hover:bg-jukely-ardoise"
            >
              Connexion
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
