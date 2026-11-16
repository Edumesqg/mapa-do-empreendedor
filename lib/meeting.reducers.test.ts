/**
 * Testes leves dos reducers da reunião.
 * Rodar: npm run test:meeting
 */
import {
  acceptAndAdvance,
  advanceQuestionLoop,
  appendDelivery,
  beginInterpretation,
  closeDiagnosticAndOpenFreeTalk,
  createMeeting,
  goToUpdateQuadro,
  markActiveDraftRevised,
  markAdjustmentDecision,
  pendingAdjustment,
  setDraftAdjustment,
  shouldExitQuestionLoop,
  skipCurrentQuestion,
} from '@/lib/meeting';
import { applySwotAdjustment } from '@/lib/swot-adjust';
import { EMPTY_ANSWERS, Session } from '@/lib/session';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function baseSession(): Session {
  return {
    answers: { ...EMPTY_ANSWERS, empresaNome: 'Padaria Teste' },
    setorLabel: 'Alimentos',
    swot: {
      forcas: [{ id: '1', texto: 'Atendimento conhecido na rua' }],
      fraquezas: [],
      oportunidades: [],
      ameacas: [],
    },
    lacunas: ['Falta efeito da força de atendimento', 'Oportunidade sem público'],
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function run() {
  let meeting = createMeeting({
    lacunas: baseSession().lacunas,
    sessionFingerprint: 'fp',
  });
  assert(meeting.phase === 'ABRIR', 'inicia em ABRIR');

  meeting = appendDelivery(meeting, 'ABRIR', 'Olá, abertura.', 'draft');
  const advanced = acceptAndAdvance(meeting);
  assert(advanced.nextPhase === 'LER_SWOT', 'seguir de ABRIR vai para LER_SWOT');
  assert(advanced.meeting.deliveries[0]?.status === 'accepted', 'entrega ABRIR fica aceita');

  meeting = appendDelivery(advanced.meeting, 'LER_SWOT', 'Leitura.', 'draft');
  meeting = markActiveDraftRevised(meeting, 'não invente oportunidade');
  assert(meeting.deliveries.at(-1)?.status === 'revised', 'revisar marca revised');
  assert(meeting.phase === 'LER_SWOT', 'revisar não avança fase');

  meeting = appendDelivery(meeting, 'LER_SWOT', 'Leitura revisada.', 'draft');
  meeting = acceptAndAdvance(meeting).meeting;
  meeting = appendDelivery(meeting, 'MAPEAR_LACUNAS', 'Lacunas.', 'draft');
  meeting = acceptAndAdvance(meeting).meeting;
  meeting = appendDelivery(meeting, 'PERGUNTAR', '1. Qual o efeito?', 'draft');

  meeting = beginInterpretation(meeting, 'Quero crescer no digital');
  assert(meeting.phase === 'INTERPRETAR_RESPOSTA', 'resposta vai para interpretar');
  assert(meeting.pendingUserAnswer === 'Quero crescer no digital', 'guarda resposta');
  assert(meeting.askedGapIndexes.includes(0), 'marca lacuna perguntada');

  meeting = appendDelivery(meeting, 'INTERPRETAR_RESPOSTA', 'Desejo, não oportunidade.', 'draft');
  meeting = goToUpdateQuadro(meeting);
  assert(meeting.phase === 'ATUALIZAR_QUADRO', 'após interpretar vai para atualizar quadro');

  meeting = setDraftAdjustment(meeting, {
    quadrant: 'oportunidades',
    action: 'add',
    text: 'Canal digital com público X',
    sourceAnswer: 'Quero crescer no digital',
  });
  assert(pendingAdjustment(meeting)?.text.includes('Canal digital'), 'ajuste pendente');

  const declined = markAdjustmentDecision(meeting, false);
  assert(declined.swotDraftAdjustments?.[0]?.accepted === false, 'recusa fica registrada');

  const session = applySwotAdjustment(baseSession(), {
    quadrant: 'fraquezas',
    action: 'add',
    text: 'Fila no sábado reduz vendas',
  });
  assert(session.swot.fraquezas.some((item) => item.texto.includes('Fila')), 'aceite grava na SWOT');

  meeting = appendDelivery(declined, 'ATUALIZAR_QUADRO', 'Sem ajuste.', 'draft');
  let loop = advanceQuestionLoop(meeting);
  assert(loop.nextPhase === 'PERGUNTAR', 'ainda há lacuna → próxima pergunta');

  meeting = appendDelivery(loop.meeting, 'PERGUNTAR', '1. Outra?', 'draft');
  const skipped = skipCurrentQuestion(meeting);
  assert(
    skipped.nextPhase === 'CRUZAR' || skipped.nextPhase === 'PERGUNTAR',
    'pular pergunta avança o loop'
  );

  // Força saída do loop
  meeting = {
    ...skipped.meeting,
    askedGapIndexes: [0, 1, 2, 3, 4, 5, 6],
    phase: 'ATUALIZAR_QUADRO',
    deliveries: [
      ...skipped.meeting.deliveries,
      {
        id: 'x',
        command: 'ATUALIZAR_QUADRO',
        content: 'ok',
        status: 'draft',
        createdAt: new Date().toISOString(),
      },
    ],
  };
  assert(shouldExitQuestionLoop(meeting), 'limite de perguntas encerra loop');
  loop = advanceQuestionLoop(meeting);
  assert(loop.nextPhase === 'CRUZAR', 'sai para CRUZAR');

  meeting = appendDelivery(loop.meeting, 'CRUZAR', 'Cruzamento.', 'draft');
  meeting = acceptAndAdvance(meeting).meeting;
  meeting = appendDelivery(meeting, 'ENCERRAR_DIAGNOSTICO', 'Síntese.', 'draft');
  meeting = closeDiagnosticAndOpenFreeTalk(meeting);
  assert(meeting.phase === 'MODO_LIVRE', 'encerrar libera modo livre');
  assert(Boolean(meeting.closedAt), 'marca closedAt');

  console.log('meeting.reducers.test.ts: ok');
}

run();
