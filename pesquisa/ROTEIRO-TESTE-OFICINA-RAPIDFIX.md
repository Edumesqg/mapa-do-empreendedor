# Roteiro de teste manual — Oficina RapidFix

Caso **novo** (serviços), para validar o fluxo completo no navegador com a Claude.

- **URL:** http://localhost:3005  
- **Modelo esperado em Config:** `claude-haiku-5-5`  
- **Endpoint:** `https://api.anthropic.com/v1/`  
- **Personagem:** Carlos, dono da oficina há ~4 anos  
- **Objetivo do teste:** ver se o agente respeita Revisar|Seguir, não inventa oportunidade, não gera plano automático e só libera conversa livre após o encerramento

---

## Antes de começar

1. Abra http://localhost:3005/config  
2. Confira (ou salve) chave Anthropic, modelo `claude-haiku-5-5` e endpoint `https://api.anthropic.com/v1/`  
3. Em seguida abra http://localhost:3005/formulario-basico  
4. Se aparecer reunião antiga, limpe a sessão do navegador (Application → Local Storage → apague `autoconsultoria-session` e chaves de meeting) ou use janela anônima

---

## Parte A — Formulário básico (perguntas 1–5)

| # | Pergunta na tela | Preencha / escolha |
|---|------------------|--------------------|
| 1 | Qual o nome do seu negócio? | `Oficina RapidFix` |
| 2 | O que o negócio vende ou entrega? | **Serviços** |
| 3 | Há quanto tempo esta operação existe? | **De 3 a 5 anos** |
| 4 | Quantas pessoas fazem o trabalho, incluindo você? | **2 a 5 pessoas** |
| 5 | Qual a faixa de receita mensal? | **De R$ 20.000 a R$ 50.000 por mês** |

Botão final: **Seguir para o que o negócio faz →**

---

## Parte B — Formulário personalizado (perguntas 6–21)

### Estratégicas (6–13)

| # | Pergunta | Escolha |
|---|----------|---------|
| 6 | Como o caixa fecha em relação às contas do mês? | **As contas fecham, e sobra pouco** |
| 7 | Qual resultado você quer mudar nos próximos 12 meses? | **Vender mais do que já se vende** |
| 8 | Qual dificuldade explica a distância entre o resultado de hoje e o que o negócio precisa? | **O tempo de quem opera não cobre a demanda** |
| 9 | O que o cliente já recebe, e a operação consegue repetir? *(pode marcar mais de uma)* | **Prazo ou resposta mais curtos que a alternativa** **e** **Atendimento que muda a decisão de compra** |
| 10 | Como o digital entra na venda ou na entrega hoje? | **Tenho redes, e uso pouco para vender** |
| 11 | Quanto dá para aplicar no negócio nos próximos 6 meses, sem comprometer as contas? | **Até R$ 5.000** |
| 12 | Quem paga pelo que você vende? *(pode marcar mais de uma)* | **Pessoa física, para uso próprio** **e** **Outra empresa** |
| 13 | Quando o cliente compara, o que acontece com o seu preço ou com o seu volume? | **A comparação é frequente, sem dominar a venda** |

### Cluster Serviços (14–17)

| # | Pergunta | Escolha |
|---|----------|---------|
| 14 | Como o preço do serviço é definido hoje? | **Por projeto ou pacote fechado** |
| 15 | O que acontece quando outra pessoa precisa entregar o mesmo serviço? | **Só quem fundou sabe fazer** |
| 16 | Para onde vai a maior parte do tempo de quem opera? | **A maior parte vai para entregar** |
| 17 | O valor cobrado cobre o tempo e o custo desta entrega? | **Não sei se cobre** |

### Evidência (18–20) — copie o texto

| # | Pergunta | Texto |
|---|----------|-------|
| 18 | Quem compra de fato, e o que essa pessoa compara na hora de escolher? | `Motoristas da região e frotas pequenas de delivery. Comparam prazo de entrega do carro e preço do serviço com duas oficinas do bairro.` |
| 19 | O que a operação repete, mesmo sem ter planejado? | `Orçamento no mesmo dia para quem deixa o carro até as 10h, e devolução no mesmo dia em serviços de freio e óleo.` |
| 20 | Que fato de fora você já viu mudar preço, volume ou acesso? | `Neste ano duas oficinas vizinhas passaram a oferecer troca de óleo com desconto no Instagram e puxaram parte dos carros de passeio.` |

### Fechamento (21)

| # | Pergunta | Texto |
|---|----------|-------|
| 21 | Há algum fato da operação que as perguntas não pegaram? | `Carlos ainda atende o balcão e faz diagnóstico. O ajudante só executa o que Carlos liberou. WhatsApp recebe pedido, mas responde só à noite.` |

Aguarde **Organizando a SWOT** → deve ir para `/swot`.

---

## Parte C — Página SWOT

1. Confira o título **Oficina RapidFix**.  
2. Leia Forças / Fraquezas / Oportunidades / Ameaças e o bloco **O que ficou de fora**.  
3. **Não invente** item de oportunidade se o quadro estiver vazio — isso é esperado.  
4. (Opcional) Edite um ponto que não represente a operação.  
5. Clique **Abrir reunião de diagnóstico**.

