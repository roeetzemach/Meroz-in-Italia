'use client';

import { useTranslations } from 'next-intl';

interface FooterLink {
  label: string;
  href: string;
}

export default function Footer() {
  const t = useTranslations('footer');
  const links = t.raw('links') as FooterLink[];

  function goTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-logo">
              Meroz <span style={{ color: 'var(--burgundy-lt)', fontStyle: 'italic' }}>In Italia</span>
              <small>{t('tagline')}</small>
            </div>
          </div>
          <div className="footer-links">
            {links.map((link, i) => (
              <a
                key={i}
                href={`#${link.href}`}
                onClick={(e) => { e.preventDefault(); goTo(link.href); }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="footer-contact">
            <a href="tel:+393517231156" dir="ltr">📞 +39 351-723-1156 </a>
            <a href="https://wa.me/393517231156" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
            <a href="https://instagram.com/meroz_in_toscana" target="_blank" rel="noopener noreferrer">📷 @Meroz_In_Toscana</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t('copyright')}</span>
          <span>merozinitalia.com</span>
        </div>
      </div>
    </footer>
  );
}
