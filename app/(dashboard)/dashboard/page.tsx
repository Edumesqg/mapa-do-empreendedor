import { redirect } from 'next/navigation';

/** Dashboard legado (Luna/Jack/Nina/Typebot) fora do caminho. */
export default function DashboardPage() {
  redirect('/swot');
}
