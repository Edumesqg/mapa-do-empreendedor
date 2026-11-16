export const SETORES = [
  { value: 'comercio', label: 'Comércio e e-commerce' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'educacao', label: 'Educação' },
  { value: 'saude', label: 'Saúde e bem-estar' },
  { value: 'industria', label: 'Indústria' },
  { value: 'agro', label: 'Agronegócio' },
  { value: 'outro', label: 'Outro' },
];

export const EXPERIENCIA = [
  { value: '<1ano', label: 'Menos de 1 ano' },
  { value: '1-2anos', label: '1 a 2 anos' },
  { value: '3-5anos', label: '3 a 5 anos' },
  { value: '6-10anos', label: '6 a 10 anos' },
  { value: '>10anos', label: 'Mais de 10 anos' },
];

export const EQUIPE = [
  { value: 'apenas-eu', label: 'Só eu' },
  { value: '2-5', label: '2 a 5 pessoas' },
  { value: '6-10', label: '6 a 10 pessoas' },
  { value: '11-20', label: '11 a 20 pessoas' },
  { value: '>20', label: 'Mais de 20 pessoas' },
];

export const RECEITA = [
  { value: '<10k', label: 'Até R$ 10 mil/mês' },
  { value: '10-50k', label: 'R$ 10 a 50 mil/mês' },
  { value: '50-500k', label: 'R$ 50 a 500 mil/mês' },
  { value: '>500k', label: 'Acima de R$ 500 mil/mês' },
];

export const FINANCEIRO = [
  { value: 'prejuizo', label: 'No prejuízo' },
  { value: 'equilibrio', label: 'No equilíbrio' },
  { value: 'lucro-crescente', label: 'Lucro e crescendo' },
  { value: 'excelente', label: 'Caixa folgado' },
];

export const DESAFIO = [
  { value: 'aquisicao', label: 'Trazer cliente novo' },
  { value: 'retencao', label: 'Reter quem já compra' },
  { value: 'financeiro', label: 'Caixa e margem' },
  { value: 'tempo', label: 'Falta de tempo' },
  { value: 'precificacao', label: 'Preço e margem' },
  { value: 'dependencia', label: 'Dependência de poucos clientes' },
];

export const OBJETIVO = [
  { value: 'expandir', label: 'Crescer e expandir' },
  { value: 'marca', label: 'Fortalecer a marca' },
  { value: 'eficiencia', label: 'Ganhar eficiência' },
];

export const DIGITAL = [
  { value: 'zero', label: 'Quase nada digital' },
  { value: 'basico', label: 'Presença básica' },
  { value: 'social-ativo', label: 'Redes ativas' },
  { value: 'site', label: 'Site e canais próprios' },
  { value: 'digital-forte', label: 'Operação digital forte' },
];

export const CONCORRENCIA = [
  { value: 'nenhum', label: 'Quase nenhuma' },
  { value: 'baixa', label: 'Baixa' },
  { value: 'moderada', label: 'Moderada' },
  { value: 'alta', label: 'Alta' },
  { value: 'muito-alta', label: 'Muito alta' },
];

export function labelOf(list: { value: string; label: string }[], value: string) {
  return list.find((item) => item.value === value)?.label || value;
}
