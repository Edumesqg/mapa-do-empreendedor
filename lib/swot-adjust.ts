import { Session, SwotBoard, SwotItem, newId } from '@/lib/session';
import { SwotAdjustment, SwotQuadrant } from '@/lib/meeting';

const QUADRANTS: SwotQuadrant[] = ['forcas', 'fraquezas', 'oportunidades', 'ameacas'];

function cloneBoard(board: SwotBoard): SwotBoard {
  return {
    forcas: [...board.forcas],
    fraquezas: [...board.fraquezas],
    oportunidades: [...board.oportunidades],
    ameacas: [...board.ameacas],
  };
}

function findItem(items: SwotItem[], targetText?: string, text?: string) {
  const needle = (targetText || text || '').trim().toLowerCase();
  if (!needle) return -1;
  const exact = items.findIndex((item) => item.texto.trim().toLowerCase() === needle);
  if (exact >= 0) return exact;
  return items.findIndex((item) => item.texto.trim().toLowerCase().includes(needle) || needle.includes(item.texto.trim().toLowerCase()));
}

/** Aplica um ajuste aceito na sessão. Nada muda sem chamar esta função. */
export function applySwotAdjustment(session: Session, adjustment: SwotAdjustment): Session {
  if (!QUADRANTS.includes(adjustment.quadrant)) return session;

  const board = cloneBoard(session.swot);
  const items = board[adjustment.quadrant];
  const text = adjustment.text.trim();
  if (!text && adjustment.action !== 'remove') return session;

  if (adjustment.action === 'add') {
    board[adjustment.quadrant] = [...items, { id: newId(), texto: text }];
  } else if (adjustment.action === 'edit') {
    const index = findItem(items, adjustment.targetText, text);
    if (index >= 0) {
      const next = [...items];
      next[index] = { ...next[index], texto: text };
      board[adjustment.quadrant] = next;
    } else {
      board[adjustment.quadrant] = [...items, { id: newId(), texto: text }];
    }
  } else if (adjustment.action === 'remove') {
    const index = findItem(items, adjustment.targetText, text);
    if (index >= 0) {
      board[adjustment.quadrant] = items.filter((_, i) => i !== index);
    }
  }

  const removedHint = (adjustment.targetText || adjustment.text || '').trim().toLowerCase();
  const lacunas = removedHint
    ? session.lacunas.filter((item) => !item.toLowerCase().includes(removedHint.slice(0, 24)))
    : session.lacunas;

  return {
    ...session,
    swot: board,
    lacunas,
    updatedAt: new Date().toISOString(),
  };
}

export function parseAdjustmentPayload(raw: unknown): SwotAdjustment | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  if (data.hasAdjustment === false) return null;
  if (data.hasAdjustment !== true && !data.action) return null;

  const quadrant = String(data.quadrant || '') as SwotQuadrant;
  const action = String(data.action || '') as SwotAdjustment['action'];
  if (!QUADRANTS.includes(quadrant)) return null;
  if (action !== 'add' && action !== 'edit' && action !== 'remove') return null;

  const text = String(data.text || '').trim();
  if (!text) return null;

  return {
    quadrant,
    action,
    text,
    targetText: data.targetText ? String(data.targetText) : undefined,
    sourceAnswer: data.sourceAnswer ? String(data.sourceAnswer) : undefined,
    rationale: data.rationale ? String(data.rationale) : undefined,
  };
}

export function extractAdjustmentFromMessage(message: string): {
  content: string;
  adjustment: SwotAdjustment | null;
} {
  const match = message.match(/```json\s*([\s\S]*?)```/i);
  if (!match) {
    return { content: message.trim(), adjustment: null };
  }
  let adjustment: SwotAdjustment | null = null;
  try {
    adjustment = parseAdjustmentPayload(JSON.parse(match[1]));
  } catch {
    adjustment = null;
  }
  const content = message.replace(match[0], '').trim();
  return { content: content || message.trim(), adjustment };
}

export const QUADRANT_LABELS: Record<SwotQuadrant, string> = {
  forcas: 'Forças',
  fraquezas: 'Fraquezas',
  oportunidades: 'Oportunidades',
  ameacas: 'Ameaças',
};

export const ADJUSTMENT_ACTION_LABELS: Record<SwotAdjustment['action'], string> = {
  add: 'Incluir',
  edit: 'Editar',
  remove: 'Remover',
};
