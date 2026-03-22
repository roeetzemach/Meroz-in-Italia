'use client';

import { useEffect } from 'react';

export default function FadeObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -28px 0px' }
    );

    document.querySelectorAll('.fade-up').forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return null;
}
