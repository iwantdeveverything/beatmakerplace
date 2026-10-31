import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { PlayerProvider } from '../modules/player/context/PlayerContext';
import { Navbar } from '../components/Navbar';
import { GlobalBottomPlayer } from '../modules/player/components/GlobalBottomPlayer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BeatMakerPlace | Compra Beats & Instrumentales Exclusivas',
  description:
    'Tienda oficial de instrumentales. Escuchá previews en tiempo real y adquirí licencias con WAV master y stems directamente vía WhatsApp.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
        <PlayerProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <GlobalBottomPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
