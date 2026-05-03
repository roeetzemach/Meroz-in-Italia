import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/SignOutButton';

type Props = {
  params: Promise<{ locale: string }>;
};

// Placeholder dashboard. The full client portal (meetings, trip plan,
// files, payments) will be built in a later phase per the project plan.
// This page exists so the "My Account" link in the navbar doesn't 404.
export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Defensive: middleware should already protect this route, but redirecting
  // here ensures the page never renders for an anonymous visitor even if
  // middleware config drifts in the future.
  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const t = await getTranslations('dashboard');

  // Pull a display name from user metadata; fall back to email if missing.
  // Email signup stores first_name; Google OAuth stores full_name/name.
  const meta = user.user_metadata as { first_name?: string; full_name?: string; name?: string };
  const displayName = meta.first_name || meta.full_name || meta.name || user.email || '';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        background: 'var(--cream)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--green)',
            marginBottom: '1rem',
          }}
        >
          {t('welcome', { name: displayName })}
        </h1>
        <p style={{ color: 'var(--green)', marginBottom: '0.5rem', fontWeight: 600 }}>
          {t('comingSoon')}
        </p>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--brown)',
            lineHeight: 1.6,
            marginBottom: '2rem',
          }}
        >
          {t('comingSoonBody')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <SignOutButton label={t('signOut')} locale={locale} />
        </div>
        <Link href={`/${locale}`} className="auth-back-link" style={{ display: 'inline-block' }}>
          ← {t('backToHome')}
        </Link>
      </div>
    </div>
  );
}
