import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Navneet Shukla — Product Portfolio',
  description: 'Product management portfolio of Navneet Shukla.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
