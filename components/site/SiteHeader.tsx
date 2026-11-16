'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Mantém as rotas existentes. "Como usar" aponta para uma seção da própria home.
const links = [
  { href: '/#como-usar', label: 'Como usar', match: null },
  { href: '/fundamento', label: 'Fundamento', match: '/fundamento' },
  { href: '/diagnostico', label: 'Diagnóstico', match: '/diagnostico' },
  { href: '/swot', label: 'SWOT', match: '/swot' },
  { href: '/consulta', label: 'Reunião', match: '/consulta' },
  { href: '/config', label: 'Config', match: '/config' },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="relative z-30 border-b border-white/10 bg-[#061f3c] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <Link href="/" className="group inline-flex w-fit items-center gap-3 text-lg font-bold tracking-[-0.035em] text-white focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300">
          <span aria-hidden="true" className="flex h-8 items-end gap-[3px]">
            <span className="h-[11px] w-[6px] rounded-[2px] bg-[#2aa8ff]" />
            <span className="h-[19px] w-[6px] rounded-[2px] bg-[#2aa8ff]" />
            <span className="h-[27px] w-[6px] rounded-[2px] bg-[#2aa8ff]" />
          </span>
          <span>Autoconsultoria</span>
        </Link>

        <nav aria-label="Navegação principal" className="flex items-center gap-5 overflow-x-auto whitespace-nowrap pb-1 text-sm text-slate-200 lg:gap-7 lg:overflow-visible lg:pb-0">
          {links.map((link) => {
            const active = link.match !== null && (pathname === link.match || pathname.startsWith(`${link.match}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-sm transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300 ${active ? 'font-semibold text-white' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
