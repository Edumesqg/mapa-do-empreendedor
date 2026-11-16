import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocShell } from '@/components/fundamento/DocShell';
import { chapterBySlug, chapters } from '@/lib/fundamento-catalog';
import { loadChapter } from '@/lib/fundamento';

export function generateStaticParams() {
  return chapters.map((chapter) => ({ slug: chapter.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const chapter = chapterBySlug(params.slug);
  if (!chapter) return { title: 'Fundamento · Autoconsultoria' };
  return {
    title: `${chapter.title} · Fundamento`,
    description: chapter.aprende,
  };
}

export default function FundamentoChapterPage({ params }: { params: { slug: string } }) {
  const chapter = chapterBySlug(params.slug);
  if (!chapter) notFound();
  const source = loadChapter(chapter.slug);
  if (!source) notFound();
  return <DocShell chapter={chapter} source={source} />;
}
