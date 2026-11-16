export const SESSION_KEY = 'autoconsultoria-session';
export const CONFIG_KEY = 'autoconsultoria-config';
export const CHAT_KEY = 'autoconsultoria-chat-v2';

export type SwotItem = { id: string; texto: string };

export type Answers = {
  empresaNome: string;
  setor: string;
  experiencia: string;
  equipe: string;
  receita: string;
  situacaoFinanceira: string;
  objetivoPrincipal: string;
  maiorDesafio: string;
  nivelDigitalizacao: string;
  concorrenciaPercebida: string;
  diferencial: string;
  quemCompra: string;
  oQueRepete: string;
  pressaoExterna: string;
};

export type SwotBoard = {
  forcas: SwotItem[];
  fraquezas: SwotItem[];
  oportunidades: SwotItem[];
  ameacas: SwotItem[];
};

export type Session = {
  answers: Answers;
  setorLabel: string;
  swot: SwotBoard;
  lacunas: string[];
  updatedAt: string;
};

export type AppConfig = {
  apiKey: string;
  model: string;
  baseURL: string;
};

export const EMPTY_ANSWERS: Answers = {
  empresaNome: '',
  setor: '',
  experiencia: '',
  equipe: '',
  receita: '',
  situacaoFinanceira: '',
  objetivoPrincipal: '',
  maiorDesafio: '',
  nivelDigitalizacao: '',
  concorrenciaPercebida: '',
  diferencial: '',
  quemCompra: '',
  oQueRepete: '',
  pressaoExterna: '',
};

export const DEFAULT_CONFIG: AppConfig = {
  apiKey: '',
  model: 'gpt-4o-mini',
  baseURL: 'https://api.openai.com/v1',
};

export function loadSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.swot || !parsed?.answers) return null;
    return {
      ...parsed,
      answers: { ...EMPTY_ANSWERS, ...parsed.answers },
      lacunas: Array.isArray(parsed.lacunas) ? parsed.lacunas : [],
    };
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function hydrateDevConfig(): Promise<AppConfig> {
  const current = loadConfig();
  const factoryEndpoint = !current.baseURL || current.baseURL === DEFAULT_CONFIG.baseURL;
  if (current.apiKey && !factoryEndpoint) return current;
  try {
    const response = await fetch('/api/dev-config');
    if (!response.ok) return current;
    const data = (await response.json()) as Partial<AppConfig>;
    if (!data.apiKey) return current;
    const next: AppConfig = {
      apiKey: data.apiKey,
      model: data.model || current.model,
      baseURL: data.baseURL || current.baseURL,
    };
    saveConfig(next);
    return next;
  } catch {
    return current;
  }
}

export function loadConfig(): AppConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: AppConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
