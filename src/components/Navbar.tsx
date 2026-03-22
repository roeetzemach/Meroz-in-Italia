'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 55);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function toggleLang() {
    const nextLocale = locale === 'he' ? 'en' : 'he';
    // Replace current locale segment in the path
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.push(newPath);
  }

  return (
    <nav id="mainNav" dir="ltr" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-inner">
        <button className="nav-logo-wrap" onClick={() => goTo('hero')} style={{ background: 'none', border: 'none' }}>
          <Image
            src="/logo.png"
            alt="Meroz In Italia logo"
            width={60}
            height={60}
            className="nav-logo-img"
            priority
          />
          <div className="nav-brand">
            <div className="nav-brand-name">Meroz</div>
            <div className="nav-brand-sub">
              <span className="nav-brand-rule" />
              <span className="nav-brand-italia">In Italia</span>
              <span className="nav-brand-rule" />
            </div>
          </div>
        </button>

        <div className="nav-right">
          <button className="lang-btn" onClick={toggleLang}>
            {t('langToggle')}
          </button>
          <button className="nav-cta" onClick={() => goTo('contact')}>
            {t('cta')}
          </button>
        </div>
      </div>
    </nav>
  );
}
