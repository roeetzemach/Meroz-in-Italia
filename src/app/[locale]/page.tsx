import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import WhyUs from '@/components/WhyUs';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import WAFloat from '@/components/WAFloat';
import FadeObserver from '@/components/FadeObserver';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Read auth state on the server so the navbar renders the correct
  // login/account button on first paint — no flash of wrong state.
  // The Navbar then subscribes client-side to keep this fresh on
  // login/logout from other tabs.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Navbar initialUser={user} />
      <main>
        <Hero />
        <About />
        <Services />
        <WhyUs />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
      <WAFloat />
      <FadeObserver />
    </>
  );
}
