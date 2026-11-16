import { newId } from '@/lib/session';

export const MEETING_KEY = 'autoconsultoria-meeting-v1';

export type MeetingPhase =
  | 'ABRIR'
  | 'LER_SWOT'
  | 'MAPEAR_LACUNAS'
  | 'PERGUNTAR'
  | 'INTERPRETAR_RESPOSTA'
  | 'ATUALIZAR_QUADRO'
  | 'CRUZAR'
  | 'ENCERRAR_DIAGNOSTICO'
  | 'MODO_LIVRE'
  | 'DONE';

export type MeetingDelivery = {
  id: string;
  command: MeetingPhase;
  content: string;
  status: 'draft' | 'accepted' | 'revised';
  createdAt: string;
  revisionNotes?: string;
};

export type SwotQuadrant = 'forcas' | 'fraquezas' | 'oportunidades' | 'ameacas';

export type SwotAdjustment = {
  quadrant: SwotQuadrant;
  action: 'add' | 'edit' | 'remove';
  text: string;
  /** Texto atual do item quando action é edit/remove. */
  targetText?: string;
  sourceAnswer?: string;
  rationale?: string;
  accepted?: boolean;
};

export type MeetingState = {
  version: 1;
  phase: MeetingPhase;
  deliveries: MeetingDelivery[];
  openGaps: string[];
  askedGapIndexes: number[];
  pendingUserAnswer?: string;
  swotDraftAdjustments?: SwotAdjustment[];
  closedAt?: string;
  /** Invalida a reunião se a SWOT da sessão mudar. */
  sessionFingerprint?: string;
};

export const MEETING_PHASE_ORDER: MeetingPhase[] = [
  'ABRIR',
  'LER_SWOT',
  'MAPEAR_LACUNAS',
  'PERGUNTAR',
  'INTERPRETAR_RESPOSTA',
  'ATUALIZAR_QUADRO',
  'CRUZAR',
  'ENCERRAR_DIAGNOSTICO',
  'MODO_LIVRE',
  'DONE',
];

/** Caminho linear da reunião (pula loops INTERPRETAR / ATUALIZAR até as etapas 5–6). */
export const MEETING_MAIN_PATH: MeetingPhase[] = [
  'ABRIR',
  'LER_SWOT',
  'MAPEAR_LACUNAS',
  'PERGUNTAR',
  'CRUZAR',
  'ENCERRAR_DIAGNOSTICO',
  'MODO_LIVRE',
  'DONE',
];

export const MEETING_PHASE_LABELS: Record<MeetingPhase, string> = {
  ABRIR: 'Abrir reunião',
  LER_SWOT: 'Ler a SWOT',
  MAPEAR_LACUNAS: 'Mapear lacunas',
  PERGUNTAR: 'Perguntar',
  INTERPRETAR_RESPOSTA: 'Interpretar resposta',
  ATUALIZAR_QUADRO: 'Atualizar quadro',
  CRUZAR: 'Cruzar fatores',
  ENCERRAR_DIAGNOSTICO: 'Encerrar diagnóstico',
  MODO_LIVRE: 'Conversa livre',
  DONE: 'Reunião encerrada',
};

export const DELIVERY_STATUS_LABELS: Record<MeetingDelivery['status'], string> = {
  draft: 'Aguardando aceite',
  accepted: 'Aceita',
  revised: 'Revisada',
};

/** Três primeiras entregas do diagnóstico (Etapa 4). */
export const CORE_DIAGNOSTIC_PATH: MeetingPhase[] = ['ABRIR', 'LER_SWOT', 'MAPEAR_LACUNAS'];

/** Limite do loop de perguntas (Etapa 5). */
export const MAX_GAP_QUESTIONS = 7;

/** Resposta à pergunta do loop de diagnóstico (não é conversa livre). */
export function phaseAllowsQuestionAnswer(phase: MeetingPhase): boolean {
  return phase === 'PERGUNTAR';
}

/** Conversa livre só depois do encerramento. */
export function phaseAllowsFreeChat(meeting: MeetingState): boolean {
  return meeting.phase === 'MODO_LIVRE' && Boolean(meeting.closedAt);
}

/** @deprecated use phaseAllowsQuestionAnswer / phaseAllowsFreeChat */
export function phaseAllowsFreeText(phase: MeetingPhase): boolean {
  return phase === 'PERGUNTAR' || phase === 'MODO_LIVRE';
}

export function followLabelForPhase(phase: MeetingPhase): string {
  switch (phase) {
    case 'ABRIR':
      return 'Seguir para ler a SWOT';
    case 'LER_SWOT':
      return 'Seguir para mapear lacunas';
    case 'MAPEAR_LACUNAS':
      return 'Seguir para perguntar';
    case 'PERGUNTAR':
      return 'Pular esta pergunta';
    case 'INTERPRETAR_RESPOSTA':
      return 'Seguir para proposta de ajuste na SWOT';
    case 'ATUALIZAR_QUADRO':
      return 'Seguir sem alterar o quadro';
    case 'CRUZAR':
      return 'Seguir para encerrar o diagnóstico';
    case 'ENCERRAR_DIAGNOSTICO':
      return 'Encerrar e liberar conversa livre';
    case 'MODO_LIVRE':
      return 'Encerrar reunião';
    default:
      return 'Seguir para o próximo passo';
  }
}

