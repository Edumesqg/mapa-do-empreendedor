import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

/** Bloco resumido do fundamento na home. O catálogo e os capítulos continuam em /fundamento. */
export function HomePanels() {
  return (
    <section className="bg-white px-5 py-10 sm:px-8 lg:py-16" aria-labelledby="fundamento-titulo">
      <div className="mx-auto max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-[28px] border border-[#cde6f9] bg-[#e9f5ff] p-7 sm:p-10 lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border-[70px] border-sky-300/20" />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-9">
            <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[22px] border border-sky-200 bg-white text-[#087de0] shadow-sm">
              <BookOpen className="h-10 w-10" aria-hidden="true" strokeWidth={1.65} />
            </div>
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0876cf]">O conhecimento por trás do projeto</p>
              <h2 id="fundamento-titulo" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#07294a] sm:text-3xl">
                Fundamento acadêmico. Experiência prática.
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
                O diagnóstico foi construído com base na literatura de administração e estratégia, combinada com aprendizados de projetos de consultoria. O método explica o que sustenta cada parte da SWOT — sem transformar intenção em oportunidade ou opinião em fato.
              </p>
              <Link href="/fundamento" className="mt-5 inline-flex items-center gap-2 font-semibold text-[#076cbf] underline-offset-4 transition hover:text-[#034b86] hover:underline">
                Conhecer o fundamento <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
