export type Chapter = {
  slug: string;
  file: string;
  legacy: string;
  title: string;
  aprende: string;
  entra: string;
};

export const chapters: Chapter[] = [
  {
    slug: 'fundamentos',
    file: 'Fundamentos da Autoconsultoria.md',
    legacy: '00-indice.md',
    title: 'Fundamentos da Autoconsultoria',
    aprende: 'Como ler a base, separar teoria de adaptação e saber em que momento cada capítulo entra.',
    entra: 'Formulário, SWOT, edição e conversa',
  },
  {
    slug: 'planejamento',
    file: 'O que é planejamento estratégico completo.md',
    legacy: '01-o-que-e-planejamento-estrategico.md',
    title: 'Planejamento estratégico completo',
    aprende: 'Separar diagnóstico, estratégia e plano, sem misturar Chandler, Andrews, Ansoff e Steiner.',
    entra: 'Formulário e reunião com o consultor',
  },
  {
    slug: 'origem-swot',
    file: 'Origem e alcance da SWOT.md',
    legacy: '02-origem-da-swot.md',
    title: 'Origem e alcance da SWOT',
    aprende: 'Distinguir a tradição de Harvard da sigla famosa e reconhecer que a matriz não decide sozinha.',
    entra: 'Leitura da SWOT e edição',
  },
  {
    slug: 'analise-interna',
    file: 'Análise interna  recursos, capacidades e limites.md',
    legacy: '03-analise-interna.md',
    title: 'Análise interna',
    aprende: 'Descrever recurso, capacidade e limite com efeito verificável, e usar VRIO em linguagem simples.',
    entra: 'Formulário, SWOT e edição',
  },
  {
    slug: 'analise-externa',
    file: 'Análise externa  condições fora da empresa.md',
    legacy: '04-analise-externa.md',
    title: 'Análise externa',
    aprende: 'Separar oportunidade de desejo e ameaça de receio, e ver onde Porter entra sem substituir a SWOT.',
    entra: 'Formulário, SWOT e conversa',
  },
  {
    slug: 'cruzamento',
    file: 'Cruzamento SWOT  de fatores a alternativas.md',
    legacy: '05-cruzamento-swot.md',
    title: 'Cruzamento SWOT',
    aprende: 'Ligar fatores a alternativas, sem tratar a contagem de cruzamentos como decisão.',
    entra: 'Reunião / conversa com o consultor',
  },
  {
    slug: 'porter',
    file: 'Porter para pequenas empresas.md',
    legacy: '06-porter.md',
    title: 'Porter para pequenas empresas',
    aprende: 'Ler pressões competitivas, atividades e os três caminhos de posicionamento.',
    entra: 'Formulário e reunião com o consultor',
  },
  {
    slug: 'ansoff',
    file: 'Ansoff e as escolhas de crescimento.md',
    legacy: '07-ansoff-e-crescimento.md',
    title: 'Ansoff e as escolhas de crescimento',
    aprende: 'Distinguir penetração, produto, mercado e diversificação, e o risco crescente de cada uma.',
    entra: 'Reunião / conversa com o consultor',
  },
  {
    slug: 'mintzberg',
    file: 'Mintzberg  a estratégia também emerge da operação.md',
    legacy: '08-mintzberg.md',
    title: 'Mintzberg e a estratégia que emerge',
    aprende: 'Confrontar o que foi declarado com o padrão que a operação já realiza.',
    entra: 'Formulário, edição e conversa',
  },
  {
    slug: 'objetivos',
    file: 'Objetivos, metas, indicadores e Balanced Scorecard.md',
    legacy: '09-objetivos-e-balanced-scorecard.md',
    title: 'Objetivos, metas e indicadores',
    aprende: 'Relacionar resultado, medida e capacidade sem implantar um sistema de BSC.',
    entra: 'Reunião / conversa com o consultor',
  },
  {
    slug: 'plano',
    file: 'Do diagnóstico ao plano  uma direção com compromissos.md',
    legacy: '10-do-diagnostico-ao-plano.md',
    title: 'Do diagnóstico ao plano',
    aprende: 'Escolher uma direção e explicitar ação, recurso, prazo e critério de abandono.',
    entra: 'Reunião / conversa com o consultor',
  },
  {
    slug: 'criticas',
    file: 'Críticas e limites da SWOT e do planejamento.md',
    legacy: '11-criticas-e-limites.md',
    title: 'Críticas e limites',
    aprende: 'Reconhecer generalidade, prioridade falsa e planejamento que vira ritual.',
    entra: 'Revisão da SWOT, edição e conversa',
  },
  {
    slug: 'como-usa',
    file: 'Como a Autoconsultoria usa esta base.md',
    legacy: '12-como-a-autoconsultoria-usa.md',
    title: 'Como a Autoconsultoria usa esta base',
    aprende: 'Ver qual capítulo sustenta cada etapa do fluxo, sem presumir função que o produto não tem.',
    entra: 'Formulário, SWOT, edição e conversa',
  },
];

const legacyToSlug = new Map(chapters.map((chapter) => [chapter.legacy, chapter.slug]));

export function chapterBySlug(slug: string) {
  return chapters.find((chapter) => chapter.slug === slug);
}

export function hrefForMarkdownLink(href: string) {
  const clean = href.split('#')[0].split('?')[0].split('/').pop() || '';
  const slug = legacyToSlug.get(decodeURIComponent(clean));
  if (!slug) return null;
  return `/fundamento/${slug}`;
}
