# Prompt para o Perplexity — pesquisa aprofundada

Cole o bloco abaixo no modo Research / pesquisa aprofundada. Peça a resposta em arquivos separados, um capítulo por arquivo.

---

Você é um pesquisador de administração estratégica. Faça uma pesquisa teórica aprofundada, em português brasileiro, sobre análise SWOT e planejamento estratégico completo. O resultado será o fundamento teórico de uma plataforma open source chamada Autoconsultoria e será publicado como uma documentação online, com um capítulo por arquivo.

Não escreva um artigo único. Entregue 13 arquivos Markdown, nesta ordem e com estes nomes exatos:

1. `00-indice.md`
2. `01-o-que-e-planejamento-estrategico.md`
3. `02-origem-da-swot.md`
4. `03-analise-interna.md`
5. `04-analise-externa.md`
6. `05-cruzamento-swot.md`
7. `06-porter.md`
8. `07-ansoff-e-crescimento.md`
9. `08-mintzberg.md`
10. `09-objetivos-e-balanced-scorecard.md`
11. `10-do-diagnostico-ao-plano.md`
12. `11-criticas-e-limites.md`
13. `12-como-a-autoconsultoria-usa.md`

## Fontes obrigatórias

Use livros e textos clássicos da administração e da estratégia. Não use blog, LinkedIn, resumo de cursinho nem página sem autor. Quando citar, dê autor, obra, ano e a ideia com as palavras do capítulo, sem inventar citação literal. Se não tiver a página, não invente número de página.

Base mínima, e outras obras clássicas que você conseguir sustentar:

- Learned, Christensen, Andrews e Guth, *Business Policy: Text and Cases* — origem da SWOT na Harvard Business School
- Kenneth Andrews, *The Concept of Corporate Strategy*
- Alfred Chandler, *Strategy and Structure*
- H. Igor Ansoff, *Corporate Strategy* — matriz produto-mercado
- George Steiner, *Strategic Planning*
- Michael Porter, *Competitive Strategy* e *Competitive Advantage* — cinco forças e cadeia de valor
- Henry Mintzberg, *The Rise and Fall of Strategic Planning* e a distinção entre estratégia deliberada e emergente
- Peter Drucker, *The Practice of Management* e a ideia de objetivo e resultado
- Kenichi Ohmae, *The Mind of the Strategist*
- Hamel e Prahalad, competência essencial, em *Competing for the Future*
- Kaplan e Norton, *The Balanced Scorecard* e mapa estratégico
- Jay Barney, visão baseada em recursos e o teste VRIO, como ponte entre forças internas e vantagem
- Richard Rumelt, *Good Strategy Bad Strategy*, só para o critério do que é um diagnóstico de verdade

Pode completar com Fayol apenas para situar o diagnóstico dentro da função de prever e organizar. Não transforme o texto numa história da administração desde Taylor.

## O que cada arquivo precisa conter

Cada arquivo começa com:

```markdown
# Título do capítulo

> Uma frase: para que este capítulo serve na hora de ler o negócio.
```

Depois, seções curtas com subtítulos. Texto de documentação, não de paper. Frases diretas. Um exemplo de pequena empresa por capítulo, sempre marcado como exemplo, nunca como caso real.

`00-indice.md` é o sumário da documentação. Uma linha por arquivo: título, o que a pessoa aprende e em que momento da Autoconsultoria aquilo entra (formulário, SWOT, edição ou conversa com o agente).

`01` define planejamento estratégico completo: diagnóstico, direção, objetivos, escolhas e revisão. Separe plano de estratégia. Diga o que Chandler, Andrews, Ansoff e Steiner chamam de estratégia, sem misturar os quatro.

`02` explica a origem da SWOT. Deixe claro que a sigla ficou famosa depois, e que em Harvard o quadro nascia da política de negócios: forças e fraquezas de dentro, oportunidades e ameaças de fora. Diga o que a matriz não é: não é ranking, não é plano e não decide sozinha.

`03` trata só da análise interna. Recursos, capacidades e limites. Critério para uma força ou uma fraqueza ser aceitável: específica, ligada a um efeito no negócio, e distinguível de um elogio ou de uma queixa genérica. Inclua VRIO em linguagem simples: valioso, raro, difícil de imitar, organizado.

`04` trata só da análise externa. Mercado, cliente, concorrente, regra e tecnologia. Uma oportunidade não é um desejo do dono. Uma ameaça não é um medo sem fato. Mostre como Porter entra aqui sem substituir a SWOT.

`05` ensina o cruzamento: forças com oportunidades, forças com ameaças, fraquezas com oportunidades, fraquezas com ameaças. Para cada cruzamento, diga a pergunta que o empreendedor precisa responder e o erro comum.

`06` é Porter, só o que serve a uma empresa pequena: cinco forças, cadeia de valor e os três caminhos genéricos. Traduza para comércio, serviço e produção enxuta. Não repita o manual inteiro.

`07` é Ansoff: penetrar, desenvolver produto, desenvolver mercado, diversificar. Diga o risco crescente e quando uma pequena empresa não deve diversificar.

`08` é Mintzberg. Estratégia também aparece no que a empresa já faz, não só no que escreveu. Mostre o que isso muda num diagnóstico: a SWOT tem de caber na operação real, e o plano não pode ignorar o que já emerge no dia a dia.

`09` liga objetivo, meta e indicador. Drucker para a ideia de resultado. Kaplan e Norton para financeiro, cliente, processo e aprendizado, em versão de empresa pequena. Sem transformar isso num software de BSC.

`10` é a sequência inteira do planejamento: contexto, SWOT revisada, escolha de uma direção, poucos objetivos, ações, recurso, prazo e o que faria a pessoa abandonar a aposta. Uma direção, não uma lista de desejos.

`11` junta as críticas sérias: SWOT genérica, lista sem prioridade, plano que não encontra a operação, Mintzberg sobre o planejamento que vira ritual. Diga como a documentação evita cada uma.

`12` amarra com a Autoconsultoria, sem marketing. O fluxo do produto é: a pessoa responde um diagnóstico, uma pergunta por vez; recebe uma SWOT; edita o que não representa o negócio; cola a própria chave de API; o agente explica a SWOT e faz as perguntas que ainda faltam; depois a conversa fica livre. Mostre qual capítulo fundamenta cada um desses passos. Não invente funcionalidade que não está nessa lista.

## Regras de escrita

- Português brasileiro.
- Sem emoji.
- Sem "neste artigo vamos".
- Sem citação inventada. Se a ideia for conhecida mas você não puder ancorar na obra, escreva "leitura corrente de" e não ponha aspas.
- Cada capítulo fecha com "O que isto exige do diagnóstico": três perguntas que a plataforma deveria conseguir fazer ao empreendedor.
- No fim de cada arquivo, uma seção `## Fontes deste capítulo` com autor, obra e ano. Só o que foi usado naquele arquivo.

## O que não fazer

- Não junte os 13 textos num arquivo só.
- Não traga pesquisa de mercado de uma empresa real.
- Não proponha ferramenta paga, curso nem consultoria.
- Não substitua os clássicos por frameworks de startup, a menos que sirvam para criticar um limite, e mesmo assim em no máximo um parágrafo no capítulo 11.
