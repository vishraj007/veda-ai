import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import AppLayout from '@/components/layout/AppLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'VedaAI - AI Assessment Creator',
  description: 'Create AI-powered question papers and assessments for your students with VedaAI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppLayout>{children}</AppLayout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              background: '#1F2937',
              color: '#fff',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
