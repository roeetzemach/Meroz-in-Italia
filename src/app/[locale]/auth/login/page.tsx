'use client'

import { useState, Suspense } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

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

function LoginForm() {
  const t = useTranslations('auth.login')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get('redirectTo') ?? `/${locale}/dashboard`
  const callbackError = searchParams.get('error')

  type Mode = 'password' | 'magic-link'
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    callbackError ? t('errors.callbackFailed') : null
  )
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const supabase = createClient()

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(t('errors.invalidCredentials')); setIsLoading(false); return }
    router.push(redirectTo)
    router.refresh()
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const callbackUrl = `${window.location.origin}/${locale}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: callbackUrl } })
    if (error) { setError(t('errors.generic')); setIsLoading(false); return }
    setMagicLinkSent(true)
    setIsLoading(false)
  }

  async function handleGoogleLogin() {
    setIsLoading(true)
    const callbackUrl = `${window.location.origin}/${locale}/auth/callback`
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl } })
  }

  if (magicLinkSent) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
        <p style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--green)', marginBottom: '0.5rem' }}>
          {t('magicLinkSentTitle')}
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--brown)', lineHeight: 1.6 }}>
          {t('magicLinkSentBody', { email })}
        </p>
        <button
          onClick={() => { setMagicLinkSent(false); setEmail('') }}
          style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
        >
          {t('magicLinkTryAgain')}
        </button>
      </div>
    )
  }

  return (
    <>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className="auth-btn-google">
        <GoogleIcon />{t('googleButton')}
      </button>

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-text">{t('orDivider')}</span>
      </div>

      {mode === 'password' && (
        <form onSubmit={handlePasswordLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email" className="auth-label">{t('email')}</label>
            <input id="email" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" dir="ltr" className="auth-input" />
          </div>
          <div>
            <div className="auth-label-row">
              <label htmlFor="password" className="auth-label" style={{ margin: 0 }}>{t('password')}</label>
              <Link href={`/${locale}/auth/forgot-password`} className="auth-forgot">{t('forgotPassword')}</Link>
            </div>
            <input id="password" type="password" autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              dir="ltr" className="auth-input" />
          </div>
          <button type="submit" disabled={isLoading || !email || !password}
            className="auth-btn-primary" style={{ marginTop: '0.25rem' }}>
            {isLoading ? t('loading') : t('loginButton')}
          </button>
        </form>
      )}

      {mode === 'magic-link' && (
        <form onSubmit={handleMagicLink} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email-magic" className="auth-label">{t('email')}</label>
            <input id="email-magic" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" dir="ltr" className="auth-input" />
          </div>
          <button type="submit" disabled={isLoading || !email} className="auth-btn-primary">
            {isLoading ? t('loading') : t('magicLinkButton')}
          </button>
        </form>
      )}

      <button type="button"
        onClick={() => { setMode(mode === 'password' ? 'magic-link' : 'password'); setError(null) }}
        className="auth-toggle-btn">
        {mode === 'password' ? t('switchToMagicLink') : t('switchToPassword')}
      </button>
    </>
  )
}

export default function LoginPage() {
  const t = useTranslations('auth.login')
  const locale = useLocale()

  return (
    <div className="auth-layout">

      {/* Brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-bg" aria-hidden="true" />
        <div className="auth-brand-overlay" aria-hidden="true" />
        <div className="auth-brand-content">
          <Image src="/logo.png" alt="Meroz In Italia" width={96} height={96}
            style={{ borderRadius: '50%', marginBottom: '1.5rem' }} priority />
          <div className="auth-brand-name">Meroz</div>
          <div className="auth-brand-italia-row">
            <div className="auth-brand-rule" />
            <span className="auth-brand-italia">In Italia</span>
            <div className="auth-brand-rule" />
          </div>
          <p className="auth-brand-tagline" dir="rtl">חוויית טוסקנה שלכם, מתוכננת במדויק</p>
          <p className="auth-brand-tagline-en">Your Tuscany. Perfectly planned.</p>
        </div>
        <div className="auth-brand-hills" aria-hidden="true">
          <svg viewBox="0 0 800 70" preserveAspectRatio="none" style={{ width: '100%', height: '48px', display: 'block' }}>
            <path d="M0,70 L0,45 Q120,8 240,38 Q360,62 480,28 Q600,4 720,32 L800,22 L800,70 Z" fill="rgba(8,22,14,0.6)" />
          </svg>
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <h1 className="auth-heading">{t('title')}</h1>
          <p className="auth-subheading">{t('subtitle')}</p>

          <Suspense fallback={<div style={{ height: '260px', borderRadius: '10px', background: 'var(--cream-dark)' }} />}>
            <LoginForm />
          </Suspense>

          <p className="auth-footer-text">
            {t('noAccount')}{' '}
            <Link href={`/${locale}/auth/register`} className="auth-footer-link">{t('registerLink')}</Link>
          </p>
          <Link href={`/${locale}`} className="auth-back-link">← {t('backToHome')}</Link>
        </div>
      </div>

    </div>
  )
}
