'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface Review {
  quote: string;
  author: string;
  city: string;
}

const PREVIEW_LENGTH = 180;
const CARD_WIDTH = 340;
const CARD_GAP = 24;
const SPEED = 0.6;

function ReviewCard({ review, readMore, readLess, locale }: { review: Review; readMore: string; readLess: string; locale: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.quote.length > PREVIEW_LENGTH;
  const displayText = expanded || !isLong
    ? review.quote
    : review.quote.slice(0, PREVIEW_LENGTH).trimEnd() + '…';

  return (
    // Card text uses page direction, but layout is always ltr from parent
    <div className="marquee-card" dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <div className="testimonial-stars">★★★★★</div>
      <p className="testimonial-quote">״{displayText}״</p>
      {isLong && (
        <button
          className="review-expand-btn"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          {expanded ? readLess : readMore}
        </button>
      )}
      <div className="testimonial-author">
        {review.author}{review.city ? `, ${review.city}` : ''}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const t = useTranslations('testimonials');
  const locale = useLocale();
  const reviews = t.raw('reviews') as Review[];
  const readMore = t('readMore');
  const readLess = t('readLess');

  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);

  const oneSetWidth = (CARD_WIDTH + CARD_GAP) * reviews.length;

  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      if (!pausedRef.current && trackRef.current) {
        posRef.current += SPEED;
        if (posRef.current >= oneSetWidth) {
          posRef.current = 0;
        }
        // Always translate left — track layout is always ltr
        trackRef.current.style.transform = `translateX(-${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [oneSetWidth]);

  const doubled = [...reviews, ...reviews];

  return (
    <section className="testimonials-section" id="reviews">
      <div className="container">
        <p className="section-label fade-up">{t('label')}</p>
        <h2 className="section-headline fade-up d1">
          {t('headline1')}<br />
          <em>{t('headlineItalic')}</em>
        </h2>
      </div>

      <div
        className="marquee-outer"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {/* dir="ltr" here is the key — forces left-to-right card layout on both pages */}
        <div ref={trackRef} className="marquee-track" dir="ltr">
          {doubled.map((review, i) => (
            <ReviewCard key={i} review={review} readMore={readMore} readLess={readLess} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
