import type { AppProps } from 'next/app';
import '@digital-platform/ui/src/styles/globals.css';
import { AuthProvider } from '../components/auth';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
