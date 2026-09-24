import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cristal Builder — Build with AI',
  description: 'Design, create, and launch beautiful websites with Cristal AI.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
