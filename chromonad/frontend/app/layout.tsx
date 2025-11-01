import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anti-Geyser Rewards',
  description: 'Capital-efficient rewards engine that discourages transient farming',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

