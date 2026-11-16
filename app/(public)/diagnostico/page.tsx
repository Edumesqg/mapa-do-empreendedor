'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SiteHeader } from '@/components/site/SiteHeader';
import {
  CONCORRENCIA,
  DESAFIO,
  DIGITAL,
  EQUIPE,
  EXPERIENCIA,
  FINANCEIRO,
  OBJETIVO,
  RECEITA,
  SETORES,
  labelOf,
} from '@/lib/intake';
import { getSetorLabel } from '@/lib/swot-generator';
import { Answers, EMPTY_ANSWERS, Session, loadSession, newId, saveSession } from '@/lib/session';

const fields: { key: keyof Answers; label: string; hint: string; options: { value: string; label: string }[] }[] = [
  { key: 'setor', label: 'Setor', hint: 'O que mais se parece com o que você vende.', options: SETORES },
  { key: 'experiencia', label: 'Tempo de mercado', hint: 'Desde que o negócio opera, não a sua carreira inteira.', options: EXPERIENCIA },
  { key: 'equipe', label: 'Equipe', hint: 'Quem trabalha hoje, incluindo você.', options: EQUIPE },
  { key: 'receita', label: 'Faturamento', hint: 'Média do mês, antes de descontar custos.', options: RECEITA },
  { key: 'situacaoFinanceira', label: 'Situação financeira', hint: 'Depois de pagar as contas: sobra, empata ou falta?', options: FINANCEIRO },
  { key: 'maiorDesafio', label: 'Maior desafio agora', hint: 'Um só. O que mais dói neste momento.', options: DESAFIO },
  { key: 'objetivoPrincipal', label: 'O que você quer neste ciclo', hint: 'O movimento deste ciclo, não o plano de dez anos.', options: OBJETIVO },
  { key: 'nivelDigitalizacao', label: 'Presença digital', hint: 'O quanto o cliente te encontra e compra pela internet.', options: DIGITAL },
  { key: 'concorrenciaPercebida', label: 'Concorrência que você sente', hint: 'Quantos parecidos o cliente compara com você.', options: CONCORRENCIA },
];

