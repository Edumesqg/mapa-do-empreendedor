'use client';

import Link from 'next/link';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hrefForMarkdownLink } from '@/lib/fundamento-catalog';

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-semibold tracking-tight text-navy-blue md:text-4xl">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 text-2xl font-semibold text-navy-blue">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="mt-8 text-xl font-semibold text-carbon">{children}</h3>,
  p: ({ children }) => <p className="mt-4 text-base leading-relaxed text-slate-700">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-4 border-royal-blue bg-slate-50 px-4 py-1 text-slate-700">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-700">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-carbon">{children}</strong>,
  a: ({ href, children }) => {
    const internal = href ? hrefForMarkdownLink(href) : null;
    if (internal) {
      return (
        <Link href={internal} className="text-royal-blue underline underline-offset-2">
          {children}
        </Link>
      );
    }
    const external = href?.startsWith('http');
    return (
      <a
        href={href}
        className="text-royal-blue underline underline-offset-2"
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-slate-200 px-3 py-3 font-semibold text-carbon">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-100 px-3 py-3 align-top leading-relaxed text-slate-700">{children}</td>
  ),
  hr: () => <hr className="my-8 border-slate-200" />,
};

export function MarkdownDoc({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {source}
    </ReactMarkdown>
  );
}
