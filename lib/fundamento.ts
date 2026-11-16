import fs from 'fs';
import path from 'path';
import { chapterBySlug } from '@/lib/fundamento-catalog';

export function loadChapter(slug: string) {
  const chapter = chapterBySlug(slug);
  if (!chapter) return null;
  const filePath = path.join(process.cwd(), 'refs', chapter.file);
  return fs.readFileSync(filePath, 'utf8');
}
