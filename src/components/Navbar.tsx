'use client';

import React from 'react';
import Link from 'next/link';
import { Disc3, MessageCircle, Sliders } from 'lucide-react';

interface NavbarProps {
  whatsAppPhone?: string;
}

export function Navbar({ whatsAppPhone = '521234567890' }: NavbarProps) {
  const cleanPhone = whatsAppPhone.replace(/\D/g, '');
  const generalChatUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    '¡Hola! Estuve viendo tu catálogo en BeatMakerPlace y me gustaría consultar sobre beats personalizados y licencias.'
  )}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30 transition group-hover:bg-amber-500 group-hover:text-zinc-950">
            <Disc3 className="h-5 w-5 transition group-hover:rotate-45" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">
              BeatMaker<span className="text-amber-500">Place</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Official Store
            </span>
          </div>
        </Link>

        {/* Actions */}
        <nav className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Admin CMS</span>
          </Link>

          <a
            href={generalChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:border-emerald-500/50 hover:bg-zinc-800 hover:text-emerald-400"
          >
            <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>Contacto WhatsApp</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
