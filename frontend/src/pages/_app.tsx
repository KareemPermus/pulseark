import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { initErrorReporter } from '@/lib/errorReporter';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initErrorReporter();
  }, []);

  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
}