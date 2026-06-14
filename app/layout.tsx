import type { Metadata } from 'next';
import './globals.css';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Tranime CMS - Anime Management Panel',
  description: 'Local anime content management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <DashboardLayout>
          {children}
        </DashboardLayout>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
        />
      </body>
    </html>
  );
}
