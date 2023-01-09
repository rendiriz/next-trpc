import Script from 'next/script';
import type { AppType } from 'next/dist/shared/lib/utils';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import '../styles/globals.css';

import { api } from '../utils/api';

const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

const MyApp: AppType<{ session: any }> = ({
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

export default api.withTRPC(MyApp);
