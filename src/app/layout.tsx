import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CreatorCoach AI — Gaming Creator Growth Coach',
  description:
    'Turn Gaming Clips Into Smarter Content. Actionable analytics, open-weight AI coaching, retention hooks, and weekly content planning for Minecraft, Valorant, BGMI, and CODM (Call of Duty: Mobile) creators on Instagram Reels and YouTube Shorts.',
  keywords: [
    'Gaming Creator',
    'Creator Growth',
    'YouTube Shorts Analytics',
    'Instagram Reels Gaming',
    'Minecraft Shorts',
    'Valorant Clips',
    'BGMI Reels',
    'CODM Highlights',
    'Call of Duty Mobile Clips',
    'Ollama AI Coach',
    'Open-Weight AI',
  ],
  authors: [{ name: 'CreatorCoach AI Team' }],
};

export const viewport: Viewport = {
  themeColor: '#090b10',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090b10] text-slate-100 selection:bg-purple-500/30">
        {children}
      </body>
    </html>
  );
}
