'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

const WA_BASE = 'https://wa.me/393517231156?text=';

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

function ServiceCard({ pkg, index, howLabel }: { pkg: Package; index: number; howLabel: string }) {
  const [open, setOpen] = useState(false);

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
          <a
            className="btn-primary-green"
            href={WA_BASE + encodeURIComponent(pkg.waMsg)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {pkg.cta}
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
            <ServiceCard key={i} pkg={pkg} index={i} howLabel={howLabel} />
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
