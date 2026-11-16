import { buildSwotFromAnswers } from '@/lib/swot-from-answers';

export interface SwotItem {
  id: number;
  texto: string;
  relevancia?: 'alta' | 'media' | 'baixa';
  potencial?: 'alto' | 'medio' | 'baixo';
  criticidade?: 'alta' | 'media' | 'baixa';
  urgencia?: 'alta' | 'media' | 'baixa';
}

export interface SwotData {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

function toItems(list: { texto: string }[]): SwotItem[] {
  return list.map((item, index) => ({ id: index + 1, texto: item.texto }));
}

export function generateMockSwot(formData: Record<string, unknown>): SwotData {
  const draft = buildSwotFromAnswers(formData || {});
  return {
    strengths: toItems(draft.forcas),
    weaknesses: toItems(draft.fraquezas),
    opportunities: toItems(draft.oportunidades),
    threats: toItems(draft.ameacas),
  };
}

export function getSetorLabel(setor: string): string {
  const setorMap: Record<string, string> = {
    comercio: 'Comércio',
    servicos: 'Serviços',
    educacao: 'Educação',
    saude: 'Saúde',
    industria: 'Indústria',
    alimentacao: 'Alimentação',
    agro: 'Agronegócio',
    tecnologia: 'Tecnologia',
    outro: 'Outro',
  };

  return setorMap[setor] || 'Outro';
}

export function getExperienciaLabel(experiencia: string): string {
  const experienciaMap: Record<string, string> = {
    '<1ano': 'Menos de 1 ano',
    '1-2anos': '1-2 anos',
    '3-5anos': '3-5 anos',
    '6-10anos': '6-10 anos',
    '>10anos': 'Mais de 10 anos',
  };

  return experienciaMap[experiencia] || 'N/A';
}
