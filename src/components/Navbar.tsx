'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
  // Initial auth state read on the server. Prevents the "flash of logged-out state"
  // on first paint that would happen if we relied on client-side auth check alone.
  initialUser: User | null;
}

export default function Navbar({ initialUser }: NavbarProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 55);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for auth changes (login in another tab, sign-out from dashboard, etc.)
  // so the navbar stays in sync without requiring a hard page reload.
  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
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
          {/* Auth-aware link: My Account when logged in, Sign in when logged out.
              Uses .lang-btn styling for visual consistency with the language toggle. */}
          {user ? (
            <Link href={`/${locale}/dashboard`} className="lang-btn">
              {t('myAccount')}
            </Link>
          ) : (
            <Link href={`/${locale}/auth/login`} className="lang-btn">
              {t('login')}
            </Link>
          )}
          <button className="nav-cta" onClick={() => goTo('contact')}>
            {t('cta')}
          </button>
        </div>
      </div>
    </nav>
  );
}