/** Diagnóstico já foi fechado (síntese aceita ou modo livre/done). */
export function isDiagnosticClosed(meeting: MeetingState): boolean {
  if (meeting.closedAt) return true;
  return meeting.phase === 'MODO_LIVRE' || meeting.phase === 'DONE';
}

/** Aceita a síntese e libera MODO_LIVRE com closedAt. */
export function closeDiagnosticAndOpenFreeTalk(meeting: MeetingState): MeetingState {
  const accepted = acceptActiveDraft(meeting);
  return {
    ...accepted,
    phase: 'MODO_LIVRE',
    closedAt: accepted.closedAt || new Date().toISOString(),
    pendingUserAnswer: undefined,
    swotDraftAdjustments: [],
  };
}

export function nextGapIndex(meeting: MeetingState): number | null {
  for (let index = 0; index < meeting.openGaps.length; index += 1) {
    if (!meeting.askedGapIndexes.includes(index)) return index;
  }
  return null;
}

export function shouldExitQuestionLoop(meeting: MeetingState): boolean {
  if (meeting.askedGapIndexes.length >= MAX_GAP_QUESTIONS) return true;
  if (meeting.openGaps.length === 0) {
    return meeting.askedGapIndexes.length >= 1;
  }
  return nextGapIndex(meeting) === null;
}

export function markGapAsked(meeting: MeetingState, index: number): MeetingState {
  if (index < 0 || meeting.askedGapIndexes.includes(index)) return meeting;
  return {
    ...meeting,
    askedGapIndexes: [...meeting.askedGapIndexes, index],
  };
}

export function currentGapLabel(meeting: MeetingState): string | null {
  const index = nextGapIndex(meeting);
  if (index === null) return null;
  return meeting.openGaps[index] || null;
}

export function nextMainPhase(phase: MeetingPhase): MeetingPhase | null {
  const index = MEETING_MAIN_PATH.indexOf(phase);
  if (index < 0) return MEETING_MAIN_PATH[0] ?? null;
  return MEETING_MAIN_PATH[index + 1] ?? null;
}

export function getActiveDraft(meeting: MeetingState): MeetingDelivery | null {
  for (let index = meeting.deliveries.length - 1; index >= 0; index -= 1) {
    const delivery = meeting.deliveries[index];
    if (delivery.command === meeting.phase && delivery.status === 'draft') return delivery;
  }
  return null;
}

export function createMeeting(options: {
  lacunas?: string[];
  sessionFingerprint: string;
}): MeetingState {
  return {
    version: 1,
    phase: 'ABRIR',
    deliveries: [],
    openGaps: Array.isArray(options.lacunas) ? [...options.lacunas] : [],
    askedGapIndexes: [],
    sessionFingerprint: options.sessionFingerprint,
  };
}

export function loadMeeting(): MeetingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(MEETING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MeetingState;
    if (parsed?.version !== 1 || !parsed.phase || !Array.isArray(parsed.deliveries)) return null;
    return {
      ...parsed,
      openGaps: Array.isArray(parsed.openGaps) ? parsed.openGaps : [],
      askedGapIndexes: Array.isArray(parsed.askedGapIndexes) ? parsed.askedGapIndexes : [],
    };
  } catch {
    return null;
  }
}

export function saveMeeting(meeting: MeetingState) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(MEETING_KEY, JSON.stringify(meeting));
}

export function clearMeeting() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(MEETING_KEY);
}

export function appendDelivery(
  meeting: MeetingState,
  command: MeetingPhase,
  content: string,
  status: MeetingDelivery['status'] = 'draft',
  revisionNotes?: string
): MeetingState {
  const delivery: MeetingDelivery = {
    id: newId(),
    command,
    content,
    status,
    createdAt: new Date().toISOString(),
    revisionNotes,
  };
  return {
    ...meeting,
    phase: command,
    deliveries: [...meeting.deliveries, delivery],
  };
}

/** Resolve reunião existente ou cria uma nova se a SWOT mudou / não há estado. */
export function resolveMeeting(options: {
  lacunas?: string[];
  sessionFingerprint: string;
}): MeetingState {
  const existing = loadMeeting();
  if (existing && existing.sessionFingerprint === options.sessionFingerprint) {
    return existing;
  }
  return createMeeting(options);
}

/** Marca a entrega draft da fase atual como aceita. */
export function acceptActiveDraft(meeting: MeetingState): MeetingState {
  const draft = getActiveDraft(meeting);
  if (!draft) return meeting;
  return {
    ...meeting,
    deliveries: meeting.deliveries.map((delivery) =>
      delivery.id === draft.id ? { ...delivery, status: 'accepted' } : delivery
    ),
  };
}

