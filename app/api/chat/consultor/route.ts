import { NextRequest, NextResponse } from 'next/server';
import {
  CONVERSATION_BRIEF,
  briefForCommand,
  userPromptForCommand,
} from '@/lib/agent-brief';
import { agentDoctrine } from '@/lib/agent-docs';
import { createLlmClient, samplingParams } from '@/lib/llm-client';
import {
  MAX_GAP_QUESTIONS,
  MeetingPhase,
  MeetingState,
  appendDelivery,
  isDiagnosticClosed,
  markActiveDraftRevised,
  nextGapIndex,
  phaseAllowsFreeChat,
  phaseAllowsQuestionAnswer,
  setDraftAdjustment,
} from '@/lib/meeting';
import { extractAdjustmentFromMessage } from '@/lib/swot-adjust';


export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SwotPoint {
  texto: string;
}

type MeetingAction = 'run' | 'revise' | 'follow' | 'chat';

interface RequestBody {
  messages?: Message[];
  apiKey?: string;
  model?: string;
  baseURL?: string;
  /** Legado: opening → ABRIR; chat → conversa livre. */
  mode?: 'opening' | 'chat';
  command?: MeetingPhase;
  action?: MeetingAction;
  revisionNotes?: string;
  meeting?: MeetingState;
  userAnswer?: string;
  swotData?: {
    empresaNome?: string;
    setor?: string;
    contexto?: string;
    forcas?: SwotPoint[];
    fraquezas?: SwotPoint[];
    oportunidades?: SwotPoint[];
    ameacas?: SwotPoint[];
    lacunas?: string[];
  };
}

const VALID_PHASES: MeetingPhase[] = [
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

function list(title: string, items?: SwotPoint[]) {
  if (!items?.length) return '';
  return `\n\n${title}:\n${items.map((item, index) => `${index + 1}. ${item.texto}`).join('\n')}`;
}

function resolveCommand(body: RequestBody): MeetingPhase {
  if (body.command && VALID_PHASES.includes(body.command)) return body.command;
  if (body.mode === 'opening') return 'ABRIR';
  if (body.mode === 'chat') return 'MODO_LIVRE';
  return 'ABRIR';
}

function resolveAction(body: RequestBody): MeetingAction {
  if (body.action === 'run' || body.action === 'revise' || body.action === 'follow' || body.action === 'chat') {
    return body.action;
  }
  if (body.mode === 'opening') return 'run';
  if (body.mode === 'chat') return 'chat';
  return 'run';
}

function primaryActionsFor(command: MeetingPhase, action: MeetingAction): Array<'revise' | 'follow'> {
  if (action === 'follow' || command === 'DONE') return [];
  if (action === 'chat') return [];
  return ['revise', 'follow'];
}

function uiFreeText(meeting: MeetingState, command: MeetingPhase) {
  if (phaseAllowsFreeChat(meeting)) return true;
  if (phaseAllowsQuestionAnswer(command)) return true;
  return false;
}

function recentMessages(history: Message[], limit = 8) {
  return history
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .slice(-limit)
    .map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: String(message.content || '').slice(0, 4000),
    }));
}

function emptyQuadrantNotes(swotData: NonNullable<RequestBody['swotData']>) {
  const notes: string[] = [];
  if (!swotData.forcas?.length) notes.push('Forças: quadrante vazio — tratar como lacuna, sem inventar item.');
  if (!swotData.fraquezas?.length) notes.push('Fraquezas: quadrante vazio — tratar como lacuna, sem inventar item.');
  if (!swotData.oportunidades?.length) {
    notes.push('Oportunidades: quadrante vazio — tratar como lacuna, sem inventar condição de mercado.');
  }
  if (!swotData.ameacas?.length) notes.push('Ameaças: quadrante vazio — tratar como lacuna, sem inventar risco.');
  return notes;
}

