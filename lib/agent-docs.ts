import { chapters } from '@/lib/fundamento-catalog';
import { loadChapter } from '@/lib/fundamento';
import type { MeetingPhase } from '@/lib/meeting';

const exigencias: Record<string, string> = {
  fundamentos: 'Qual decisão esclarecer agora; o que é fato e o que é hipótese; o que falta antes de escolher direção.',
  planejamento: 'Separar diagnóstico, estratégia e plano. Plano é compromisso. Estratégia é a escolha. SWOT não é nenhum dos dois.',
  'origem-swot': 'A matriz organiza. Ela não ranqueia, não decide e não é um plano.',
  'analise-interna': 'Força ou fraqueza só entra se for específica, tiver efeito no negócio e não for elogio ou queixa genérica.',
  'analise-externa': 'Oportunidade é condição de fora, com público e benefício. Ameaça é exposição e mecanismo de dano. Desejo e medo ficam de fora.',
  cruzamento: 'Ligar um fator interno a uma condição externa numa alternativa. A ligação precisa ser explicável. Contar cruzamentos não decide.',
  porter: 'Perguntar quem compara, quem fornece, quem pode entrar e o que substitui. Posição é custo, diferenciação ou enfoque, com atividade que sustente.',
  ansoff: 'Separar penetração, produto novo, mercado novo e diversificação. O risco sobe nessa ordem. Diversificar exige capacidade que se transfere.',
  mintzberg: 'Confrontar o que foi declarado com o que a operação já faz. Intenção e padrão realizado não são a mesma coisa.',
  objetivos: 'Separar objetivo, meta e indicador. Tarefa feita não é resultado. Não implantar um sistema de BSC.',
  plano: 'Uma direção, poucas ações, recurso, prazo e o que faria abandonar a aposta. Lista de desejos não é plano.',
  criticas: 'Retirar frase que caberia em qualquer empresa. Explicitar a hipótese e o que a derrubaria. Não fabricar nota.',
  'como-usa': 'O produto faz diagnóstico, SWOT editável, chave da própria pessoa e conversa. Não gera plano automático nem monitora indicador.',
};

const openingSlugs = ['origem-swot', 'analise-interna', 'analise-externa', 'criticas', 'como-usa'];

const commandSlugs: Partial<Record<MeetingPhase, string[]>> = {
  /** Abertura leve: não carregar os cinco capítulos da leitura. */
  ABRIR: ['origem-swot', 'como-usa'],
  /** Leitura do quadro: análise interna/externa + críticas. */
  LER_SWOT: ['origem-swot', 'analise-interna', 'analise-externa', 'criticas', 'como-usa'],
  /** Lacunas: críticas e critério de efeito; sem Ansoff/Porter. */
  MAPEAR_LACUNAS: ['criticas', 'analise-interna', 'analise-externa', 'como-usa'],
  PERGUNTAR: ['criticas', 'como-usa'],
  INTERPRETAR_RESPOSTA: ['criticas', 'mintzberg', 'como-usa'],
  ATUALIZAR_QUADRO: ['origem-swot', 'analise-interna', 'analise-externa', 'criticas'],
  CRUZAR: ['cruzamento', 'criticas', 'como-usa'],
  ENCERRAR_DIAGNOSTICO: ['como-usa', 'criticas', 'planejamento'],
  MODO_LIVRE: ['como-usa'],
  DONE: ['como-usa'],
};

const retrieval: { slug: string; words: string[] }[] = [
  { slug: 'cruzamento', words: ['cruz', 'aproveitar a força', 'alternativa', 'ligar', 'combinar'] },
  { slug: 'ansoff', words: ['crescer', 'expandir', 'diversif', 'novo mercado', 'novo produto', 'penetr', 'outra cidade', 'outro público'] },
  { slug: 'porter', words: ['concorr', 'fornecedor', 'substitut', 'preço', 'margem', 'posicion', 'cliente compara'] },
  { slug: 'mintzberg', words: ['na prática', 'no dia', 'operação', 'já faço', 'rotina', 'de fato'] },
  { slug: 'objetivos', words: ['meta', 'indicador', 'medir', 'resultado', 'objetivo'] },
  { slug: 'plano', words: ['plano', 'prazo', 'próximo passo', 'proximo passo', 'abandon', 'direção', 'direcao', 'recurso'] },
  { slug: 'analise-interna', words: ['força', 'forca', 'fraqueza', 'capacidade', 'recurso'] },
  { slug: 'analise-externa', words: ['oportunidade', 'ameaça', 'ameaca', 'mercado', 'ameaça'] },
  { slug: 'criticas', words: ['genéric', 'generico', 'não representa', 'nao representa', 'chute'] },
];