/** Marca o draft atual como revised (antes de gerar nova entrega na mesma fase). */
export function markActiveDraftRevised(meeting: MeetingState, revisionNotes: string): MeetingState {
  const draft = getActiveDraft(meeting);
  if (!draft) return meeting;
  return {
    ...meeting,
    deliveries: meeting.deliveries.map((delivery) =>
      delivery.id === draft.id
        ? { ...delivery, status: 'revised', revisionNotes: revisionNotes.trim() || delivery.revisionNotes }
        : delivery
    ),
  };
}

/**
 * Aceita o draft atual e avança para a próxima fase do caminho principal.
 * Não gera conteúdo — a UI/API preenche a próxima entrega.
 */
export function acceptAndAdvance(meeting: MeetingState): { meeting: MeetingState; nextPhase: MeetingPhase | null } {
  const accepted = acceptActiveDraft(meeting);
  const nextPhase = nextMainPhase(accepted.phase);
  if (!nextPhase) {
    return {
      meeting: { ...accepted, phase: 'DONE', closedAt: accepted.closedAt || new Date().toISOString() },
      nextPhase: null,
    };
  }
  return {
    meeting: {
      ...accepted,
      phase: nextPhase,
      closedAt: nextPhase === 'DONE' || nextPhase === 'MODO_LIVRE' ? new Date().toISOString() : accepted.closedAt,
    },
    nextPhase,
  };
}

/** Depois de interpretar: vai para proposta de ajuste (Etapa 6). */
export function goToUpdateQuadro(meeting: MeetingState): MeetingState {
  const accepted = acceptActiveDraft(meeting);
  return {
    ...accepted,
    phase: 'ATUALIZAR_QUADRO',
    swotDraftAdjustments: [],
  };
}

/**
 * Depois de ATUALIZAR_QUADRO (aceitar ou pular): próxima PERGUNTAR ou sai para CRUZAR.
 */
export function advanceQuestionLoop(meeting: MeetingState): {
  meeting: MeetingState;
  nextPhase: 'PERGUNTAR' | 'CRUZAR';
} {
  const accepted = acceptActiveDraft(meeting);
  const cleared: MeetingState = {
    ...accepted,
    pendingUserAnswer: undefined,
    swotDraftAdjustments: [],
  };
  if (shouldExitQuestionLoop(cleared)) {
    return { meeting: { ...cleared, phase: 'CRUZAR' }, nextPhase: 'CRUZAR' };
  }
  return { meeting: { ...cleared, phase: 'PERGUNTAR' }, nextPhase: 'PERGUNTAR' };
}

export function pendingAdjustment(meeting: MeetingState): SwotAdjustment | null {
  const list = meeting.swotDraftAdjustments || [];
  const open = [...list].reverse().find((item) => item.accepted !== true && item.accepted !== false);
  return open || null;
}

export function setDraftAdjustment(meeting: MeetingState, adjustment: SwotAdjustment | null): MeetingState {
  if (!adjustment) {
    return { ...meeting, swotDraftAdjustments: [] };
  }
  return { ...meeting, swotDraftAdjustments: [adjustment] };
}

export function markAdjustmentDecision(meeting: MeetingState, accepted: boolean): MeetingState {
  const list = meeting.swotDraftAdjustments || [];
  if (!list.length) return meeting;
  return {
    ...meeting,
    swotDraftAdjustments: list.map((item, index) =>
      index === list.length - 1 ? { ...item, accepted } : item
    ),
  };
}

/** Aceita a pergunta atual, marca a lacuna e prepara INTERPRETAR_RESPOSTA. */
export function beginInterpretation(meeting: MeetingState, userAnswer: string): MeetingState {
  const gapIndex = nextGapIndex(meeting);
  let next = acceptActiveDraft(meeting);
  if (gapIndex !== null) {
    next = markGapAsked(next, gapIndex);
  } else if (meeting.openGaps.length === 0) {
    // Conta a pergunta genérica para o limite do loop.
    next = {
      ...next,
      askedGapIndexes: [...next.askedGapIndexes, next.askedGapIndexes.length],
    };
  }
  return {
    ...next,
    phase: 'INTERPRETAR_RESPOSTA',
    pendingUserAnswer: userAnswer.trim(),
  };
}

/** Pula a pergunta atual sem interpretar. */
export function skipCurrentQuestion(meeting: MeetingState): {
  meeting: MeetingState;
  nextPhase: 'PERGUNTAR' | 'CRUZAR';
} {
  const gapIndex = nextGapIndex(meeting);
  let next = acceptActiveDraft(meeting);
  if (gapIndex !== null) next = markGapAsked(next, gapIndex);
  else if (meeting.openGaps.length === 0) {
    next = { ...next, askedGapIndexes: [...next.askedGapIndexes, next.askedGapIndexes.length] };
  }
  return advanceQuestionLoop(next);
}