function buildSwotBlock(swotData: RequestBody['swotData'], command?: MeetingPhase) {
  if (!swotData) return '';
  let block = '\n\n=== DIAGNÓSTICO REVISADO PELO USUÁRIO ===';
  block += '\nA SWOT abaixo é a versão editada. Ela prevalece se divergir das respostas brutas.';
  if (swotData.empresaNome) block += `\nEmpresa: ${swotData.empresaNome}`;
  if (swotData.setor) block += `\nSetor: ${swotData.setor}`;
  if (swotData.contexto) block += `\n\nRespostas:\n${swotData.contexto}`;
  block += list('FORÇAS', swotData.forcas) || '\n\nFORÇAS:\n(nenhuma sustentada)';
  block += list('FRAQUEZAS', swotData.fraquezas) || '\n\nFRAQUEZAS:\n(nenhuma sustentada)';
  block += list('OPORTUNIDADES', swotData.oportunidades) || '\n\nOPORTUNIDADES:\n(nenhuma sustentada)';
  block += list('AMEAÇAS', swotData.ameacas) || '\n\nAMEAÇAS:\n(nenhuma sustentada)';

  const empties = emptyQuadrantNotes(swotData);
  if (empties.length) {
    block += `\n\nQUADRANTES VAZIOS (não preencher):\n${empties.map((item, index) => `${index + 1}. ${item}`).join('\n')}`;
  }

  const lacunas = swotData.lacunas?.length ? swotData.lacunas : [];
  if (lacunas.length) {
    block += `\n\nLACUNAS — não transformar em item de SWOT:\n${lacunas
      .map((item, index) => `${index + 1}. ${item}`)
      .join('\n')}`;
  } else if (command === 'MAPEAR_LACUNAS' || command === 'LER_SWOT') {
    block +=
      '\n\nLACUNAS explícitas: nenhuma listada. Use só quadrantes vazios e o que ainda falta efeito/especificidade nas respostas. Não invente.';
  }

  if (command === 'ABRIR') {
    block +=
      '\n\nINSTRUÇÃO DE FASE: nesta entrega NÃO explique os quadrantes item a item e NÃO liste lacunas numeradas.';
  }
  if (command === 'LER_SWOT') {
    block +=
      '\n\nINSTRUÇÃO DE FASE: leia o quadro; NÃO faça mapa completo de lacunas nem lista longa de perguntas.';
  }
  if (command === 'MAPEAR_LACUNAS') {
    block +=
      '\n\nINSTRUÇÃO DE FASE: mapeie lacunas; NÃO releia a SWOT inteira e NÃO faça ainda a pergunta única da próxima fase.';
  }
  if (command === 'PERGUNTAR') {
    block += '\n\nINSTRUÇÃO DE FASE: uma pergunta só; não interprete ainda; não proponha plano.';
  }
  if (command === 'INTERPRETAR_RESPOSTA') {
    block +=
      '\n\nINSTRUÇÃO DE FASE: interprete a resposta (fato/hipótese/desejo); não faça nova pergunta; não atualize a SWOT sozinho.';
  }
  if (command === 'ATUALIZAR_QUADRO') {
    block +=
      '\n\nINSTRUÇÃO DE FASE: proponha no máximo um ajuste com JSON final, ou hasAdjustment false. Não aplique mudança. Não invente item só para preencher quadrante.';
  }
  if (command === 'CRUZAR') {
    block +=
      '\n\nINSTRUÇÃO DE FASE: um cruzamento interno↔externo como alternativa, ou declare falta de base. Sem plano e sem encerrar ainda.';
  }
  if (command === 'ENCERRAR_DIAGNOSTICO') {
    block +=
      '\n\nINSTRUÇÃO DE FASE: síntese final com as três seções. Sem plano, ranking, KPI nem lista de tarefas.';
  }

  return block;
}

function buildGapBlock(meeting: MeetingState, command: MeetingPhase, userAnswer?: string) {
  if (command !== 'PERGUNTAR' && command !== 'INTERPRETAR_RESPOSTA') return '';

  const index = nextGapIndex(meeting);
  const gap =
    index !== null
      ? meeting.openGaps[index]
      : meeting.openGaps.length === 0
        ? '(sem lacuna listada — pergunte o efeito que ainda falta)'
        : '(todas as lacunas listadas já foram perguntadas)';

  let block = '\n\n=== LOOP DE PERGUNTAS ===';
  block += `\nPerguntas já feitas: ${meeting.askedGapIndexes.length} / máx. ${MAX_GAP_QUESTIONS}`;
  block += `\nLacuna atual: ${gap}`;
  if (meeting.openGaps.length) {
    block += `\nTodas as lacunas:\n${meeting.openGaps.map((item, i) => `${i + 1}. ${item}`).join('\n')}`;
  }
  if (command === 'INTERPRETAR_RESPOSTA') {
    const answer = userAnswer || meeting.pendingUserAnswer || '';
    block += `\n\nResposta da pessoa a interpretar:\n${answer || '(vazia)'}`;
  }
  return block;
}

