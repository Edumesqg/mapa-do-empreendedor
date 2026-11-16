# Plano para fundamentar a Autoconsultoria nas refs

A base teórica já está em `refs/`. O produto deve passar a obedecer essa base, sem ganhar função que o capítulo 12 não descreve. O fluxo informado continua sendo: diagnóstico, uma pergunta por vez; SWOT editável; chave de API da própria pessoa; agente que explica o quadro e pergunta o que falta; depois, conversa livre.

A documentação já está publicada no site, na aba Fundamento. Os passos abaixo são o que ainda falta no diagnóstico, na SWOT e na conversa.

## O que já vale como caminho do produto

`next.config.js` redireciona `/diagnostico` para `/formulario-basico`. O caminho que a pessoa percorre hoje é:

1. `app/(public)/formulario-basico/page.tsx` — nome, setor, tempo, equipe, faturamento, uma tela por vez.
2. `app/(public)/formulario-personalizado/page.tsx` — perguntas de `lib/questions/strategic.ts` e do ramo em `lib/questions/clusters.ts`.
3. `app/api/generate-swot-initial/route.ts` — monta o quadro.
4. `app/(public)/swot/page.tsx` — edição.
5. `app/(public)/config/page.tsx` — chave, modelo e endpoint.
6. `app/(public)/consulta/page.tsx` e `lib/agent-brief.ts` — abertura e conversa livre.

`app/(public)/diagnostico/page.tsx` não entra nesse caminho. `lib/swot-generator.ts` (`generateMockSwot`) alimenta a página antiga `swot-inicial`, que também redireciona para `/swot`. Há dois geradores e uma tela de diagnóstico fora de uso.

## Critério que a base impõe

Cada item da SWOT precisa ser específico, ligado a um efeito e distinto de elogio, queixa, desejo ou medo. Oportunidade é condição de fora, com público e benefício verificável. Ameaça é condição de fora, com exposição e mecanismo de dano. A matriz não é ranking e não decide. A edição não certifica verdade. A conversa livre discute cruzamento, competição, crescimento, operação, resultado e uma direção, sem gerar plano automático.

Os capítulos que sustentam cada etapa estão em `refs/Como a Autoconsultoria usa esta base.md` e agora também em `/fundamento/como-usa`.

## Fase 1 — Uma jornada só

Objetivo: o código que a pessoa usa ser o único que gera SWOT.

- Manter o formulário de uma pergunta por vez. Ele já corresponde ao fluxo informado.
- Retirar de circulação `diagnostico/page.tsx` ou fazer essa rota deixar de existir como segunda versão. Hoje o redirect esconde a tela, mas o arquivo ainda inventa `capacidadeInvestimento` a partir do caixa.
- Fazer `swot-inicial` e `generateMockSwot` deixarem de ser um segundo método. A geração fica só em `generate-swot-initial`.
- Corrigir em `lib/intake.ts` o valor `150-500k` rotulado como “R$ 50 a 500 mil”. O gerador lê essa chave como receita alta e ainda a chama de recorrente.

Pronto quando: um único POST monta a SWOT, e nenhum código preenche um campo que a pessoa não respondeu.

## Fase 2 — A SWOT para de completar e de ranquear

Arquivo: `app/api/generate-swot-initial/route.ts`.

- Remover o enchimento que entra quando o quadrante tem menos de três itens: “conhecimento profundo”, “capacidade de adaptação”, “base de clientes”, “processos não otimizados”, “mudanças nas preferências”, “instabilidade econômica”.
- Remover `score`, a ordenação e o corte que transformam a lista em ranking. Mostrar os itens que saíram de respostas, na ordem em que foram sustentados.
- Separar quadrantes:
  - Força e fraqueza só com condição interna e efeito.
  - Oportunidade e ameaça só com condição externa.
  - Concorrência baixa deixa de ser força. Vai para ameaça ou oportunidade apenas se a resposta descrever exposição ou condição, e o texto marca o que ainda é hipótese.
  - Objetivo (“expandir”, “marca”, “eficiência”) deixa de virar oportunidade. O objetivo segue para a conversa, como intenção.
  - “Expandir presença digital” deixa de nascer automaticamente de presença fraca. Presença fraca pode ser fraqueza se houver efeito; a ação de ir para o digital não é oportunidade.