const cache = new Map<string, string>();

/** Limites para caber no contexto do modelo sem estourar o prompt. */
export const MAX_CHAPTER_CHARS = 5000;
export const MAX_TOTAL_DOCS_CHARS = 12000;
export const MAX_CHAPTERS_PER_COMMAND = 5;

function chapterText(slug: string) {
  const cached = cache.get(slug);
  if (cached) return cached;
  const raw = loadChapter(slug);
  if (!raw) return '';
  let body = raw
    .split(/\n## Fontes deste capítulo/)[0]
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '$1')
    .trim();
  if (body.length > MAX_CHAPTER_CHARS) {
    body = `${body.slice(0, MAX_CHAPTER_CHARS)}\n\n[…]`;
  }
  cache.set(slug, body);
  return body;
}

function indexBlock() {
  return chapters
    .map((chapter, index) => {
      const rule = exigencias[chapter.slug] || chapter.aprende;
      return `${index}. ${chapter.title} (${chapter.entra}). ${rule}`;
    })
    .join('\n');
}

const method = `Você consulta esta base antes de interpretar o negócio. Ela é o fundamento da Autoconsultoria. Use os conceitos em linguagem simples. Não cite Harvard, não recite autor e não transforme a conversa numa aula.

Regras que não podem ser afrouxadas:
- Fato, hipótese e desejo ficam separados. Se a informação não veio, diga que falta. Não complete com frase convincente.
- Força e fraqueza são de dentro: recurso, capacidade ou limite, com efeito. Elogio, tempo de mercado, equipe pequena e faturamento, sozinhos, não entram.
- Oportunidade e ameaça são de fora. Oportunidade não é o que a pessoa quer fazer. Ameaça não é medo sem exposição e mecanismo.
- A SWOT não ranqueia, não decide e não é plano. Quadrante vazio permanece vazio até haver sustentação.
- Na conversa livre, use a lente que a dúvida pede: cruzamento explicável, pressão competitiva, caminho de crescimento, operação real, resultado observável, uma direção com recurso, prazo e critério de abandono.
- Discuta uma direção quando a pessoa pedir próximo passo. Não entregue gerador de plano, painel, agenda nem execução automática.
- A edição da pessoa melhora a adequação. Ela não certifica o quadro como verdade.
- A chave de API é etapa técnica. Não fale de fornecedor, preço ou segurança além do que a tela de Config já diz.`;

export function agentDoctrine(
  mode: 'opening' | 'chat' | MeetingPhase,
  latestUserText: string
) {
  let slugs: string[];
  if (mode === 'opening') {
    slugs = openingSlugs;
  } else if (mode === 'chat') {
    slugs = matchingSlugs(latestUserText);
  } else if (mode === 'MODO_LIVRE') {
    slugs = matchingSlugs(latestUserText);
  } else {
    slugs = commandSlugs[mode] || ['como-usa'];
  }

  slugs = slugs.slice(0, MAX_CHAPTERS_PER_COMMAND);

  const parts: string[] = [];
  let used = 0;
  for (const slug of slugs) {
    const chapter = chapters.find((item) => item.slug === slug);
    const body = chapterText(slug);
    if (!chapter || !body) continue;
    const block = `\n\n===== ${chapter.title.toUpperCase()} =====\n${body}`;
    if (used + block.length > MAX_TOTAL_DOCS_CHARS) {
      const room = MAX_TOTAL_DOCS_CHARS - used;
      if (room > 200) parts.push(`${block.slice(0, room)}\n\n[…]`);
      break;
    }
    parts.push(block);
    used += block.length;
  }

  return `${method}

Índice da documentação, para escolher a lente:
${indexBlock()}
${parts.join('')}`;
}

function matchingSlugs(text: string) {
  const haystack = text.toLowerCase();
  const found = retrieval
    .filter((item) => item.words.some((word) => haystack.includes(word)))
    .map((item) => item.slug);
  const unique = Array.from(new Set(found)).slice(0, 2);
  return unique.length > 0 ? unique : ['como-usa'];
}
