'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AgentReply } from '@/components/chat/AgentReply';
import { MeetingControls } from '@/components/chat/MeetingControls';
import { SiteHeader } from '@/components/site/SiteHeader';
import {
  AppConfig,
  CHAT_KEY,
  DEFAULT_CONFIG,
  Session,
  hydrateDevConfig,
  loadSession,
  saveSession,
} from '@/lib/session';
import {
  CORE_DIAGNOSTIC_PATH,
  DELIVERY_STATUS_LABELS,
  MAX_GAP_QUESTIONS,
  MEETING_PHASE_LABELS,
  MeetingPhase,
  MeetingState,
  acceptAndAdvance,
  advanceQuestionLoop,
  appendDelivery,
  beginInterpretation,
  currentGapLabel,
  followLabelForPhase,
  getActiveDraft,
  acceptActiveDraft,
  closeDiagnosticAndOpenFreeTalk,
  goToUpdateQuadro,
  isDiagnosticClosed,
  markAdjustmentDecision,
  pendingAdjustment,
  phaseAllowsFreeChat,
  phaseAllowsQuestionAnswer,
  resolveMeeting,
  saveMeeting,
  skipCurrentQuestion,
} from '@/lib/meeting';
import {
  ADJUSTMENT_ACTION_LABELS,
  QUADRANT_LABELS,
  applySwotAdjustment,
} from '@/lib/swot-adjust';
import { labelOf, SETORES, EXPERIENCIA, EQUIPE, RECEITA, FINANCEIRO, DESAFIO, OBJETIVO, DIGITAL, CONCORRENCIA } from '@/lib/intake';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function contextFrom(session: Session) {
  const a = session.answers;
  return [
    `Empresa: ${a.empresaNome}`,
    `Setor: ${session.setorLabel || labelOf(SETORES, a.setor)}`,
    `Tempo: ${labelOf(EXPERIENCIA, a.experiencia)}`,
    `Equipe: ${labelOf(EQUIPE, a.equipe)}`,
    `Faturamento: ${labelOf(RECEITA, a.receita)}`,
    `Financeiro: ${labelOf(FINANCEIRO, a.situacaoFinanceira)}`,
    `Desafio: ${labelOf(DESAFIO, a.maiorDesafio)}`,
    `Objetivo: ${labelOf(OBJETIVO, a.objetivoPrincipal)}`,
    `Digital: ${labelOf(DIGITAL, a.nivelDigitalizacao)}`,
    `Concorrência: ${labelOf(CONCORRENCIA, a.concorrenciaPercebida)}`,
    a.diferencial ? `Diferencial nas palavras do dono: ${a.diferencial}` : '',
    a.quemCompra ? `Quem compra: ${a.quemCompra}` : '',
    a.oQueRepete ? `O que a operação repete: ${a.oQueRepete}` : '',
    a.pressaoExterna ? `Pressão de fora descrita: ${a.pressaoExterna}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function swotPayload(session: Session | null) {
  if (!session) return undefined;
  return {
    empresaNome: session.answers.empresaNome,
    setor: session.setorLabel,
    contexto: contextFrom(session),
    forcas: session.swot.forcas,
    fraquezas: session.swot.fraquezas,
    oportunidades: session.swot.oportunidades,
    ameacas: session.swot.ameacas,
    lacunas: session.lacunas || [],
  };
}

function fingerprintOf(session: Session) {
  return `${session.updatedAt}|${session.answers.empresaNome}|${session.lacunas?.length ?? 0}`;
}

function backfillAbrirFromChat(meeting: MeetingState, messages: ChatMessage[]): MeetingState {
  if (meeting.deliveries.length > 0) return meeting;
  const firstAssistant = messages.find((message) => message.role === 'assistant');
  if (!firstAssistant?.content) return meeting;
  if (/chave|não consegui|nao consegui|api/i.test(firstAssistant.content)) return meeting;
  return appendDelivery(meeting, 'ABRIR', firstAssistant.content, 'draft');
}

function isErrorMessage(content: string) {
  return /chave|não consegui|nao consegui|api|falha|recusada|cota/i.test(content);
}

export default function ConsultaPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [meeting, setMeeting] = useState<MeetingState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [deliveryError, setDeliveryError] = useState<{ phase: MeetingPhase; message: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const updateMeeting = (next: MeetingState) => {
    saveMeeting(next);
    setMeeting(next);
  };

  const callConsultor = async (payload: {
    command: MeetingPhase;
    action: 'run' | 'revise' | 'chat';
    meeting: MeetingState;
    currentSession: Session;
    currentConfig: AppConfig;
    history?: ChatMessage[];
    revisionNotes?: string;
    userAnswer?: string;
  }) => {
    const response = await fetch('/api/chat/consultor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command: payload.command,
        action: payload.action,
        revisionNotes: payload.revisionNotes,
        userAnswer: payload.userAnswer,
        meeting: payload.meeting,
        messages: (payload.history || []).slice(-8),
        apiKey: payload.currentConfig.apiKey,
        model: payload.currentConfig.model,
        baseURL: payload.currentConfig.baseURL,
        swotData: swotPayload(payload.currentSession),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha na conversa.');
    return data as { message: string; meeting: MeetingState };
  };

  const runPhaseDelivery = async (
    phase: MeetingPhase,
    currentMeeting: MeetingState,
    currentSession: Session,
    currentConfig: AppConfig,
    history: ChatMessage[],
    revisionNotes?: string
  ): Promise<boolean> => {
    setLoading(true);
    setDeliveryError(null);
    try {
      const data = await callConsultor({
        command: phase,
        action: revisionNotes ? 'revise' : 'run',
        meeting: currentMeeting,
        currentSession,
        currentConfig,
        history,
        revisionNotes,
        userAnswer: currentMeeting.pendingUserAnswer,
      });
      updateMeeting(data.meeting);
      if (data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      }
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não consegui gerar a entrega. Confira a chave em Config.';
      setDeliveryError({ phase, message });
      // Mantém a fase do comando que falhou para permitir repetir.
      updateMeeting({ ...currentMeeting, phase });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const runPhaseWithRollback = async (
    previous: MeetingState,
    next: MeetingState,
    phase: MeetingPhase,
    currentSession: Session,
    history: ChatMessage[] = messages
  ) => {
    updateMeeting(next);
    const ok = await runPhaseDelivery(phase, next, currentSession, config, history);
    if (!ok) updateMeeting(previous);
  };

  useEffect(() => {
    let cancelled = false;
    hydrateDevConfig().then((savedConfig) => {
      if (cancelled) return;
      const current = loadSession();
      setSession(current);
      setConfig(savedConfig);

      let parsed: ChatMessage[] = [];
      try {
        const stored = sessionStorage.getItem(CHAT_KEY);
        parsed = stored ? (JSON.parse(stored) as ChatMessage[]) : [];
      } catch {
        parsed = [];
      }

      let nextMeeting: MeetingState | null = null;
      if (current) {
        nextMeeting = resolveMeeting({
          lacunas: current.lacunas,
          sessionFingerprint: fingerprintOf(current),
        });
        nextMeeting = backfillAbrirFromChat(nextMeeting, parsed);
        saveMeeting(nextMeeting);
        setMeeting(nextMeeting);
      } else {
        setMeeting(null);
      }

      const failedOpen =
        parsed.length === 1 &&
        parsed[0].role === 'assistant' &&
        isErrorMessage(parsed[0].content);
      const hasMeetingContent = (nextMeeting?.deliveries.length ?? 0) > 0;

      if ((parsed.length > 0 || hasMeetingContent) && !failedOpen) {
        setMessages(parsed);
        setReady(true);
        return;
      }

      setReady(true);
      if (!current || !savedConfig.apiKey || started.current) return;

      started.current = true;
      const base =
        nextMeeting ??
        resolveMeeting({
          lacunas: current.lacunas,
          sessionFingerprint: fingerprintOf(current),
        });
      void runPhaseDelivery('ABRIR', base, current, savedConfig, []);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ready) sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, ready]);

  useEffect(() => {
    if (ready && meeting) saveMeeting(meeting);
  }, [meeting, ready]);

  const handleRevise = (notes: string) => {
    if (!meeting || !session || !config.apiKey || loading) return;
    const draft = getActiveDraft(meeting);
    if (!draft) return;
    // Revisar não avança fase; em falha a entrega draft permanece.
    void runPhaseDelivery(meeting.phase, meeting, session, config, messages, notes);
  };

  const continueAfterQuadro = (currentMeeting: MeetingState, currentSession: Session) => {
    const previous = currentMeeting;
    const { meeting: advanced, nextPhase } = advanceQuestionLoop(currentMeeting);
    const withGaps =
      nextPhase === 'PERGUNTAR' && currentSession.lacunas?.length
        ? {
            ...advanced,
            openGaps: [...currentSession.lacunas],
            sessionFingerprint: fingerprintOf(currentSession),
          }
        : { ...advanced, sessionFingerprint: fingerprintOf(currentSession) };
    void runPhaseWithRollback(previous, withGaps, nextPhase, currentSession);
  };

  const handleFollow = () => {
    if (!meeting || !session || !config.apiKey || loading) return;
    const previous = meeting;

    if (meeting.phase === 'PERGUNTAR') {
      const { meeting: skipped, nextPhase } = skipCurrentQuestion(meeting);
      const withGaps =
        nextPhase === 'PERGUNTAR' && session.lacunas?.length
          ? { ...skipped, openGaps: [...session.lacunas] }
          : skipped;
      void runPhaseWithRollback(previous, withGaps, nextPhase, session);
      return;
    }

    if (meeting.phase === 'INTERPRETAR_RESPOSTA') {
      const updating = goToUpdateQuadro(meeting);
      void runPhaseWithRollback(previous, updating, 'ATUALIZAR_QUADRO', session);
      return;
    }

    if (meeting.phase === 'ATUALIZAR_QUADRO') {
      const declined = markAdjustmentDecision(meeting, false);
      continueAfterQuadro(declined, session);
      return;
    }

    if (meeting.phase === 'ENCERRAR_DIAGNOSTICO') {
      const opened = closeDiagnosticAndOpenFreeTalk(meeting);
      void runPhaseWithRollback(previous, opened, 'MODO_LIVRE', session);
      return;
    }

    if (meeting.phase === 'MODO_LIVRE') {
      const accepted = acceptActiveDraft(meeting);
      setDeliveryError(null);
      updateMeeting({ ...accepted, phase: 'DONE' });
      return;
    }

    const { meeting: advanced, nextPhase } = acceptAndAdvance(meeting);
    const withGaps =
      nextPhase === 'MAPEAR_LACUNAS' || nextPhase === 'PERGUNTAR'
        ? { ...advanced, openGaps: session.lacunas?.length ? [...session.lacunas] : advanced.openGaps }
        : advanced;

    if (!nextPhase || nextPhase === 'DONE') {
      updateMeeting(withGaps);
      return;
    }
    void runPhaseWithRollback(previous, withGaps, nextPhase, session);
  };

  const handleRetryDelivery = () => {
    if (!deliveryError || !meeting || !session || !config.apiKey || loading) return;
    void runPhaseDelivery(deliveryError.phase, meeting, session, config, messages);
  };

  const handleAcceptAdjustment = () => {
    if (!meeting || !session || loading) return;
    const adjustment = pendingAdjustment(meeting);
    if (!adjustment) {
      continueAfterQuadro(markAdjustmentDecision(meeting, false), session);
      return;
    }
    const updatedSession = applySwotAdjustment(session, adjustment);
    saveSession(updatedSession);
    setSession(updatedSession);
    const accepted = markAdjustmentDecision(
      {
        ...meeting,
        openGaps: updatedSession.lacunas,
        sessionFingerprint: fingerprintOf(updatedSession),
      },
      true
    );
    continueAfterQuadro(accepted, updatedSession);
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading || !meeting || !session) return;
    if (!config.apiKey) return;
    if (meeting.phase === 'PERGUNTAR' && phaseAllowsQuestionAnswer(meeting.phase)) {
      const nextMessages = [...messages, { role: 'user' as const, content: text }];
      setMessages(nextMessages);
      setInput('');
      const interpreting = beginInterpretation(meeting, text);
      updateMeeting(interpreting);
      void runPhaseDelivery('INTERPRETAR_RESPOSTA', interpreting, session, config, nextMessages);
      return;
    }

    if (!phaseAllowsFreeChat(meeting)) return;

    const nextMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    const meetingForChat = getActiveDraft(meeting) ? acceptActiveDraft(meeting) : meeting;
    if (meetingForChat !== meeting) updateMeeting(meetingForChat);

    try {
      const data = await callConsultor({
        command: 'MODO_LIVRE',
        action: 'chat',
        meeting: meetingForChat,
        currentSession: session,
        currentConfig: config,
        history: nextMessages,
        userAnswer: text,
      });
      setMessages([...nextMessages, { role: 'assistant', content: data.message }]);
      // Mantém o estado da reunião; não reinicia SWOT nem apaga entregas.
      updateMeeting({
        ...meetingForChat,
        ...data.meeting,
        phase: 'MODO_LIVRE',
        closedAt: meetingForChat.closedAt || data.meeting.closedAt,
        deliveries: meetingForChat.deliveries,
      });
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: err instanceof Error ? err.message : 'Não consegui falar com a API. Confira a chave em Config.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return <div className="min-h-screen bg-slate-gray" />;

  const phaseLabel = meeting ? MEETING_PHASE_LABELS[meeting.phase] : null;
  const activeDraft = meeting ? getActiveDraft(meeting) : null;
  const allowQuestionAnswer = meeting ? phaseAllowsQuestionAnswer(meeting.phase) : false;
  const allowFreeChat = meeting ? phaseAllowsFreeChat(meeting) : false;
  const meetingDone = meeting?.phase === 'DONE';
  const diagnosticClosed = meeting ? isDiagnosticClosed(meeting) : false;
  const showControls = Boolean(activeDraft && session && config.apiKey && !loading && !meetingDone);
  const showEndFreeChat = Boolean(allowFreeChat && !activeDraft && !meetingDone && !loading);
  const gapLabel = meeting ? currentGapLabel(meeting) : null;
  const askedCount = meeting?.askedGapIndexes.length ?? 0;
  const adjustment = meeting ? pendingAdjustment(meeting) : null;

  return (
    <div className="flex min-h-screen flex-col bg-slate-gray">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-royal-blue">Reunião de diagnóstico</p>
            <h1 className="text-2xl font-semibold text-navy-blue">Consultor conduz o diagnóstico</h1>
            {phaseLabel && (
              <p className="mt-1 text-sm text-slate-500">
                Fase atual: {phaseLabel}
                {activeDraft ? ` · ${DELIVERY_STATUS_LABELS[activeDraft.status]}` : ''}
                {meeting?.phase === 'PERGUNTAR' || meeting?.phase === 'INTERPRETAR_RESPOSTA'
                  ? ` · perguntas ${askedCount}/${MAX_GAP_QUESTIONS}`
                  : ''}
              </p>
            )}
            {meeting?.phase === 'PERGUNTAR' && gapLabel && (
              <p className="mt-1 text-sm text-slate-600">Lacuna em foco: {gapLabel}</p>
            )}
          </div>
          <Link href="/config" className="text-sm text-royal-blue underline">
            {config.apiKey ? 'Trocar API' : 'Configurar API'}
          </Link>
        </div>

        {!session && (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Sem SWOT ainda. <Link href="/diagnostico" className="underline">Faça o diagnóstico</Link> para o agente trabalhar no seu negócio.
          </p>
        )}

        {!config.apiKey && (
          <p className="mb-4 rounded-xl bg-white px-4 py-3 text-sm text-carbon">
            Cole a sua chave em <Link href="/config" className="underline">Config</Link> para liberar a reunião. A plataforma não tem chave própria.
          </p>
        )}

        <div className="flex-1 space-y-4 rounded-2xl bg-white p-4 shadow-sm">
          {meeting?.deliveries.map((delivery) => (
            <div key={delivery.id} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                <span>{MEETING_PHASE_LABELS[delivery.command]}</span>
                <span className="text-slate-300">·</span>
                <span
                  className={
                    delivery.status === 'accepted'
                      ? 'text-emerald-700'
                      : delivery.status === 'revised'
                        ? 'text-amber-700'
                        : 'text-sky-700'
                  }
                >
                  {DELIVERY_STATUS_LABELS[delivery.status]}
                </span>
              </div>
              <AgentReply content={delivery.content} />
              {delivery.revisionNotes && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Feedback de revisão: {delivery.revisionNotes}
                </p>
              )}
            </div>
          ))}

          {(() => {
            const deliveryTexts = new Set((meeting?.deliveries || []).map((delivery) => delivery.content));
            return messages
              .filter((message) => {
                if (message.content.startsWith('[Comando da reunião:')) return false;
                if (message.role === 'assistant' && deliveryTexts.has(message.content)) return false;
                if (message.role === 'assistant' && isErrorMessage(message.content) && deliveryTexts.size > 0) {
                  return !deliveryTexts.has(message.content);
                }
                return message.role === 'user' || message.role === 'assistant';
              })
              .map((message, index) => (
                <div
                  key={`msg-${index}-${message.role}-${message.content.slice(0, 16)}`}
                  className={
                    message.role === 'user'
                      ? 'ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl bg-navy-blue px-4 py-3 text-sm leading-relaxed text-white'
                      : 'w-full rounded-2xl border border-slate-200 bg-white px-5 py-4'
                  }
                >
                  {message.role === 'assistant' ? <AgentReply content={message.content} /> : message.content}
                </div>
              ));
          })()}

          {loading && (
            <p className="text-sm text-slate-500">
              {!meeting?.deliveries.length ? 'Abrindo a reunião e lendo a SWOT...' : 'Consultor preparando a entrega...'}
            </p>
          )}

          {meeting?.phase === 'ATUALIZAR_QUADRO' && adjustment && (
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
              <p className="font-medium">
                Proposta: {ADJUSTMENT_ACTION_LABELS[adjustment.action]} em {QUADRANT_LABELS[adjustment.quadrant]}
              </p>
              <p className="mt-1">{adjustment.text}</p>
              {adjustment.sourceAnswer && (
                <p className="mt-2 text-xs text-sky-800">Com base na resposta: “{adjustment.sourceAnswer}”</p>
              )}
              {adjustment.rationale && <p className="mt-1 text-xs text-sky-800">Efeito: {adjustment.rationale}</p>}
              <p className="mt-2 text-xs text-sky-700">Nada entra na SWOT sem você aceitar.</p>
            </div>
          )}

          {meeting?.phase === 'ATUALIZAR_QUADRO' && !adjustment && activeDraft && !loading && (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Sem ajuste sustentável nesta rodada. Você pode revisar a sugestão ou seguir sem alterar o quadro.
            </p>
          )}

          {deliveryError && !loading && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950">
              <p className="font-medium">Não foi possível gerar a entrega ({MEETING_PHASE_LABELS[deliveryError.phase]}).</p>
              <p className="mt-1 text-red-800">{deliveryError.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" onClick={handleRetryDelivery} className="bg-red-700 text-white hover:bg-red-800">
                  Tentar de novo
                </Button>
                <Link href="/config" className="inline-flex items-center text-sm text-red-800 underline">
                  Conferir API
                </Link>
              </div>
            </div>
          )}

          {showControls && meeting && !deliveryError && (
            <MeetingControls
              disabled={loading}
              onRevise={handleRevise}
              onFollow={handleFollow}
              followLabel={followLabelForPhase(meeting.phase)}
              reviseLabel={
                meeting.phase === 'CRUZAR'
                  ? 'Revisar cruzamento'
                  : meeting.phase === 'ENCERRAR_DIAGNOSTICO'
                    ? 'Revisar síntese'
                    : 'Revisar esta entrega'
              }
              showAdjustmentActions={meeting.phase === 'ATUALIZAR_QUADRO'}
              hasPendingAdjustment={Boolean(adjustment)}
              onAcceptAdjustment={handleAcceptAdjustment}
              onSkipAdjustment={handleFollow}
            />
          )}

          {meeting && CORE_DIAGNOSTIC_PATH.includes(meeting.phase) && activeDraft && (
            <p className="text-xs text-slate-500">
              Etapa do diagnóstico: {MEETING_PHASE_LABELS[meeting.phase]}. Revise se algo não representar a operação; siga só quando a entrega estiver ok.
            </p>
          )}

          {meeting?.phase === 'CRUZAR' && activeDraft && !loading && (
            <p className="text-xs text-slate-500">
              O cruzamento é opcional. Se não houver base, o consultor deve dizer isso — você ainda pode seguir para a síntese.
            </p>
          )}

          {meeting?.phase === 'ENCERRAR_DIAGNOSTICO' && activeDraft && !loading && (
            <p className="text-xs text-slate-500">
              Esta síntese fecha o diagnóstico. Não é plano de ação. Ao seguir, a conversa livre fica disponível.
            </p>
          )}

          {diagnosticClosed && meeting?.phase === 'MODO_LIVRE' && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Diagnóstico encerrado. Conversa livre liberada com as lentes do fundamento — sem reiniciar a SWOT nem gerar plano automático.
            </p>
          )}

          {showEndFreeChat && (
            <div className="mt-2">
              <Button type="button" variant="outline" onClick={handleFollow} className="border-slate-300 bg-white">
                Encerrar reunião
              </Button>
            </div>
          )}

          {meetingDone && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Reunião encerrada. Você pode voltar à <Link href="/swot" className="underline">SWOT</Link> ou refazer o diagnóstico quando quiser.
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        {(allowQuestionAnswer || allowFreeChat) && !meetingDone && (
          <form onSubmit={send} className="mt-4 flex gap-3">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                allowQuestionAnswer
                  ? 'Responda a pergunta (depois o consultor interpreta fato/hipótese/desejo)...'
                  : 'Conversa livre (cruzamento, pressão, crescimento, operação, resultado, direção)...'
              }
              className="min-h-[56px] bg-white"
              disabled={!config.apiKey || loading}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <Button type="submit" disabled={!config.apiKey || loading || !input.trim()} className="h-14 bg-emerald-green text-white hover:bg-emerald-600">
              {allowQuestionAnswer ? 'Responder' : 'Enviar'}
            </Button>
          </form>
        )}

        {meeting?.phase === 'PERGUNTAR' && !loading && (
          <p className="mt-3 text-center text-sm text-slate-500">
            Responda no campo acima, ou use <span className="font-medium text-slate-700">Pular esta pergunta</span>. Depois de responder, vem a interpretação.
          </p>
        )}

        {meeting?.phase === 'INTERPRETAR_RESPOSTA' && !loading && (
          <p className="mt-3 text-center text-sm text-slate-500">
            Revise a interpretação ou siga para a proposta de ajuste na SWOT (só entra no quadro se você aceitar).
          </p>
        )}

        {allowFreeChat && !loading && (
          <p className="mt-3 text-center text-sm text-slate-500">
            Conversa livre só depois do diagnóstico. O histórico da reunião permanece; a SWOT não é reiniciada.
          </p>
        )}

        {!allowQuestionAnswer &&
          !allowFreeChat &&
          meeting?.phase !== 'INTERPRETAR_RESPOSTA' &&
          meeting?.phase !== 'ATUALIZAR_QUADRO' &&
          !meetingDone &&
          session &&
          config.apiKey && (
            <p className="mt-4 text-center text-sm text-slate-500">
              Nesta fase use <span className="font-medium text-slate-700">Revisar</span> ou{' '}
              <span className="font-medium text-slate-700">Seguir</span>. A conversa livre só abre após encerrar o diagnóstico.
            </p>
          )}
      </main>
    </div>
  );
}
