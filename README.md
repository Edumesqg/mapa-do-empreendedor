# Autoconsultoria

Estratégia para quem tem uma empresa pequena e não tem uma consultoria na agenda.

Você conta o negócio. A plataforma monta a SWOT a partir do que você descreveu. Você corrige o que não representa a realidade. Aí cola a **sua** chave de API e abre uma reunião com um consultor que já leu o quadro.

Sem cadastro. Sem chave nossa no meio do método.

**[Abrir a demo](https://mapa-do-empreendedor.vercel.app)**

Diagnóstico e SWOT funcionam na hora. A reunião pede a sua chave: [cole em Config](https://mapa-do-empreendedor.vercel.app/config).

## O caminho

```text
Diagnóstico  →  SWOT  →  você edita  →  sua API  →  reunião
```

1. **Diagnóstico.** Uma pergunta por vez, sobre o que já acontece na operação. Padaria, oficina, loja, negócio no campo. Sem login.
2. **SWOT.** O quadro sai das suas respostas. Um quadrante pode ficar vazio. O que não estiver sustentado não precisa entrar.
3. **Edição.** Você tira, troca ou reescreve o que não é o seu negócio.
4. **Sua API.** Em [Config](https://mapa-do-empreendedor.vercel.app/config), cole a chave, o modelo e o endpoint. Fica neste navegador. Dá para apagar quando quiser.
5. **Reunião.** O consultor abre em cima do quadro revisado: lê a SWOT, aponta lacunas, pergunta o que falta, propõe ajuste e só então libera conversa livre.

| Etapa | Onde | Chave |
| --- | --- | --- |
| Entrada | [Demo](https://mapa-do-empreendedor.vercel.app) | não |
| Diagnóstico | [/formulario-basico](https://mapa-do-empreendedor.vercel.app/formulario-basico) | não |
| SWOT | [/swot](https://mapa-do-empreendedor.vercel.app/swot) | não |
| Sua API | [/config](https://mapa-do-empreendedor.vercel.app/config) | você cola aqui |
| Reunião | [/consulta](https://mapa-do-empreendedor.vercel.app/consulta) | a sua |
| Fundamento | [/fundamento](https://mapa-do-empreendedor.vercel.app/fundamento) | não |

## A chave é sua

A demo não pede conta e não distribui crédito de modelo.

- A chave, o modelo e o endpoint ficam no `localStorage` deste navegador.
- Na reunião, o navegador manda a chave junto com a mensagem para `/api/chat/consultor`. Essa rota encaminha a chamada ao provedor que você indicou e não grava a chave.
- O padrão é `gpt-4o-mini` em `https://api.openai.com/v1`.
- Serve qualquer endpoint compatível com a API da OpenAI. Para Anthropic, aponte o endpoint para `https://api.anthropic.com/v1/` e escreva o nome do modelo.
- Em produção não existe chave embutida. A rota de desenvolvimento que preencheria uma chave local responde 404.

Você paga o provedor que escolheu. A Autoconsultoria não fica no meio da conta.

## O que a reunião faz

O consultor não começa do zero e não transforma a SWOT num pôster.

Ele parte do quadro que você revisou. Procura o que ainda não está dito. Faz poucas perguntas. Quando uma resposta muda o quadro, o ajuste aparece para você aceitar. Conversa solta só depois do diagnóstico fechado.

A proposta não é a IA decidir pelo negócio. É organizar o que você já sabe, separar fato de intenção e fazer perguntas melhores.

## Fundamento

O método está escrito, não só no prompt.

Em [/fundamento](https://mapa-do-empreendedor.vercel.app/fundamento) estão os capítulos usados na construção do diagnóstico: planejamento, origem da SWOT, análise interna e externa, Porter, Ansoff, Mintzberg, cruzamento da matriz, limites do planejamento e a ponte até objetivos. Os textos ficam em [`refs/`](refs).

Cada capítulo separa o que a literatura sustenta do que é adaptação deste produto.

## Rodar na sua máquina

Node.js 18 ou mais recente.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. O mesmo fluxo da demo: diagnóstico, SWOT, [config](http://localhost:3000/config), reunião.

Para a sua máquina preencher a chave sozinha durante o desenvolvimento, crie um `.env.local` (ele não entra no Git):

```bash
DEV_API_KEY=
DEV_API_MODEL=gpt-4o-mini
DEV_API_BASE_URL=https://api.openai.com/v1
```

Isso só vale com `npm run dev`. No build de produção essa rota não entrega chave.

```bash
npm run test:meeting
npm run typecheck
npm run build
```

## Stack

Next.js 13, React 18, TypeScript e Tailwind. A SWOT inicial é montada no código a partir das respostas. O modelo entra na reunião.

## Autor

Eduardo Mesquita Gomes — [LinkedIn](https://www.linkedin.com/in/engeduardomesquita/).

Código em [github.com/Edumesqg/mapa-do-empreendedor](https://github.com/Edumesqg/mapa-do-empreendedor).
