import type { AppProps } from 'next/app';
import '@digital-platform/ui/src/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
