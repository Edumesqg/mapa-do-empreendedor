import Link from 'next/link';
import { MarkdownDoc } from '@/components/fundamento/MarkdownDoc';
import { SiteHeader } from '@/components/site/SiteHeader';
import { chapters, type Chapter } from '@/lib/fundamento-catalog';

export function DocShell({ chapter, source }: { chapter: Chapter; source: string }) {
  const index = chapters.findIndex((item) => item.slug === chapter.slug);
  const previous = index > 0 ? chapters[index - 1] : null;
  const next = index < chapters.length - 1 ? chapters[index + 1] : null;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="md:sticky md:top-6 md:self-start">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-royal-blue">Fundamento</p>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-2 md:block md:space-y-1 md:overflow-visible md:pb-0">
            {chapters.map((item, itemIndex) => {
              const active = item.slug === chapter.slug;
              return (
                <Link
                  key={item.slug}
                  href={`/fundamento/${item.slug}`}
                  className={`block shrink-0 rounded-lg px-3 py-2 text-sm leading-snug ${
                    active ? 'bg-navy-blue text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="mr-2 text-xs opacity-70">{String(itemIndex).padStart(2, '0')}</span>
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>
        <article className="min-w-0 pb-16">
          <p className="text-sm text-slate-500">
            Capítulo {index + 1} de {chapters.length} · {chapter.entra}
          </p>
          <div className="mt-4">
            <MarkdownDoc source={source} />
          </div>
          <div className="mt-12 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2">
            {previous ? (
              <Link href={`/fundamento/${previous.slug}`} className="rounded-xl border border-slate-200 p-4 hover:border-royal-blue">
                <p className="text-xs uppercase tracking-wide text-slate-500">Anterior</p>
                <p className="mt-1 font-semibold text-navy-blue">{previous.title}</p>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/fundamento/${next.slug}`} className="rounded-xl border border-slate-200 p-4 text-right hover:border-royal-blue">
                <p className="text-xs uppercase tracking-wide text-slate-500">Próximo</p>
                <p className="mt-1 font-semibold text-navy-blue">{next.title}</p>
              </Link>
            ) : null}
          </div>
        </article>
      </div>
    </div>
  );
}