- Equipe pequena deixa de ser fraqueza automática. Só entra se a resposta mostrar que a capacidade não cobre o resultado escolhido.
- Quando a resposta não sustenta um quadrante, o quadrante fica curto. A abertura do agente pergunta o que falta, em vez de o gerador inventar o item.
- O texto livre do dono entra como frase dele, com o efeito que ele escreveu, sem o prefixo genérico “diferencial declarado” virar uma força certificada.

Pronto quando: uma padaria com poucas respostas recebe poucos itens, todos rastreáveis a uma resposta, e nenhum item caberia em qualquer empresa.

## Fase 3 — As perguntas pedem efeito, não adjetivo

Arquivos: `lib/questions/strategic.ts` e `lib/questions/clusters.ts`.

Manter uma pergunta por tela. Mudar o conteúdo para o que os capítulos 3, 4, 6 e 8 exigem do diagnóstico.

- Diferenciação: além do rótulo (preço, qualidade, atendimento), uma pergunta aberta do efeito. Exemplo: o que o cliente recebe por causa disso, e como se percebe.
- Concorrência: quem o cliente compara, em quê, e o que acontece com preço ou volume. Isso alimenta análise externa, não um elogio de “posição favorável”.
- Desafio: pedir o efeito observável, não só o tema. “Atraso de entrega” precisa de quando acontece e o que deixa de ser vendido.
- Setor: as perguntas de canal, estoque, margem, desperdício e tempo já são mais concretas. Ligar cada resposta a um item com efeito, em vez de a um rótulo de maturidade.
- Não acrescentar tela de BSC, de plano ou de cinco forças completas. Porter entra como pergunta de pressão (cliente, fornecedor, substituto) onde o ramo já pede custo, canal ou concorrente.

Pronto quando: cada força ou fraqueza gerada consegue citar a resposta e o efeito, e cada oportunidade cita uma condição de fora.

## Fase 4 — A edição confronta a operação

Arquivo: `app/(public)/swot/page.tsx`.

- Manter editar, apagar e acrescentar.
- Antes de seguir para a conversa, pedir três confirmações, sem transformar isso em formulário novo de estratégia:
  - qual ponto não representa a operação;
  - o que é fato, o que é hipótese e o que é desejo;
  - qual desafio a conversa deve explicar primeiro.
- Guardar essas notas na sessão e enviá-las no contexto de `consulta/page.tsx`.

Pronto quando: o agente recebe o quadro editado e a ressalva da pessoa, e a interface não trata a edição como prova.

## Fase 5 — O agente usa a base na conversa

Arquivo: `lib/agent-brief.ts`.

Abertura, além do que já faz:

- Explicar por que cada item está naquele quadrante.
- Dizer o que ainda é hipótese.
- Perguntar o efeito que falta, em vez de só listar indicadores do setor.
- Continuar sem propor estratégia completa nessa mensagem.

Conversa livre, em linguagem de negócio, sem citar Harvard na fala:

- Cruzar um fator interno com uma condição externa antes de sugerir caminho.
- Se o tema for crescimento, distinguir vender mais do mesmo, oferta nova, público novo e diversificação, e dizer o que a diversificação exige.
- Se o tema for resultado, separar objetivo, meta e o que seria observado.
- Se o tema for execução, pedir uma direção, o recurso, o prazo e o que faria abandonar a aposta.
- Recusar preencher lacuna com frase convincente.

Pronto quando: a primeira resposta explica e pergunta; a resposta seguinte só recomenda depois de ligar fator, condição e limite.

## Fase 6 — A documentação acompanha o código

A aba Fundamento lê `refs/` em `/fundamento`. Quando uma regra do produto mudar, o capítulo 12 só muda se o fluxo informado mudar. Não documentar gerador de plano, painel de indicador ou monitoramento automático.

O passo a passo da home descreve o formulário que a pessoa realmente percorre. Se a Fase 3 mudar uma pergunta, a frase correspondente em `components/site/HomePanels.tsx` muda junto.

## Ordem

1. Fase 1, para não corrigir o gerador morto.
2. Fase 2, porque é a quebra mais grave contra os capítulos de análise e de críticas.
3. Fase 5, para a conversa parar de herdar um quadro genérico sem critério.
4. Fase 3 e Fase 4, para a matéria-prima da SWOT melhorar.
5. Fase 6 a cada mudança visível.

## Fora deste plano

Não criar login, banco, painel de indicadores, gerador de plano, agenda nem execução automatizada. O capítulo 12 marca esses itens como fora do fluxo informado.
