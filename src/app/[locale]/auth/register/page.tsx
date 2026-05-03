'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

// Whitelist matches Services.tsx. Anything else from the URL is silently
// ignored — prevents arbitrary strings being injected into user metadata
// via crafted register links.
const VALID_SERVICES = ['full_planning', 'consultation', 'existing_trip'] as const;
const SERVICE_STORAGE_KEY = 'pending_service';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const locale = useLocale()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(false)
  const [serviceType, setServiceType] = useState<string | null>(null)

  const supabase = createClient()

  // On mount: capture ?service= from the URL and persist to sessionStorage
  // so it survives the Google OAuth round-trip (which strips options.data).
  // If no URL param but a value was previously stashed (user came back to
  // this page after abandoning OAuth), reload it so they don't lose intent.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('service');

    if (fromUrl && (VALID_SERVICES as readonly string[]).includes(fromUrl)) {
      sessionStorage.setItem(SERVICE_STORAGE_KEY, fromUrl);
      setServiceType(fromUrl);
      return;
    }

    const stashed = sessionStorage.getItem(SERVICE_STORAGE_KEY);
    if (stashed && (VALID_SERVICES as readonly string[]).includes(stashed)) {
      setServiceType(stashed);
    }
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) { setError(t('errors.passwordMismatch')); return }
    if (password.length < 8) { setError(t('errors.passwordTooShort')); return }
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          // Service intent is written to raw_user_meta_data here. The DB
          // trigger handle_new_user() will be updated in a later chat to
          // read this and write it to leads.service_type.
          service_type: serviceType,
        }
      },
    })
    if (error) {
      setError(error.message.toLowerCase().includes('already registered') ? t('errors.emailInUse') : t('errors.generic'))
      setIsLoading(false)
      return
    }
    // Service intent has been captured in user metadata — clear stash so
    // it doesn't leak into a different signup later in the same browser.
    sessionStorage.removeItem(SERVICE_STORAGE_KEY);
    setRegistered(true)
    setIsLoading(false)
  }

  async function handleGoogleRegister() {
    setIsLoading(true)
    // Service intent is already in sessionStorage (set by the useEffect
    // above). The OAuth callback handler will read it and write to leads
    // — that wiring will be added in a later chat.
    const callbackUrl = `${window.location.origin}/${locale}/auth/callback`
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl } })
  }

  // Success screen
  if (registered) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.5rem', background: 'var(--cream)' }}>
        <div style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
          <Image src="/logo.png" alt="Meroz In Italia" width={72} height={72}
            style={{ borderRadius: '50%', margin: '0 auto 1.5rem' }} />
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--green)', marginBottom: '0.5rem' }}>
            {t('successTitle')}
          </h1>
          <p style={{ fontWeight: 600, color: 'var(--green)', marginBottom: '0.5rem' }}>{t('successHeading')}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--brown)', lineHeight: 1.6 }}>{t('successBody', { email })}</p>
          <Link href={`/${locale}/auth/login`} className="auth-btn-primary"
            style={{ display: 'block', marginTop: '2rem', textDecoration: 'none', textAlign: 'center' }}>
            {t('goToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  const valuePropItems = [
    { icon: '🗺️', text: locale === 'he' ? 'תכנון מסלול אישי לטוסקנה' : 'Personal Tuscany itinerary' },
    { icon: '🏨', text: locale === 'he' ? 'המלצות מקומיות אמינות' : 'Trusted local recommendations' },
    { icon: '🤝', text: locale === 'he' ? 'ליווי מלא מתחילת הדרך' : 'Full support from day one' },
  ]

  return (
    <div className="auth-layout">

      {/* Brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-bg" aria-hidden="true" />
        <div className="auth-brand-overlay" aria-hidden="true" />
        <div className="auth-brand-content">
          <Image src="/logo.png" alt="Meroz In Italia" width={88} height={88}
            style={{ borderRadius: '50%', marginBottom: '1.5rem' }} priority />
          <div className="auth-brand-name">Meroz</div>
          <div className="auth-brand-italia-row">
            <div className="auth-brand-rule" />
            <span className="auth-brand-italia">In Italia</span>
            <div className="auth-brand-rule" />
          </div>
          {/* Value props shown on desktop via auth-brand-tagline class */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
            {valuePropItems.map((item, i) => (
              <div key={i} className="auth-brand-tagline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'start' }}
                dir={locale === 'he' ? 'rtl' : 'ltr'}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-brand-hills" aria-hidden="true">
          <svg viewBox="0 0 800 70" preserveAspectRatio="none" style={{ width: '100%', height: '48px', display: 'block' }}>
            <path d="M0,70 L0,45 Q120,8 240,38 Q360,62 480,28 Q600,4 720,32 L800,22 L800,70 Z" fill="rgba(8,22,14,0.6)" />
          </svg>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner-wide">
          <h1 className="auth-heading">{t('title')}</h1>
          <p className="auth-subheading">{t('subtitle')}</p>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button type="button" onClick={handleGoogleRegister} disabled={isLoading} className="auth-btn-google">
            <GoogleIcon />{t('googleButton')}
          </button>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">{t('orDivider')}</span>
          </div>

          <form onSubmit={handleRegister} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div className="auth-name-grid">
              <div>
                <label htmlFor="firstName" className="auth-label">{t('firstName')}</label>
                <input id="firstName" type="text" autoComplete="given-name" required
                  value={firstName} onChange={(e) => setFirstName(e.target.value)} className="auth-input" />
              </div>
              <div>
                <label htmlFor="lastName" className="auth-label">{t('lastName')}</label>
                <input id="lastName" type="text" autoComplete="family-name" required
                  value={lastName} onChange={(e) => setLastName(e.target.value)} className="auth-input" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="auth-label">{t('email')}</label>
              <input id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" dir="ltr" className="auth-input" />
            </div>

            <div>
              <label htmlFor="phone" className="auth-label">
                {t('phone')}{' '}
                <span style={{ fontWeight: 400, fontSize: '0.75rem', opacity: 0.6 }}>{t('phoneOptional')}</span>
              </label>
              <input id="phone" type="tel" autoComplete="tel"
                value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+972 50 000 0000" dir="ltr" className="auth-input" />
            </div>

            <div>
              <label htmlFor="password" className="auth-label">{t('password')}</label>
              <input id="password" type="password" autoComplete="new-password" required minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)}
                dir="ltr" className="auth-input" />
              <p className="auth-field-hint">{t('passwordHint')}</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="auth-label">{t('confirmPassword')}</label>
              <input id="confirmPassword" type="password" autoComplete="new-password" required
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                dir="ltr" className="auth-input" />
            </div>

            <button type="submit"
              disabled={isLoading || !firstName || !lastName || !email || !password || !confirmPassword}
              className="auth-btn-primary" style={{ marginTop: '0.25rem' }}>
              {isLoading ? t('loading') : t('registerButton')}
            </button>
          </form>

          <p className="auth-footer-text">
            {t('hasAccount')}{' '}
            <Link href={`/${locale}/auth/login`} className="auth-footer-link">{t('loginLink')}</Link>
          </p>
          <Link href={`/${locale}`} className="auth-back-link">← {t('backToHome')}</Link>
        </div>
      </div>

    </div>
  )
}
