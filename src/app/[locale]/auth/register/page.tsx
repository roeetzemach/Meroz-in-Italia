'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

// ─── Google icon (inline, no external dependency) ────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
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

  const supabase = createClient()

  // ── Email + password registration ──────────────────────────────────────────
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Client-side validation before hitting the network
    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'))
      return
    }
    if (password.length < 8) {
      setError(t('errors.passwordTooShort'))
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // These values are stored in raw_user_meta_data and read by the
        // database trigger that creates the profile row automatically.
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
        },
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        setError(t('errors.emailInUse'))
      } else {
        setError(t('errors.generic'))
      }
      setIsLoading(false)
      return
    }

    // Success — Supabase sends a confirmation email.
    // Show confirmation screen rather than redirecting.
    setRegistered(true)
    setIsLoading(false)
  }

  // ── Google OAuth ───────────────────────────────────────────────────────────
  async function handleGoogleRegister() {
    setIsLoading(true)
    const callbackUrl = `${window.location.origin}/${locale}/auth/callback`

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
  }

  // ── Registration success screen ────────────────────────────────────────────
  if (registered) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ backgroundColor: '#F5F0E8' }}
      >
        <div className="w-full max-w-sm bg-white rounded-2xl border border-[#D9CCBA] overflow-hidden shadow-sm">
          <div
            className="flex flex-col items-center pt-8 pb-6 px-8"
            style={{ backgroundColor: '#1B3A2D' }}
          >
            <Image src="/logo.png" alt="Meroz In Italia" width={72} height={72} className="rounded-full mb-4" />
            <h1 className="text-[#F5F0E8] text-xl font-bold">{t('successTitle')}</h1>
          </div>
          <div className="px-8 py-8 text-center">
            <div className="text-5xl mb-4" role="img" aria-label="envelope">✉️</div>
            <p className="text-[#1B3A2D] font-semibold text-base mb-2">
              {t('successHeading')}
            </p>
            <p className="text-[#5C4A35] text-sm leading-relaxed">
              {t('successBody', { email })}
            </p>
            <Link
              href={`/${locale}/auth/login`}
              className="mt-7 inline-block w-full py-3 px-4 rounded-lg bg-[#1B3A2D] text-[#F5F0E8] text-sm font-semibold text-center hover:bg-[#6B1E2A] transition-colors"
            >
              {t('goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#D9CCBA] overflow-hidden shadow-sm">
        {/* Header */}
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
          <p className="text-[#A8C4B0] text-sm mt-1 text-center leading-snug">
            {t('subtitle')}
          </p>
        </div>

        {/* Form body */}
        <div className="px-8 py-7">
          {/* Error banner */}
          {error && (
            <div role="alert" className="mb-4 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
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

          {/* Registration form */}
          <form onSubmit={handleRegister} noValidate className="space-y-4">
            {/* First name + Last name — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-[#3D2B1F] mb-1.5">
                  {t('firstName')}
                </label>
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#C8B99A] bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/30 focus:border-[#1B3A2D] transition-colors"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-[#3D2B1F] mb-1.5">
                  {t('lastName')}
                </label>
                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#C8B99A] bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/30 focus:border-[#1B3A2D] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#3D2B1F] mb-1.5">
                {t('phone')}{' '}
                <span className="text-[#8B7355] font-normal text-xs">{t('phoneOptional')}</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+972 50 000 0000"
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8B99A] bg-white text-[#3D2B1F] text-sm placeholder:text-[#B0A090] focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/30 focus:border-[#1B3A2D] transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#3D2B1F] mb-1.5">
                {t('password')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8B99A] bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/30 focus:border-[#1B3A2D] transition-colors"
              />
              <p className="mt-1 text-xs text-[#8B7355]">{t('passwordHint')}</p>
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#3D2B1F] mb-1.5">
                {t('confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8B99A] bg-white text-[#3D2B1F] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/30 focus:border-[#1B3A2D] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !firstName || !lastName || !email || !password || !confirmPassword}
              className="w-full py-3 px-4 rounded-lg bg-[#1B3A2D] text-[#F5F0E8] text-sm font-semibold hover:bg-[#6B1E2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {isLoading ? t('loading') : t('registerButton')}
            </button>
          </form>
        </div>

        {/* Footer — login link */}
        <div className="px-8 pb-7 text-center text-sm text-[#5C4A35]">
          {t('hasAccount')}{' '}
          <Link
            href={`/${locale}/auth/login`}
            className="text-[#1B3A2D] font-semibold hover:text-[#6B1E2A] underline underline-offset-2 transition-colors"
          >
            {t('loginLink')}
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
