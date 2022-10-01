import Script from 'next/script';
import { withTRPC } from '@trpc/next';
import type { AppRouter } from '../server/router';
import type { AppType } from 'next/dist/shared/lib/utils';
import superjson from 'superjson';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import '../styles/globals.css';

const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <SessionProvider session={session}>
        <ThemeProvider attribute="class">
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
      {isProduction && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
          strategy="worker"
        />
      )}
    </>
  );
};

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      transformer: superjson,
      url,
      headers: {
        'x-ssr': '1',
      },
    };
  },
  ssr: true,
})(MyApp);
