import { useTranslations } from 'next-intl';

interface WhyCard {
  icon: string;
  title: string;
  text: string;
}

export default function WhyUs() {
  const t = useTranslations('why');
  const cards = t.raw('cards') as WhyCard[];

  return (
    <section className="why-section" id="why">
      <div className="container">
        <p className="section-label fade-up">{t('label')}</p>
        <h2 className="section-headline fade-up d1">
          {t('headline1')}<br />
          <em>{t('headlineItalic')}</em>
        </h2>
        <div className="why-grid">
          {cards.map((card, i) => (
            <div key={i} className={`why-card fade-up d${i + 1}`}>
              <div className="why-icon">{card.icon}</div>
              <div className="why-title">{card.title}</div>
              <p className="why-text">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
