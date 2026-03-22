import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations('about');

  return (
    <section className="about-section" id="about">
      <div className="container">
        <p className="section-label fade-up">{t('label')}</p>
        <div className="about-inner">
          <div className="about-quote fade-up d1">
            {t('quote')}
          </div>
          <div className="fade-up d2">
            <div className="about-body">
              <p>{t('p1')}</p>
              <p>{t('p2')}</p>
              <p>{t('p3')}</p>
            </div>
            <p className="about-sig">{t('sig')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
