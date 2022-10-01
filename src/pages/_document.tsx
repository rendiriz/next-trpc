import { ReactElement } from 'react';
import Document, { Head, Html, Main, NextScript } from 'next/document';

const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

class MyDocument extends Document {
  render(): ReactElement {
    return (
      <Html lang="en">
        <Head>
          {isProduction && (
            <>
              <script
                data-partytown-config
                dangerouslySetInnerHTML={{
                  __html: `
                    partytown = {
                      lib: "/_next/static/~partytown/",
                      forward: ["gtag"]
                    };
                  `,
                }}
              />
              <script
                type="text/partytown"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    window.gtag = function gtag(){window.dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', { 
                      page_path: window.location.pathname,
                    });
                  `,
                }}
              />
            </>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
