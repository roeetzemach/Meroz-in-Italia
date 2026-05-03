'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  label: string;
  locale: string;
}

// Small client-side button used by the (server-rendered) dashboard page.
// Kept as a separate component so the dashboard itself stays a Server
// Component — the auth check + redirect runs before any HTML is sent.
export default function SignOutButton({ label, locale }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // router.refresh() forces server components (including Navbar's
    // initialUser prop on the homepage) to re-read auth state.
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="auth-btn-primary"
      style={{ width: '100%', maxWidth: '260px' }}
    >
      {loading ? '...' : label}
    </button>
  );
}
