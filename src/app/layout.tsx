import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import './globals.css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Playground DAW',
  description: '브라우저 기반 전문 DAW + AI 작곡 도구',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistMono.variable} h-full dark`}>
      <body className="h-full overflow-hidden bg-zinc-900 font-mono text-zinc-100">
        {children}
      </body>
    </html>
  );
}
