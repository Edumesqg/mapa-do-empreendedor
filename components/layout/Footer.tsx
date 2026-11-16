import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#041b33] text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold tracking-tight text-white">Autoconsultoria</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Um projeto independente e open source de Eduardo Mesquita Gomes. Conhecimento em estratégia mais próximo de quem empreende.
          </p>
        </div>
        <nav aria-label="Links do rodapé" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          <Link href="/fundamento" className="transition hover:text-white">Fundamento</Link>
          <Link href="/diagnostico" className="transition hover:text-white">Diagnóstico</Link>
          <Link href="/config" className="transition hover:text-white">Sua API</Link>
          <Link href="/consulta" className="transition hover:text-white">Reunião</Link>
        </nav>
      </div>
    </footer>
  );
}
