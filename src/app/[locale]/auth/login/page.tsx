'use client'

import { useState, Suspense } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

// ─── Google icon SVG (inline, no external dependency) ────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}

// ─── The actual form — wrapped in Suspense because it uses useSearchParams ───
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

  // ── Password login ─────────────────────────────────────────────────────────
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(t('errors.invalidCredentials'))
      setIsLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  // ── Magic link ─────────────────────────────────────────────────────────────
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const callbackUrl = `${window.location.origin}/${locale}/auth/callback`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    })

    if (error) {
      setError(t('errors.generic'))
      setIsLoading(false)
      return
    }

    setMagicLinkSent(true)
    setIsLoading(false)
  }

  // ── Google OAuth ───────────────────────────────────────────────────────────
  async function handleGoogleLogin() {
    setIsLoading(true)
    const callbackUrl = `${window.location.origin}/${locale}/auth/callback`

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
    // Page will redirect — no need to reset loading state
  }

  // ── Magic link sent confirmation ───────────────────────────────────────────
  if (magicLinkSent) {
    return (
      <div className="text-center py-6">
        <div
          className="text-5xl mb-4"
          role="img"
          aria-label={locale === 'he' ? 'מעטפה' : 'envelope'}
        >
          ✉️
        </div>
        <p className="text-[#1B3A2D] font-semibold text-lg mb-2">
          {t('magicLinkSentTitle')}
        </p>
        <p className="text-[#5C4A35] text-sm leading-relaxed">
          {t('magicLinkSentBody', { email })}
        </p>
        <button
          onClick={() => {
            setMagicLinkSent(false)
            setEmail('')
          }}
          className="mt-6 text-sm text-[#1B3A2D] underline underline-offset-2 hover:text-[#6B1E2A] transition-colors"
        >
          {t('magicLinkTryAgain')}
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {error}
        </div>
      )}

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-[#C8B99A] bg-white text-[#3D2B1F] text-sm font-medium hover:bg-[#FAF7F2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-5"
      >
        <GoogleIcon />
        {t('googleButton')}
      </button>

      {/* OR divider */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#D9CCBA]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-[#8B7355]">{t('orDivider')}</span>
        </div>
      </div>

      {/* Password form */}
      {mode === 'password' && (
        <form onSubmit={handlePasswordLogin} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#3D2B1F] mb-1.5">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8B99A] bg-white text-[#3D2B1F] text-sm placeholder:text-[#B0A090] focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/30 focus:border-[#1B3A2D] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-[#3D2B1F]">
                {t('password')}
              </label>
              <Link
                href={`/${locale}/auth/forgot-password`}
                className="text-xs text-[#1B3A2D] hover:text-[#6B1E2A] underline underline-offset-2 transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8B99A] bg-white text-[#3D2B1F] text-sm placeholder:text-[#B0A090] focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/30 focus:border-[#1B3A2D] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-3 px-4 rounded-lg bg-[#1B3A2D] text-[#F5F0E8] text-sm font-semibold hover:bg-[#6B1E2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {isLoading ? t('loading') : t('loginButton')}
          </button>
        </form>
      )}

      {/* Magic link form */}
      {mode === 'magic-link' && (
        <form onSubmit={handleMagicLink} noValidate className="space-y-4">
          <div>
            <label htmlFor="email-magic" className="block text-sm font-medium text-[#3D2B1F] mb-1.5">
              {t('email')}
            </label>
            <input
              id="email-magic"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8B99A] bg-white text-[#3D2B1F] text-sm placeholder:text-[#B0A090] focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/30 focus:border-[#1B3A2D] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-3 px-4 rounded-lg bg-[#1B3A2D] text-[#F5F0E8] text-sm font-semibold hover:bg-[#6B1E2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('loading') : t('magicLinkButton')}
          </button>
        </form>
      )}

      {/* Toggle between password and magic link */}
      <div className="mt-4 text-center">
        {mode === 'password' ? (
          <button
            type="button"
            onClick={() => { setMode('magic-link'); setError(null) }}
            className="text-xs text-[#5C4A35] hover:text-[#1B3A2D] underline underline-offset-2 transition-colors"
          >
            {t('switchToMagicLink')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => { setMode('password'); setError(null) }}
            className="text-xs text-[#5C4A35] hover:text-[#1B3A2D] underline underline-offset-2 transition-colors"
          >
            {t('switchToPassword')}
          </button>
        )}
      </div>
    </>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const t = useTranslations('auth.login')
  const locale = useLocale()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#D9CCBA] overflow-hidden shadow-sm">
        {/* Card header — forest green band */}
        <div
          className="flex flex-col items-center pt-8 pb-6 px-8"
          style={{ backgroundColor: '#1B3A2D' }}
        >
          <Image
            src="/logo.png"
            alt="Meroz In Italia"
            width={72}
            height={72}
            className="rounded-full mb-4"
            priority
          />
          <h1 className="text-[#F5F0E8] text-xl font-bold tracking-wide">
            {t('title')}
          </h1>
          <p className="text-[#A8C4B0] text-sm mt-1">{t('subtitle')}</p>
        </div>

        {/* Card body */}
        <div className="px-8 py-7">
          <Suspense fallback={<div className="h-48 animate-pulse bg-[#F5F0E8] rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Card footer — register link */}
        <div className="px-8 pb-7 text-center text-sm text-[#5C4A35]">
          {t('noAccount')}{' '}
          <Link
            href={`/${locale}/auth/register`}
            className="text-[#1B3A2D] font-semibold hover:text-[#6B1E2A] underline underline-offset-2 transition-colors"
          >
            {t('registerLink')}
          </Link>
        </div>
      </div>

      {/* Back to home */}
      <Link
        href={`/${locale}`}
        className="mt-6 text-sm text-[#5C4A35] hover:text-[#1B3A2D] transition-colors"
      >
        ← {t('backToHome')}
      </Link>
    </div>
  )
}
