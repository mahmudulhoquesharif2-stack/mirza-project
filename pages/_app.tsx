import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import '../styles/globals.css';

function VisitorTracker() {
  const router = useRouter();

  useEffect(() => {
    // Track on initial load
    const trackVisit = async () => {
      try {
        await fetch('/api/stats/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: window.location.pathname }),
        });
      } catch (err) {
        console.error('Failed to track visit:', err);
      }
    };

    trackVisit();
  }, []);

  useEffect(() => {
    // Track on route change
    const handleRouteChange = async (url: string) => {
      try {
        await fetch('/api/stats/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: url }),
        });
      } catch (err) {
        console.error('Failed to track visit:', err);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <VisitorTracker />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