Checklist rápido:

- [ ] Intenção “vender mais” **não** virou oportunidade sozinha  
- [ ] “Só quem fundou sabe” tende a sustentar limite / lacuna, não força  
- [ ] Pressão das oficinas no Instagram pode aparecer como ameaça **ou** lacuna, conforme o gerador — anote o que saiu

---

## Parte D — Reunião de diagnóstico (agente)

Em cada etapa use só **Revisar esta entrega** ou **Seguir…**. Não digite no chat livre enquanto o diagnóstico estiver aberto.

| Ordem | Fase na tela | O que fazer | O que observar |
|-------|--------------|-------------|----------------|
| 1 | Abrir reunião | Ler a abertura → **Seguir para ler a SWOT** | Deixa claro que SWOT ≠ estratégia ≠ plano |
| 2 | Ler a SWOT | Ler a leitura → **Seguir para mapear lacunas** | Separação dentro/fora; vazio = lacuna |
| 3 | Mapear lacunas | Ler lista → **Seguir para perguntar** | Lacunas amarradas a itens do quadro |
| 4 | Perguntar | Responda **uma** pergunta (texto abaixo) → **Responder** | Uma pergunta por vez; botão Responder só após texto |
| 5 | Interpretar resposta | Ler Fato / Hipótese / Desejo → **Seguir** | Desejo não vira oportunidade |
| 6 | Atualizar quadro | Se houver ajuste: **Aceitar** ou pular; se não houver, **Seguir** | Só muda o que a resposta sustenta |
| 7 | Perguntas restantes | **Pular esta pergunta** nas que sobrarem *(ou responda se quiser estender o teste)* | Contador de perguntas sobe |
| 8 | Cruzar fatores | Ler cruzamento → **Seguir para encerrar** | Sem condição de fora, cruzamento deve ficar sem base |
| 9 | Encerrar diagnóstico | Ler síntese → **Encerrar e liberar conversa livre** | Sintese sem plano, sem ranking de ação |

### Resposta sugerida na 1ª pergunta (Parte D, passo 4)

Use o texto abaixo (ou adapte se a pergunta for outra lacuna):

```text
Quem deixa o carro até as 10h quer sair no mesmo dia. Compara com a oficina da esquina pelo prazo; preço só decide se o prazo empatar. Ainda não sei se a frota de delivery voltaria se eu respondesse WhatsApp de manhã.
```

### Se a pergunta for sobre tempo / dependência do dono

```text
Carlos faz o diagnóstico e libera o serviço. O ajudante não fecha orçamento sozinho. De manhã o balcão e a oficina competem pelo mesmo tempo; WhatsApp só é respondido à noite.
```

### Se a pergunta for sobre concorrência / Instagram

```text
Vi carros de passeio irem para as duas oficinas que postam óleo com desconto. A frota de delivery ainda vem por indicação de prazo. Não medi quantos carros perdi no mês.
```

---

## Parte E — Conversa livre

Só depois de **Encerrar e liberar conversa livre**.

Banner esperado: diagnóstico encerrado; sem reiniciar SWOT; sem plano automático.

### Mensagem 1 — copie e envie

```text
Com a falta de tempo do Carlos de manhã, vale priorizar responder WhatsApp no horário comercial?
```

O que checar na resposta:

- [ ] Separa o que se sabe do que falta  
- [ ] Não manda “abra o WhatsApp agora” como plano  
- [ ] Liga tempo do balcão / diagnóstico à capacidade de responder  
- [ ] Pode sugerir o que observar, sem fechar decisão

### Mensagem 2 (opcional)

```text
Se eu aceitar só frota de delivery e largar carro de passeio, isso seria estratégia ou ainda é desejo?
```

Esperado: classificar como intenção/direção ainda sem evidência suficiente; não montar plano.

### Encerrar

Clique **Encerrar reunião** quando terminar.

---

## Folha de resultado (marque ao final)

| Critério | Ok? | Nota |
|----------|-----|------|
| Formulário 1–21 sem erro de validação | ☐ | |
| SWOT gerou e abriu `/swot` | ☐ | |
| Config Claude usada (Haiku 5.5) | ☐ | |
| Chat livre bloqueado antes do encerramento | ☐ | |
| ABRIR → ENCERRAR com Revisar/Seguir | ☐ | |
| Cruzamento sem inventar oportunidade | ☐ | |
| Encerramento sem plano automático | ☐ | |
| Conversa livre coerente com o diagnóstico | ☐ | |
| Tempo total aproximado | ☐ | ___ min |

---

## Atalhos úteis

| Página | URL |
|--------|-----|
| Início do teste | http://localhost:3005/formulario-basico |
| Config API | http://localhost:3005/config |
| SWOT | http://localhost:3005/swot |
| Reunião | http://localhost:3005/consulta |

Se a porta 3005 estiver ocupada, suba com outra porta e troque o número nas URLs:

```powershell
$env:PORT='3005'; npm run dev
```
