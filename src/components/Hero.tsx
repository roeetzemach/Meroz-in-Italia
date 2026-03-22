'use client';

import { useTranslations, useLocale } from 'next-intl';

const WA_BASE = 'https://wa.me/393517231156?text=';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const isHe = locale === 'he';

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const waHref = WA_BASE + encodeURIComponent(t('waMsg'));

  return (
    <section className="hero" id="hero">
      {/* SVG Tuscan landscape */}
      <div className="hero-landscape">
        <svg viewBox="0 0 1440 340" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,260 C80,220 160,280 240,240 C320,200 400,260 480,230 C560,200 640,250 720,220 C800,190 880,240 960,215 C1040,190 1120,235 1200,210 C1280,185 1360,230 1440,210 L1440,340 L0,340 Z" fill="#0F2619" opacity="0.5"/>
          <path d="M0,290 C100,265 200,295 300,275 C400,255 500,285 600,268 C700,251 800,278 900,265 C1000,252 1100,272 1200,260 C1300,248 1380,268 1440,260 L1440,340 L0,340 Z" fill="#0A1E10" opacity="0.8"/>
          <g fill="#0F2619" opacity="0.6">
            <ellipse cx="180" cy="258" rx="7" ry="28"/><ellipse cx="195" cy="252" rx="6" ry="32"/><ellipse cx="210" cy="260" rx="6" ry="26"/>
            <ellipse cx="920" cy="262" rx="7" ry="30"/><ellipse cx="934" cy="254" rx="6" ry="35"/><ellipse cx="948" cy="264" rx="6" ry="28"/>
            <ellipse cx="1260" cy="256" rx="7" ry="32"/><ellipse cx="1274" cy="248" rx="6" ry="37"/><ellipse cx="1288" cy="258" rx="6" ry="30"/>
          </g>
          <path d="M0,312 C120,298 240,316 360,306 C480,296 600,313 720,305 C840,297 960,311 1080,303 C1200,295 1320,309 1440,301 L1440,340 L0,340 Z" fill="#0A1E10"/>
        </svg>
      </div>

      <div className="hero-content">
        <p className="hero-eyebrow">{t('eyebrow')}</p>

        <h1 className="hero-headline">
          {isHe ? (
            <>
              {t('headlineLine1')}<br />
              {t('headlineLine2')} <span className="accent">{t('headlineAccent')}</span><br />
              <em>{t('headlineItalic')}</em>
            </>
          ) : (
            <>
              {t('headlineLine1')}<br />
              {t('headlineLine2')}<br />
              <span className="accent"><em>{t('headlineItalic')}</em></span>
            </>
          )}
        </h1>

        <p className="hero-sub">{t('sub')}</p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => goTo('services')}>
            {t('ctaPrimary')}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isHe ? 'scaleX(-1)' : 'none' }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <span className="hero-divider">{t('or')}</span>
          <a className="btn-secondary" href={waHref} target="_blank" rel="noopener noreferrer">
            {t('ctaSecondary')}
          </a>
        </div>
      </div>

      <div className="scroll-hint">
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