export default function DiagnosticoPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session?.answers) setAnswers(session.answers);
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!answers.empresaNome.trim() || answers.empresaNome.trim().length < 2) {
      setError('Diga o nome do negócio.');
      return;
    }

    const missing = fields.find((field) => !answers[field.key]);
    if (missing) {
      setError(`Falta responder: ${missing.label.toLowerCase()}.`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-swot-initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers,
          empresaNome: answers.empresaNome.trim(),
          diferenciacaoCompetitiva: [],
          observacoesAdicionais: answers.diferencial,
          quemCompra: answers.quemCompra,
          oQueRepete: answers.oQueRepete,
          pressaoExterna: answers.pressaoExterna,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível montar a SWOT.');
      }

      const toItems = (list: { texto: string }[] | undefined) =>
        (list || []).map((item) => ({ id: newId(), texto: item.texto }));

      const forcas = toItems(data.forcas);

      const session: Session = {
        answers: { ...answers, empresaNome: answers.empresaNome.trim() },
        setorLabel: getSetorLabel(answers.setor) || labelOf(SETORES, answers.setor),
        swot: {
          forcas,
          fraquezas: toItems(data.fraquezas),
          oportunidades: toItems(data.oportunidades),
          ameacas: toItems(data.ameacas),
        },
        lacunas: Array.isArray(data.lacunas) ? data.lacunas : [],
        updatedAt: new Date().toISOString(),
      };

      saveSession(session);
      router.push('/swot');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar a SWOT.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-gray">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-royal-blue">Diagnóstico</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy-blue">O que é o negócio, em uma tela.</h1>
        <p className="mt-3 text-slate-600">
          O quadro só recebe o que estas respostas sustentam. Desejo, elogio e número sem efeito ficam de fora, para a conversa perguntar depois. O critério está no{' '}
          <a href="/fundamento/analise-interna" className="text-royal-blue underline">
            fundamento
          </a>
          .
        </p>

        <ol className="mt-6 space-y-2 rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm">
          <li><span className="font-semibold text-carbon">1.</span> Nome do jeito que o cliente chama.</li>
          <li><span className="font-semibold text-carbon">2.</span> Todos os menus. Nenhum fica em “Selecione”.</li>
          <li><span className="font-semibold text-carbon">3.</span> Quem compra, o que a operação repete e uma pressão de fora. Pode ser uma frase.</li>
          <li><span className="font-semibold text-carbon">4.</span> Diferencial só se for concreto. Pode ficar em branco.</li>
          <li><span className="font-semibold text-carbon">5.</span> Gerar a SWOT, editar o que não representa a operação, colar a API e conversar.</li>
        </ol>

        <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <label className="block text-sm font-medium text-carbon">
            Nome do negócio
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Nome fantasia. Ex.: Padaria do João.
            </span>
            <Input
              value={answers.empresaNome}
              onChange={(event) =>
                setAnswers((current) => ({ ...current, empresaNome: event.target.value }))
              }
              placeholder="Ex.: Padaria do João"
              className="mt-2 h-12"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className="block text-sm font-medium text-carbon">
                {field.label}
                <span className="mt-1 block text-xs font-normal text-slate-500">{field.hint}</span>
                <select
                  value={answers[field.key]}
                  onChange={(event) =>
                    setAnswers((current) => ({ ...current, [field.key]: event.target.value }))
                  }
                  className="mt-2 h-12 w-full rounded-md border border-input bg-white px-3 text-sm"
                >
                  <option value="">Selecione</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <label className="block text-sm font-medium text-carbon">
            Quem compra e como escolhe
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Uma frase. Ex.: oficinas do bairro, que comparam prazo e não o menor preço.
            </span>
            <Textarea
              value={answers.quemCompra}
              onChange={(event) =>
                setAnswers((current) => ({ ...current, quemCompra: event.target.value }))
              }
              placeholder="Opcional, mas é o que permite falar de cliente sem chute."
              className="mt-2"
            />
          </label>

          <label className="block text-sm font-medium text-carbon">
            O que a operação consegue repetir
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Capacidade, não elogio. Ex.: entrega no mesmo dia quando o pedido entra até as 11h.
            </span>
            <Textarea
              value={answers.oQueRepete}
              onChange={(event) =>
                setAnswers((current) => ({ ...current, oQueRepete: event.target.value }))
              }
              placeholder="Opcional. Sem isso, o quadro não inventa uma força."
              className="mt-2"
            />
          </label>

          <label className="block text-sm font-medium text-carbon">
            Uma pressão de fora que você já viu
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Fato, não medo. Ex.: dois concorrentes passaram a entregar no mesmo bairro.
            </span>
            <Textarea
              value={answers.pressaoExterna}
              onChange={(event) =>
                setAnswers((current) => ({ ...current, pressaoExterna: event.target.value }))
              }
              placeholder="Opcional. Sem fato, a ameaça não entra."
              className="mt-2"
            />
          </label>

          <label className="block text-sm font-medium text-carbon">
            O que te diferencia, com as suas palavras
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Opcional. Uma frase concreta. Ex.: entrega no mesmo dia no bairro.
            </span>
            <Textarea
              value={answers.diferencial}
              onChange={(event) =>
                setAnswers((current) => ({ ...current, diferencial: event.target.value }))
              }
              placeholder="Opcional. Entra na SWOT e no contexto do agente."
              className="mt-2"
            />
          </label>

          {error && <p className="text-sm text-coral-red">{error}</p>}

          <Button type="submit" disabled={loading} className="h-12 bg-royal-blue px-8 text-white hover:bg-[#1565C0]">
            {loading ? 'Montando a SWOT...' : 'Gerar SWOT'}
          </Button>
        </form>
      </main>
    </div>
  );
}
