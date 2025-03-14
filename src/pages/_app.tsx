import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';

function OpenVDR({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default OpenVDR;
