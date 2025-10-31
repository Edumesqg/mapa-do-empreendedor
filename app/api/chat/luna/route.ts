import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  swotData?: {
    empresaNome?: string;
    setor?: string;
    forcas?: Array<{ texto: string }>;
    fraquezas?: Array<{ texto: string }>;
    oportunidades?: Array<{ texto: string }>;
    ameacas?: Array<{ texto: string }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, swotData }: ChatRequest = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Mensagens são obrigatórias' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return NextResponse.json(
        {
          message:
            'A integração com a OpenAI está sendo configurada. Por favor, adicione sua chave API no arquivo .env como OPENAI_API_KEY.',
        },
        { status: 200 }
      );
    }

    const systemPrompt = buildSystemPrompt(swotData);

    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);

      if (response.status === 401) {
        return NextResponse.json(
          {
            message:
              'Chave API da OpenAI inválida. Por favor, verifique sua configuração.',
          },
          { status: 200 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          {
            message:
              'Limite de requisições atingido. Por favor, tente novamente em alguns instantes.',
          },
          { status: 200 }
        );
      }

      throw new Error('Erro ao comunicar com a OpenAI');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('Resposta inválida da OpenAI');
    }

    return NextResponse.json(
      {
        message: assistantMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no chat da Luna:', error);
    return NextResponse.json(
      {
        message:
          'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
      },
      { status: 200 }
    );
  }
}

function buildSystemPrompt(swotData?: ChatRequest['swotData']): string {
  let prompt = `Você é Luna, uma especialista em análise SWOT e estratégia empresarial. Seu papel é ajudar empreendedores a validar e aprofundar sua análise SWOT inicial.

PERSONALIDADE:
- Amigável, encorajadora e conversacional
- Use linguagem simples e acessível (evite jargões técnicos)
- Seja empática e compreensiva com os desafios do empreendedor
- Faça perguntas estratégicas que levem o usuário a refletir mais profundamente

OBJETIVO:
Validar e refinar a análise SWOT do usuário através de perguntas específicas sobre:
1. FORÇAS: Aprofundar o que realmente diferencia o negócio
2. FRAQUEZAS: Identificar pontos cegos e desafios ocultos
3. OPORTUNIDADES: Explorar mercados e possibilidades não consideradas
4. AMEAÇAS: Antecipar riscos e preparar o negócio

DIRETRIZES:
- Faça UMA pergunta estratégica por vez
- Baseie suas perguntas nos dados SWOT fornecidos
- Seja específica e direta nas perguntas
- Valide as respostas do usuário com feedback positivo
- Sugira melhorias quando apropriado
- Use exemplos práticos quando ajudar a ilustrar um ponto
- Mantenha o tom motivacional e construtivo
- Respostas devem ter no máximo 3-4 linhas

FORMATO DE RESPOSTA:
- Seja breve e objetiva (máximo 100 palavras)
- Uma ideia principal por mensagem
- Use emoji ocasionalmente para humanizar (máximo 1-2 por mensagem)`;

  if (swotData) {
    prompt += '\n\n=== CONTEXTO DO NEGÓCIO ===\n';

    if (swotData.empresaNome && swotData.setor) {
      prompt += `\nEmpresa: ${swotData.empresaNome}`;
      prompt += `\nSetor: ${swotData.setor}`;
    }

    if (swotData.forcas && swotData.forcas.length > 0) {
      prompt += '\n\nFORÇAS IDENTIFICADAS:';
      swotData.forcas.forEach((f, i) => {
        prompt += `\n${i + 1}. ${f.texto}`;
      });
    }

    if (swotData.fraquezas && swotData.fraquezas.length > 0) {
      prompt += '\n\nFRAQUEZAS IDENTIFICADAS:';
      swotData.fraquezas.forEach((f, i) => {
        prompt += `\n${i + 1}. ${f.texto}`;
      });
    }

    if (swotData.oportunidades && swotData.oportunidades.length > 0) {
      prompt += '\n\nOPORTUNIDADES IDENTIFICADAS:';
      swotData.oportunidades.forEach((o, i) => {
        prompt += `\n${i + 1}. ${o.texto}`;
      });
    }

    if (swotData.ameacas && swotData.ameacas.length > 0) {
      prompt += '\n\nAMEAÇAS IDENTIFICADAS:';
      swotData.ameacas.forEach((a, i) => {
        prompt += `\n${i + 1}. ${a.texto}`;
      });
    }

    prompt +=
      '\n\nUse essas informações para fazer perguntas relevantes e personalizadas.';
  }

  return prompt;
}
