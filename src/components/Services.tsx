'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

const WA_BASE = 'https://wa.me/393517231156?text=';

// Stable IDs that map by index to the packages array in en.json / he.json.
// These values are written to user metadata at signup so the CRM trigger
// can record which service brought a lead in. ORDER MUST MATCH the
// packages array in both translation files.
const SERVICE_IDS = ['full_planning', 'consultation', 'existing_trip'] as const;

interface Package {
  badge?: string;
  icon: string;
  title: string;
  desc: string;
  includes: string[];
  price: string;
  priceUnit: string;
  priceAlt?: string;
  steps: string[];
  cta: string;
  waMsg: string;
}

interface Addon {
  title: string;
  desc: string;
  price: string;
}

function ServiceCard({
  pkg,
  index,
  howLabel,
  waFallbackLabel,
  locale,
}: {
  pkg: Package;
  index: number;
  howLabel: string;
  waFallbackLabel: string;
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const serviceId = SERVICE_IDS[index];

  return (
    <div className={`service-card fade-up d${index + 1}`}>
      {pkg.badge && <div className="service-badge">{pkg.badge}</div>}
      <div className="service-icon">{pkg.icon}</div>
      <div className="service-title">{pkg.title}</div>

      {/* ── Subsection 1: Explanation ── */}
      <div className="service-content">
        <p className="service-desc">{pkg.desc}</p>
        <ul className="service-includes">
          {pkg.includes.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* ── Subsection 2: Pricing ── */}
      <div className="service-pricing">
        <div className="price-main" dir="ltr">{pkg.price}</div>
        <div className="price-unit">{pkg.priceUnit}</div>
        {pkg.priceAlt && <div className="price-alt">{pkg.priceAlt}</div>}
      </div>

      {/* ── Subsection 3: CTA ── */}
      <div className="service-cta-section">
        <button
          className={`pkg-how-toggle${open ? ' open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <span>{howLabel}</span>
          <span className="arrow">▾</span>
        </button>
        <div className={`pkg-how-steps${open ? ' open' : ''}`}>
          <ol className="pkg-step-list">
            {pkg.steps.map((step, i) => (
              <li key={i} className="pkg-step">
                <span className="pkg-step-n">{i + 1}.</span>
                <span className="pkg-step-t">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="service-cta-row">
          {/* Primary CTA: route to register with service intent in URL.
              Register page reads ?service= and stores it in sessionStorage
              + user metadata so the CRM can attribute the lead. */}
          <Link
            className="btn-primary-green"
            href={`/${locale}/auth/register?service=${serviceId}`}
          >
            {pkg.cta}
          </Link>
          {/* Secondary low-friction option for users who'd rather skip signup.
              Kept inline-styled for now; if you decide to keep it long-term,
              move these styles to a .service-wa-fallback class in globals.css. */}
          <a
            href={WA_BASE + encodeURIComponent(pkg.waMsg)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              marginTop: '0.75rem',
              fontSize: '0.85rem',
              color: 'var(--brown)',
              textAlign: 'center',
              textDecoration: 'underline',
              opacity: 0.75,
            }}
          >
            {waFallbackLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  const t = useTranslations('services');
  const locale = useLocale();
  const howLabel = locale === 'he' ? 'איך זה עובד ←' : 'How it works ←';
  const packages = t.raw('packages') as Package[];
  const addons = t.raw('addons') as Addon[];
  const waFallbackLabel = t('waFallback');

  return (
    <section className="services-section" id="services">
      <div className="container">
        <p className="section-label fade-up">{t('label')}</p>
        <h2 className="section-headline fade-up d1">
          {t('headline1')}<br />
          <em>{t('headlineItalic')}</em>
        </h2>
        <p className="section-body services-intro fade-up d2">{t('intro')}</p>

        <div className="services-grid">
          {packages.map((pkg, i) => (
            <ServiceCard
              key={i}
              pkg={pkg}
              index={i}
              howLabel={howLabel}
              waFallbackLabel={waFallbackLabel}
              locale={locale}
            />
          ))}
        </div>

        <div className="addons-row fade-up">
          {addons.map((addon, i) => (
            <div key={i} className="addon-card">
              <div>
                <div className="addon-title">{addon.title}</div>
                <p className="addon-desc">{addon.desc}</p>
              </div>
              <div className="addon-price" dir="ltr">{addon.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