function ensureMeeting(body: RequestBody, command: MeetingPhase): MeetingState {
  const lacunasFromSwot = body.swotData?.lacunas || [];
  if (body.meeting?.version === 1 && Array.isArray(body.meeting.deliveries)) {
    const existingGaps = Array.isArray(body.meeting.openGaps) ? body.meeting.openGaps : [];
    const openGaps =
      command === 'MAPEAR_LACUNAS' ||
      command === 'PERGUNTAR' ||
      command === 'INTERPRETAR_RESPOSTA' ||
      command === 'ATUALIZAR_QUADRO'
        ? lacunasFromSwot.length
          ? lacunasFromSwot
          : existingGaps
        : existingGaps.length
          ? existingGaps
          : lacunasFromSwot;
    return {
      ...body.meeting,
      phase: command,
      openGaps,
      askedGapIndexes: Array.isArray(body.meeting.askedGapIndexes) ? body.meeting.askedGapIndexes : [],
      pendingUserAnswer: body.userAnswer || body.meeting.pendingUserAnswer,
    };
  }
  return {
    version: 1,
    phase: command,
    deliveries: [],
    openGaps: lacunasFromSwot,
    askedGapIndexes: [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const apiKey = body.apiKey?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Cole a sua chave de API em Config antes de conversar.' },
        { status: 400 }
      );
    }

    const command = resolveCommand(body);
    const action = resolveAction(body);
    const history = Array.isArray(body.messages) ? body.messages : [];
    const recent = recentMessages(history);

    if (action === 'follow') {
      const meeting = ensureMeeting(body, command);
      return NextResponse.json({
        message: '',
        meeting,
        ui: {
          allowFreeText: uiFreeText(meeting, command),
          primaryActions: [] as Array<'revise' | 'follow'>,
        },
      });
    }

    if (action === 'chat') {
      if (recent.length === 0 && !body.userAnswer) {
        return NextResponse.json({ error: 'Mensagem inválida.' }, { status: 400 });
      }

      const meetingGate = ensureMeeting(body, command);
      if (command !== 'MODO_LIVRE' || !isDiagnosticClosed(meetingGate)) {
        return NextResponse.json(
          {
            error:
              'A conversa livre só abre depois do encerramento do diagnóstico. Continue a reunião com Revisar/Seguir.',
          },
          { status: 400 }
        );
      }

      const latestUser =
        body.userAnswer ||
        [...recent].reverse().find((message) => message.role === 'user')?.content ||
        '';
      let systemPrompt = `${agentDoctrine('chat', latestUser)}\n\n${CONVERSATION_BRIEF}`;
      systemPrompt += buildSwotBlock(body.swotData, 'MODO_LIVRE');
      systemPrompt +=
        '\n\nINSTRUÇÃO DE FASE: conversa livre pós-diagnóstico. Não reinicie a SWOT. Não apague o estado da reunião. Sem plano automático.';

      const client = createLlmClient(apiKey, body.baseURL);
      const chatMessages = body.userAnswer
        ? [...recent, { role: 'user' as const, content: body.userAnswer.slice(0, 4000) }]
        : recent;

      const completion = await client.chat.completions.create({
        model: body.model?.trim() || 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...chatMessages],
        ...samplingParams(body.baseURL),
        max_tokens: 2500,
      });

      const message = completion.choices[0]?.message?.content;
      if (!message) {
        return NextResponse.json({ error: 'A API respondeu vazia.' }, { status: 502 });
      }

      return NextResponse.json({
        message,
        meeting: meetingGate,
        ui: {
          allowFreeText: true,
          primaryActions: [] as Array<'revise' | 'follow'>,
        },
      });
    }

    // run | revise
    if (action === 'revise' && !body.revisionNotes?.trim()) {
      return NextResponse.json({ error: 'Informe o feedback para revisar a entrega.' }, { status: 400 });
    }

    let meeting = ensureMeeting(body, command);
    if (action === 'revise') {
      meeting = markActiveDraftRevised(meeting, body.revisionNotes || '');
    }

    const latestUser =
      body.revisionNotes ||
      body.userAnswer ||
      [...recent].reverse().find((message) => message.role === 'user')?.content ||
      '';

    let systemPrompt = `${agentDoctrine(command, latestUser)}\n\n${briefForCommand(command)}`;
    systemPrompt += buildSwotBlock(body.swotData, command);
    systemPrompt += buildGapBlock(meeting, command, body.userAnswer || body.revisionNotes);

    const previousDelivery = [...meeting.deliveries]
      .reverse()
      .find((delivery) => delivery.command === command);

    const promptMessages: { role: 'user' | 'assistant'; content: string }[] = [];
    if (action === 'revise' && previousDelivery?.content) {
      promptMessages.push({ role: 'assistant', content: previousDelivery.content.slice(0, 4000) });
    } else if (command === 'INTERPRETAR_RESPOSTA' || command === 'ATUALIZAR_QUADRO') {
      const answer = body.userAnswer || meeting.pendingUserAnswer || '';
      if (answer) promptMessages.push({ role: 'user', content: answer.slice(0, 4000) });
      const lastInterpret = [...meeting.deliveries]
        .reverse()
        .find((delivery) => delivery.command === 'INTERPRETAR_RESPOSTA');
      if (command === 'ATUALIZAR_QUADRO' && lastInterpret?.content) {
        promptMessages.push({
          role: 'assistant',
          content: lastInterpret.content.slice(0, 4000),
        });
      }
    } else if (recent.length > 0 && command !== 'ABRIR' && command !== 'PERGUNTAR') {
      promptMessages.push(...recent.slice(-4));
    }
    promptMessages.push({
      role: 'user',
      content: userPromptForCommand(command, action === 'revise' ? 'revise' : 'run', body.revisionNotes),
    });

    const tokenBudget: Partial<Record<MeetingPhase, number>> = {
      ABRIR: 1600,
      LER_SWOT: 3500,
      MAPEAR_LACUNAS: 2500,
      PERGUNTAR: 900,
      INTERPRETAR_RESPOSTA: 1600,
      ATUALIZAR_QUADRO: 1800,
      CRUZAR: 1800,
      ENCERRAR_DIAGNOSTICO: 2200,
      MODO_LIVRE: 900,
    };

    const client = createLlmClient(apiKey, body.baseURL);
    const completion = await client.chat.completions.create({
      model: body.model?.trim() || 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...promptMessages],
      ...samplingParams(body.baseURL),
      max_tokens: tokenBudget[command] || 2500,
    });

    const rawMessage = completion.choices[0]?.message?.content;
    if (!rawMessage) {
      return NextResponse.json({ error: 'A API respondeu vazia.' }, { status: 502 });
    }

    let message = rawMessage;
    if (command === 'ATUALIZAR_QUADRO') {
      const extracted = extractAdjustmentFromMessage(rawMessage);
      message = extracted.content;
      meeting = setDraftAdjustment(meeting, extracted.adjustment);
    }

    meeting = appendDelivery(meeting, command, message, 'draft', body.revisionNotes);

    return NextResponse.json({
      message,
      meeting,
      ui: {
        allowFreeText: uiFreeText(meeting, command),
        primaryActions:
          command === 'ATUALIZAR_QUADRO'
            ? (['revise', 'follow', 'accept_adjustment', 'skip_adjustment'] as Array<
                'revise' | 'follow' | 'accept_adjustment' | 'skip_adjustment'
              >)
            : primaryActionsFor(command, action),
      },
    });
  } catch (error: unknown) {
    const status =
      typeof error === 'object' && error && 'status' in error
        ? Number((error as { status?: number }).status)
        : 500;
    const detail =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: unknown }).message)
          : String(error);
    console.error('[consultor] LLM error', { status, detail });
    if (status === 401) {
      return NextResponse.json(
        { error: 'Chave recusada. Confira a chave e o endpoint em Config.' },
        { status: 401 }
      );
    }
    if (status === 429) {
      return NextResponse.json(
        { error: 'A API limitou ou ficou sem cota. Tente de novo em instantes.' },
        { status: 429 }
      );
    }
    return NextResponse.json(
      {
        error: 'Não consegui falar com a API. Confira chave, modelo e endpoint.',
        detail: process.env.NODE_ENV === 'development' ? detail : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', agent: 'Consultor Autoconsultoria' });
}
