'use client';

import ReactMarkdown, { type Components } from 'react-markdown';

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-royal-blue first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => <h3 className="mb-1 mt-4 text-sm font-semibold text-navy-blue">{children}</h3>,
  p: ({ children }) => <p className="mt-3 text-sm leading-relaxed text-carbon first:mt-0">{children}</p>,
  ul: ({ children }) => <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-carbon">{children}</ul>,
  ol: ({ children }) => <ol className="mt-2 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-carbon">{children}</ol>,
  li: ({ children }) => <li className="pl-1 [&_p]:mt-0">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-navy-blue">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} className="text-royal-blue underline underline-offset-2" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

export function tidyAgentMarkdown(source: string) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];

  for (const line of lines) {
    const section = line.match(/^\s*[-*]\s+\*\*(O que é de (?:dentro|fora)[^*]*)\*\*:?\s*$/i);
    if (section) {
      out.push('', `## ${section[1].replace(/:$/, '').trim()}`, '');
      continue;
    }

    const labeled = line.match(
      /^\s*[-*]\s+\*\*((?:Força|Forças|Fraqueza|Fraquezas|Oportunidades e Ameaças|Oportunidades|Ameaças)):?\*\*:?\s*(.*)$/i
    );
    if (labeled) {
      out.push('', `### ${labeled[1]}`, '', labeled[2].trim());
      continue;
    }

    out.push(line);
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function AgentReply({ content }: { content: string }) {
  return (
    <div className="agent-reply">
      <ReactMarkdown components={components}>{tidyAgentMarkdown(content)}</ReactMarkdown>
    </div>
  );
}
