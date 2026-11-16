import { NextRequest, NextResponse } from 'next/server';
import { buildSwotFromAnswers } from '@/lib/swot-from-answers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as Record<string, unknown>;

    if (!data.empresaNome || !data.setor) {
      return NextResponse.json(
        { error: 'Dados incompletos: empresaNome e setor são obrigatórios' },
        { status: 400 }
      );
    }

    const draft = buildSwotFromAnswers(data);

    return NextResponse.json({
      empresa: data.empresaNome,
      setor: data.setor,
      dataGeracao: new Date().toISOString(),
      forcas: draft.forcas,
      fraquezas: draft.fraquezas,
      oportunidades: draft.oportunidades,
      ameacas: draft.ameacas,
      lacunas: draft.lacunas,
    });
  } catch {
    return NextResponse.json({ error: 'Erro interno ao processar análise SWOT' }, { status: 500 });
  }
}
