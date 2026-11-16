'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/site/SiteHeader';
import { Session, SwotBoard, SwotItem, loadSession, newId, saveSession } from '@/lib/session';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';

const quadrants: { key: keyof SwotBoard; title: string; hint: string; tone: string }[] = [
  { key: 'forcas', title: 'Forças', hint: 'Capacidade de dentro, com efeito. Elogio não entra.', tone: 'border-emerald-200 bg-emerald-50' },
  { key: 'fraquezas', title: 'Fraquezas', hint: 'Limite de dentro que trava um resultado.', tone: 'border-red-200 bg-red-50' },
  { key: 'oportunidades', title: 'Oportunidades', hint: 'Condição de fora, com público e benefício. Desejo não entra.', tone: 'border-sky-200 bg-sky-50' },
  { key: 'ameacas', title: 'Ameaças', hint: 'Pressão de fora, com exposição e mecanismo.', tone: 'border-amber-200 bg-amber-50' },
];

export default function SwotPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setSession(loadSession());
    setReady(true);
  }, []);

  const persist = (next: Session) => {
    const updated = { ...next, updatedAt: new Date().toISOString() };
    setSession(updated);
    saveSession(updated);
  };

  const updateItem = (key: keyof SwotBoard, id: string, texto: string) => {
    if (!session) return;
    persist({
      ...session,
      swot: {
        ...session.swot,
        [key]: session.swot[key].map((item) => (item.id === id ? { ...item, texto } : item)),
      },
    });
  };

  const removeItem = (key: keyof SwotBoard, id: string) => {
    if (!session) return;
    persist({
      ...session,
      swot: {
        ...session.swot,
        [key]: session.swot[key].filter((item) => item.id !== id),
      },
    });
  };

  const addItem = (key: keyof SwotBoard) => {
    if (!session) return;
    const item: SwotItem = { id: newId(), texto: 'Novo ponto' };
    persist({
      ...session,
      swot: { ...session.swot, [key]: [...session.swot[key], item] },
    });
    setEditing(item.id);
    setDraft(item.texto);
  };

  if (!ready) {
    return <div className="min-h-screen bg-slate-gray" />;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-gray">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 py-20 text-center">
          <h1 className="text-3xl font-semibold text-navy-blue">Ainda não há SWOT</h1>
          <p className="mt-3 text-slate-600">O quadro nasce do diagnóstico. Leva um minuto.</p>
          <Button className="mt-6 bg-royal-blue text-white" onClick={() => router.push('/diagnostico')}>
            Fazer o diagnóstico
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-gray">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-royal-blue">SWOT</p>
            <h1 className="mt-2 text-3xl font-semibold text-navy-blue">{session.answers.empresaNome}</h1>
            <p className="mt-2 text-slate-600">{session.setorLabel}. Quadrante vazio é lacuna, não falha do quadro. Edite o que não representa a operação: a reunião de diagnóstico usa esta versão.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/diagnostico">Refazer diagnóstico</Link>
            </Button>
            <Button asChild className="bg-emerald-green text-white hover:bg-emerald-600">
              <Link href="/consulta">Abrir reunião de diagnóstico</Link>
            </Button>
          </div>
        </div>

        {session.lacunas?.length > 0 && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-carbon">O que ficou de fora do quadro</h2>
            <p className="mt-1 text-sm text-slate-600">
              Isto não virou SWOT porque ainda é contexto, intenção ou hipótese. A conversa parte daqui.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
              {session.lacunas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {quadrants.map((quadrant) => (
            <section key={quadrant.key} className={`rounded-2xl border p-5 ${quadrant.tone}`}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-carbon">{quadrant.title}</h2>
                  <p className="text-sm text-slate-600">{quadrant.hint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addItem(quadrant.key)}
                  className="rounded-full bg-white p-2 text-carbon shadow-sm"
                  aria-label={`Adicionar em ${quadrant.title}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <ul className="space-y-3">
                {session.swot[quadrant.key].length === 0 && (
                  <li className="rounded-xl bg-white/80 p-3 text-sm leading-relaxed text-slate-600">
                    Nenhum item sustentado. A conversa precisa perguntar antes de preencher este quadrante.
                  </li>
                )}
                {session.swot[quadrant.key].map((item) => (
                  <li key={item.id} className="rounded-xl bg-white p-3 shadow-sm">
                    {editing === item.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          className="h-10"
                        />
                        <button
                          type="button"
                          className="rounded-md bg-navy-blue px-3 text-white"
                          onClick={() => {
                            updateItem(quadrant.key, item.id, draft.trim() || item.texto);
                            setEditing(null);
                          }}
                          aria-label="Salvar ponto"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm leading-relaxed text-carbon">{item.texto}</p>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                            onClick={() => {
                              setEditing(item.id);
                              setDraft(item.texto);
                            }}
                            aria-label="Editar ponto"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                            onClick={() => removeItem(quadrant.key, item.id)}
                            aria-label="Remover ponto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
