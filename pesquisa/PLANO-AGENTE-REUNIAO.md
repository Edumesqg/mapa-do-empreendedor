# Plano de desenvolvimento — Agente condutor do diagnóstico

Este plano descreve como transformar o consultor atual (abertura + chat livre em `/consulta`) em um **agente que toca a reunião de diagnóstico**, com **comandos pré-estabelecidos** e, após cada entrega, a escolha explícita de **revisar** ou **seguir** para o próximo comando.

O trabalho será aberto **etapa a etapa**. Cada etapa tem objetivo, escopo, arquivos, critério de pronto e o que fica de fora.

Relacionado: `pesquisa/PLANO-FUNDAMENTACAO.md` (fundamentação teórica da SWOT e da conversa). Este documento **não substitui** aquele; ele especifica a evolução do **agente como facilitador**.

---

## 1. Problema atual

Hoje o fluxo real é:

1. Formulário básico → formulário personalizado  
2. SWOT gerada por regras (`buildSwotFromAnswers`)  
3. Edição em `/swot`  
4. `/consulta` chama `/api/chat/luna` em modo `opening` e depois `chat` livre  

O agente:

- Explica a SWOT e lista 5–7 perguntas de uma vez  
- Depois responde o que a pessoa digitar, sem roteiro  
- Não grava fases, não oferece “revisar esta entrega / seguir”  
- Não conduz a reunião; reage a mensagens  

Resíduo de produto: nome de rota `luna`, UI de Luna/Jack/Nina/Typebot no dashboard (legado, fora do caminho).

---

## 2. Objetivo do produto

O agente passa a ser o **facilitador de uma reunião de diagnóstico**:

- Segue um **roteiro de comandos** fixos  
- Em cada comando, produz **uma entrega** (mensagem estruturada)  
- Após cada entrega, a interface oferece:
  - **Revisar** — regenera a mesma etapa com feedback da pessoa  
  - **Seguir** — aceita a entrega e dispara o próximo comando  
- Texto livre fica restrito às etapas que pedem resposta (ex.: perguntas de lacuna)  
- Chat livre, se existir, só **depois** do encerramento do diagnóstico  
- Continua obedecendo a doutrina: diagnóstico ≠ estratégia ≠ plano; sem inventar dado; SWOT editada prevalece  

---

## 3. Princípios que o código deve obedecer

1. **SWOT não nasce do LLM.** Continua vindo de regras + edição humana.  
2. **O agente interpreta e pergunta; não certifica verdade.**  
3. **Um comando = uma entrega = uma pausa humana.**  
4. **Revisar não avança fase.** Seguir grava aceite e avança.  
5. **Doutrina sob demanda.** Só injeta capítulos de `refs/` necessários ao comando.  
6. **Estado da reunião é explícito** (fase, entregas, revisões), não só histórico de chat.  
7. **Fora de escopo permanente** (capítulo 12 / como-usa): login obrigatório, banco, gerador de plano, painel de KPIs, monitoramento automático, multiagente Jack/Nina.

---

## 4. Visão do fluxo da reunião

```
[Sessão com SWOT] → /consulta (sala de reunião)
        │
        ▼
   COMANDO ABRIR
        │  [Revisar | Seguir]
        ▼
   COMANDO LER_SWOT
        │  [Revisar | Seguir]
        ▼
   COMANDO MAPEAR_LACUNAS
        │  [Revisar | Seguir]
        ▼
   COMANDO PERGUNTAR  ←── loop (1 pergunta por vez)
        │  resposta da pessoa → [Revisar interpretação | Seguir]
        ▼
   COMANDO ATUALIZAR_QUADRO  (opcional por resposta relevante)
        │  [Aceitar ajuste | Revisar | Seguir sem alterar]
        ▼
   COMANDO CRUZAR  (opcional, se houver base interna + externa)
        │  [Revisar | Seguir]
        ▼
   COMANDO ENCERRAR_DIAGNOSTICO
        │  síntese: claro / hipótese / o que não é plano
        ▼
   (opcional) MODO_LIVRE — conversa pós-diagnóstico
```

### Catálogo de comandos

| Comando | Função | Entrega esperada |
|---|---|---|
| `ABRIR` | Abrir a reunião | Cumprimento; nome da empresa; quadro provisório; o que a reunião vai e não vai fazer |
| `LER_SWOT` | Ler o quadro | Dentro/fora da operação; hipóteses marcadas; quadrante vazio = lacuna |
| `MAPEAR_LACUNAS` | Organizar o que falta | Lista numerada de lacunas com efeito que ainda falta |
| `PERGUNTAR` | Uma pergunta por vez | Pergunta única + por que ela importa para o diagnóstico |
| `INTERPRETAR_RESPOSTA` | Ler a resposta da pessoa | Fato / hipótese / desejo; o que muda no entendimento |
| `ATUALIZAR_QUADRO` | Propor ajuste na SWOT | Sugestão de inclusão/edição/remoção, rastreável à resposta; pessoa aceita ou não |
| `CRUZAR` | Ligar interno ↔ externo | Uma alternativa explicável, sem decisão automática |
| `ENCERRAR_DIAGNOSTICO` | Fechar a reunião | Síntese; o que ficou claro; o que segue hipótese; declaração de que não há plano |
| `MODO_LIVRE` | Pós-reunião | Conversa com lentes (só após encerrar) |

---

## 5. Modelo de estado da reunião

Persistir junto da sessão (ou chave dedicada no `localStorage` / `sessionStorage`), por exemplo:

```ts
type MeetingPhase =
  | 'ABRIR'
  | 'LER_SWOT'
  | 'MAPEAR_LACUNAS'
  | 'PERGUNTAR'
  | 'INTERPRETAR_RESPOSTA'
  | 'ATUALIZAR_QUADRO'
  | 'CRUZAR'
  | 'ENCERRAR_DIAGNOSTICO'
  | 'MODO_LIVRE'
  | 'DONE';

type MeetingDelivery = {
  id: string;
  command: MeetingPhase;
  content: string;
  status: 'draft' | 'accepted' | 'revised';
  createdAt: string;
  revisionNotes?: string;
};

type MeetingState = {
  version: 1;
  phase: MeetingPhase;
  deliveries: MeetingDelivery[];
  openGaps: string[];           // lacunas ainda abertas
  askedGapIndexes: number[];    // perguntas já feitas
  pendingUserAnswer?: string;   // última resposta livre
  swotDraftAdjustments?: Array<{
    quadrant: 'forcas' | 'fraquezas' | 'oportunidades' | 'ameacas';
    action: 'add' | 'edit' | 'remove';
    text: string;
    sourceAnswer?: string;
    accepted?: boolean;
  }>;
  closedAt?: string;
};
```

Regras:

- **Seguir** marca a entrega atual como `accepted` e avança `phase`.  
- **Revisar** exige nota curta da pessoa, regenera o mesmo `command`, marca entrega anterior como `revised`.  
- Respostas de `PERGUNTAR` alimentam `pendingUserAnswer` e disparam `INTERPRETAR_RESPOSTA`.  
- Ajustes aceitos em `ATUALIZAR_QUADRO` podem atualizar `Session.swot` (com confirmação explícita).

---

## 6. Contrato da API (alvo)

Endpoint atual: `POST /api/chat/luna`  
Alvo: manter rota ou renomear para algo neutro (ex. `/api/chat/consultor`) **sem quebrar** enquanto a UI migra.

Body proposto:

```ts
{
  command: MeetingPhase;
  action: 'run' | 'revise' | 'follow'; // follow só avança estado; run/revise geram texto
  revisionNotes?: string;
  messages?: { role: 'user' | 'assistant'; content: string }[]; // histórico curto da reunião
  userAnswer?: string;               // para PERGUNTAR / INTERPRETAR
  meeting?: MeetingState;            // estado atual (cliente envia; servidor não persiste ainda)
  apiKey: string;
  model?: string;
  baseURL?: string;
  swotData: { /* igual ao payload atual */ };
}
```

Resposta proposta:

```ts
{
  message: string;           // entrega em Markdown
  meeting: MeetingState;     // estado atualizado (phase, deliveries…)
  ui: {
    allowFreeText: boolean;  // true só quando a fase pede resposta
    primaryActions: Array<'revise' | 'follow' | 'accept_adjustment' | 'skip_adjustment'>;
  };
}
```

Prompts: um brief por comando em `lib/agent-briefs/` (ou seções em `lib/agent-brief.ts`), em vez de só `OPENING_BRIEF` + `CONVERSATION_BRIEF`.

---

## 7. Etapas de desenvolvimento

Abrir **uma etapa por vez**. Não misturar implementação de etapas seguintes “por enquanto”.

---

### Etapa 0 — Alinhamento e inventário (sem mudança de comportamento)

**Objetivo:** congelar o mapa do que existe e o que será tocado.

**Fazer:**
- Listar arquivos vivos vs legado (Luna sheet, dashboard Typebot, `diagnostico/page.tsx`).
- Confirmar jornada: formulários → SWOT → consulta.
- Decidir nome de produto na UI (“Consultor” / “Reunião de diagnóstico”) e se a rota `/api/chat/luna` será alias temporário.

**Arquivos de referência (leitura):**
- `app/(public)/consulta/page.tsx`
- `app/api/chat/luna/route.ts`
- `lib/agent-brief.ts`
- `lib/agent-docs.ts`
- `lib/session.ts`
- `pesquisa/PLANO-FUNDAMENTACAO.md`

**Pronto quando:** este plano está aceito e a lista de arquivos vivos está clara no time.

**Fora:** qualquer mudança de UI ou prompt.

#### Resultado da Etapa 0 (2026-11-16)

Status: **concluída** (só inventário e decisões; zero mudança de comportamento).

##### Jornada viva confirmada

```
/  (home)
 → /diagnostico  ──redirect──►  /formulario-basico
 → /formulario-personalizado?cluster=…
 → POST /api/generate-swot-initial  (+ saveSession)
 → /swot
 → /config  (chave; opcional se DEV_API_*)
 → /consulta  → POST /api/chat/luna  (opening | chat)
```

Redirects relevantes (`next.config.js`):  
`/diagnostico` → `/formulario-basico` · `/dashboard` → `/swot` · `/swot-inicial` → `/swot` · `/cadastro` e `/login` → `/diagnostico` · `/boas-vindas` → `/formulario-basico`.

Nav pública atual (`SiteHeader` / `Footer`): Diagnóstico · SWOT · **Agente** (`/consulta`) · Fundamento · Config.

##### Arquivos VIVOS (caminho feliz)

| Papel | Arquivo |
|---|---|
| Formulário 1 | `app/(public)/formulario-basico/page.tsx` |
| Formulário 2 | `app/(public)/formulario-personalizado/page.tsx` |
| Perguntas | `lib/questions/strategic.ts`, `lib/questions/clusters.ts` |
| Geração SWOT | `app/api/generate-swot-initial/route.ts` + `lib/swot-from-answers.ts` |
| Edição SWOT | `app/(public)/swot/page.tsx` |
| Config API | `app/(public)/config/page.tsx` + `app/api/dev-config/route.ts` |
| UI do agente | `app/(public)/consulta/page.tsx` + `components/chat/AgentReply.tsx` |
| API do agente | `app/api/chat/luna/route.ts` |
| Briefs | `lib/agent-brief.ts` (`OPENING_BRIEF`, `CONVERSATION_BRIEF`) |
| Doutrina / refs | `lib/agent-docs.ts` + `refs/*.md` + `lib/fundamento*.ts` |
| Sessão | `lib/session.ts` (`SESSION_KEY`, `CONFIG_KEY`, `CHAT_KEY`) |
| Labels intake | `lib/intake.ts` |
| Progresso forms | `hooks/useFormProgress.ts` |

##### Arquivos LEGADO / fora do caminho (não tocar nas Etapas 1–8, limpar na 9)

| Arquivo | Por que é legado |
|---|---|
| `app/(public)/diagnostico/page.tsx` | Existe, mas `/diagnostico` redireciona para formulário-basico |
| `app/(public)/swot-inicial/page.tsx` | Redirect para `/swot`; usa `generateMockSwot` |
| `lib/swot-generator.ts` (`generateMockSwot`) | Segundo gerador; path morto via redirect |
| `app/(dashboard)/dashboard/page.tsx` | Redirect `/dashboard` → `/swot`; ainda importa Luna/Typebot UI |
| `app/(dashboard)/layout.tsx` | Shell do dashboard inacessível pelo redirect |
| `components/chat/LunaChatSheet.tsx` | Só usado pelo dashboard; chama API sem `apiKey` no body → quebrado |
| `components/dashboard/TypebotChat.tsx` | Stub “Integração Typebot…” |
| `components/dashboard/AgentProgress.tsx` | Pipeline Luna → Jack → Nina (só UI) |
| `components/dashboard/DiagnosticCard.tsx` / `StatusCard.tsx` | Dashboard legado |
| `lib/typebot/client.ts` | Cliente stub (`Not implemented`) |

##### Decisões de nomenclatura (congeladas para as próximas etapas)

| Uso | Decisão |
|---|---|
| Papel do agente (copy / API health) | **Consultor** (já retorna `Consultor Autoconsultoria` no GET da API) |
| Experiência da tela `/consulta` | **Reunião de diagnóstico** (conceito de produto das Etapas 1+) |
| Label da nav até a Etapa 9 | Manter **Agente** (evita mudança cosmética cedo); na Etapa 9 avaliar → **Reunião** |
| Rota HTTP até a Etapa 9 | Manter **`/api/chat/luna`** como alias técnico temporário |
| Rename da rota | Só na **Etapa 9** → alvo preferido `/api/chat/consultor` (com redirect/alias se necessário) |
| Proibido no copy novo | Não introduzir “Luna”, “Jack”, “Nina” ou “Typebot” em telas do caminho feliz |

##### Implicações para a Etapa 1

- Criar `lib/meeting.ts` (preferível a inchar `session.ts`).
- Chave sugerida: `autoconsultoria-meeting-v1` em `sessionStorage` (alinhada a `CHAT_KEY` por aba).
- `/consulta` continua chamando `mode: 'opening' | 'chat'` até a Etapa 3.
- Não importar nem “consertar” `LunaChatSheet` no caminho novo.

---

### Etapa 1 — Estado da reunião no cliente

**Objetivo:** a sessão de consulta passa a ter `MeetingState`, independente ainda de mudar o roteiro do LLM.

**Fazer:**
- Estender `lib/session.ts` (ou criar `lib/meeting.ts`) com tipos e load/save.
- Em `/consulta`, inicializar reunião a partir da SWOT existente.
- Persistir entregas e fase (preferência: `sessionStorage` para o chat da aba + espelho mínimo na sessão se necessário).
- Manter, por enquanto, a chamada `opening` atual para não quebrar o uso.

**Pronto quando:**
- Recarregar a aba restaura fase e entregas.
- Sem SWOT → continua o aviso para fazer diagnóstico.
- Sem chave API → continua o aviso de Config.

**Fora:** botões Revisar/Seguir; novos prompts.

#### Resultado da Etapa 1 (2026-11-16)

Status: **concluída**.

- Criado `lib/meeting.ts` com tipos, `createMeeting` / `loadMeeting` / `saveMeeting` / `resolveMeeting` / `appendDelivery`.
- Chave `autoconsultoria-meeting-v1` em `sessionStorage`.
- `/consulta` inicializa reunião a partir da SWOT (`openGaps` = lacunas), grava entrega `ABRIR` após o `opening`, restaura fase/entregas no reload.
- Fingerprint da sessão invalida reunião se a SWOT mudar.
- API continua `mode: 'opening' | 'chat'` (sem Revisar/Seguir ainda).
- Label da página: “Reunião de diagnóstico” + fase atual.

---

### Etapa 2 — UI de reunião (Revisar | Seguir)

**Objetivo:** a interface deixa de parecer só chat e passa a conduzir pausas.

**Fazer:**
- Após cada mensagem do assistente na reunião, mostrar ações primárias:
  - **Revisar esta entrega** (abre campo curto de feedback)
  - **Seguir para o próximo passo**
- Esconder ou desabilitar o campo de texto livre fora das fases que pedem resposta.
- Estados visuais: “Entrega em revisão”, “Aceita”, “Fase atual: …”.
- Manter `AgentReply` para Markdown.

**Pronto quando:**
- Dá para percorrer Abrir → … sem digitar no chat (exceto fases de pergunta).
- Revisar não avança a fase; Seguir avança.

**Fora:** todos os comandos no servidor; ainda pode estar acoplado ao `opening`/`chat` antigo por trás.

#### Resultado da Etapa 2 (2026-11-16)

Status: **concluída**.

- `MeetingControls`: Revisar (com nota) | Seguir.
- Entregas com status visual (Aguardando aceite / Aceita / Revisada).
- Texto livre só em `PERGUNTAR` e `MODO_LIVRE`.
- `acceptAndAdvance` / `markActiveDraftRevised` / caminho `MEETING_MAIN_PATH` em `lib/meeting.ts`.
- Seguir gera a próxima entrega via ponte `PHASE_BRIDGE_PROMPTS` + `chat` (até a Etapa 3).
- Revisar regenera a mesma fase; não avança.

---

### Etapa 3 — API orientada a comando (`run` / `revise`)

**Objetivo:** o backend deixa de ser só `opening | chat` e passa a executar um comando.

**Fazer:**
- Aceitar `command` + `action` no body.
- Mapear compatibilidade: `mode: 'opening'` → `command: 'ABRIR'` ou pipeline inicial curto (temporário).
- Retornar `meeting` + `ui.primaryActions`.
- Limitar histórico enviado ao necessário da reunião.
- Briefs mínimos para `ABRIR` e `LER_SWOT` (extrair do `OPENING_BRIEF` atual).

**Pronto quando:**
- Postman/curl com `command: ABRIR` e `action: run` gera entrega.
- `action: revise` com nota altera a mesma fase sem avançar.
- Chat legado (se ainda houver) não quebra ou está claramente desligado na UI nova.

**Fora:** loop completo de perguntas; atualização da SWOT.

#### Resultado da Etapa 3 (2026-11-16)

Status: **concluída**.

- `POST /api/chat/luna` aceita `command` + `action` (`run` | `revise` | `follow` | `chat`).
- Compatibilidade: `mode: 'opening'` → `ABRIR`/`run`; `mode: 'chat'` → `MODO_LIVRE`/`chat`.
- Resposta: `{ message, meeting, ui: { allowFreeText, primaryActions } }`.
- Briefs por comando em `lib/agent-brief.ts` (`ABRIR_BRIEF`, `LER_SWOT_BRIEF`, demais mínimos).
- Doutrina por comando em `lib/agent-docs.ts`.
- `/consulta` deixou a ponte `PHASE_BRIDGE_PROMPTS` e passou a chamar a API por comando.

---

### Etapa 4 — Roteiro ABRIR → LER_SWOT → MAPEAR_LACUNAS

**Objetivo:** as três primeiras entregas da reunião existem de ponta a ponta.

**Fazer:**
- Briefs dedicados por comando.
- Doutrina: `ABRIR` leve; `LER_SWOT` com análise interna/externa + críticas; `MAPEAR_LACUNAS` com lacunas da sessão.
- UI avança só com Seguir: Abrir → Ler → Lacunas.
- Proibir plano/estratégia nessas entregas (já nas regras; reforçar no brief).

**Pronto quando:**
- Uma padaria de teste recebe três entregas distintas, coerentes com a SWOT, sem inventar item em quadrante vazio.
- Revisar em qualquer uma das três regenera só aquela entrega.

**Fora:** perguntas interativas; cruzamento; modo livre.

#### Resultado da Etapa 4 (2026-11-16)

Status: **concluída**.

- Briefs distintos e reforçados: `ABRIR` (só enquadra), `LER_SWOT` (Dentro/Fora + hipóteses), `MAPEAR_LACUNAS` (lacunas com efeito).
- Doutrina: ABRIR leve; LER_SWOT com análise interna/externa + críticas; MAPEAR sem Porter/Ansoff.
- API injeta quadrantes vazios + instrução de fase no bloco SWOT.
- `openGaps` sincroniza com `session.lacunas` ao entrar em MAPEAR/PERGUNTAR.
- UI: rótulos “Seguir para ler a SWOT / mapear lacunas / perguntar”; hint nas três etapas centrais.
- Removida a ponte `PHASE_BRIDGE_PROMPTS` (obsoleta).

---

### Etapa 5 — Loop PERGUNTAR → INTERPRETAR_RESPOSTA

**Objetivo:** o agente faz **uma pergunta por vez**, interpreta a resposta e só então segue.

**Fazer:**
- A partir de `openGaps` / lacunas da sessão, escolher a próxima pergunta.
- UI libera texto livre só em `PERGUNTAR`.
- Após enviar resposta → `INTERPRETAR_RESPOSTA` (fato / hipótese / desejo).
- Ações: Revisar interpretação | Seguir (próxima lacuna ou sair do loop).
- Critério de saída do loop: lacunas esgotadas, pessoa pede encerrar perguntas, ou limite configurável (ex. 5–7).

**Pronto quando:**
- Não lista mais 5–7 perguntas na mesma bolha como fluxo principal.
- Cada resposta gera interpretação explícita antes da próxima pergunta.

**Fora:** gravar automaticamente na SWOT sem confirmação.

#### Resultado da Etapa 5 (2026-11-16)

Status: **concluída**.

- Loop `PERGUNTAR` → resposta → `INTERPRETAR_RESPOSTA` → próxima pergunta ou saída para `CRUZAR`.
- Limite `MAX_GAP_QUESTIONS = 7`; lacuna em foco via `openGaps` / `askedGapIndexes`.
- Helpers: `beginInterpretation`, `advanceQuestionLoop`, `skipCurrentQuestion`, `shouldExitQuestionLoop`.
- Texto livre só em `PERGUNTAR` (Responder); em interpretação só Revisar/Seguir.
- Briefs e bloco `=== LOOP DE PERGUNTAS ===` na API.
- ATUALIZAR_QUADRO ainda não entra no caminho (Etapa 6).

---

### Etapa 6 — ATUALIZAR_QUADRO com aceite humano

**Objetivo:** respostas relevantes podem propor mudança na SWOT, sem o LLM reescrever o quadro sozinho.

**Fazer:**
- Após interpretações que sustentem item com efeito, sugerir `add` / `edit` / `remove`.
- UI: Aceitar ajuste | Revisar sugestão | Seguir sem alterar.
- Aceitar → atualiza `Session.swot` + eventualmente `lacunas`.
- Texto da sugestão deve citar a resposta da pessoa.

**Pronto quando:**
- Nada entra na SWOT sem clique de aceite.
- Item aceito aparece se a pessoa voltar em `/swot`.

**Fora:** ranquear itens; preencher quadrante vazio por “completude”.

#### Resultado da Etapa 6 (2026-11-16)

Status: **concluída**.

- Após `INTERPRETAR_RESPOSTA` → `ATUALIZAR_QUADRO` (proposta, não aplicação automática).
- Brief pede JSON `hasAdjustment`; servidor extrai e guarda em `swotDraftAdjustments`.
- UI: Aceitar ajuste | Revisar sugestão | Seguir sem alterar.
- `applySwotAdjustment` grava em `Session.swot` (+ lacunas) só no aceite; fingerprint da reunião atualiza.
- Depois do aceite/pula → próxima pergunta ou `CRUZAR`.

---

### Etapa 7 — CRUZAR e ENCERRAR_DIAGNOSTICO

**Objetivo:** fechar a reunião com opção de um cruzamento e uma síntese fiel à doutrina.

**Fazer:**
- `CRUZAR`: uma ligação interno↔externo como alternativa; sem decidir.
- Permitir pular cruzamento se faltar base.
- `ENCERRAR_DIAGNOSTICO`: o que está claro; o que é hipótese; o que a reunião **não** entregou (plano, ranking, garantia).
- Marcar `closedAt` e fase `DONE` ou liberar `MODO_LIVRE`.

**Pronto quando:**
- A última entrega não propõe plano de ação automático.
- A pessoa entende o limite do diagnóstico.

**Fora:** Ansoff/Porter completos como relatório; PDF; e-mail.

#### Resultado da Etapa 7 (2026-11-16)

Status: **concluída**.

- Briefs reforçados: `CRUZAR` (alternativa ou falta de base) e `ENCERRAR_DIAGNOSTICO` (3 seções obrigatórias, sem plano).
- API com instrução de fase para os dois comandos.
- Seguir em `ENCERRAR` → `closeDiagnosticAndOpenFreeTalk` (`closedAt` + `MODO_LIVRE`).
- Cruzamento tratado como opcional na UI (pode seguir mesmo sem base).
- Helpers: `isDiagnosticClosed`, `closeDiagnosticAndOpenFreeTalk`.

---

### Etapa 8 — MODO_LIVRE pós-diagnóstico (opcional)

**Objetivo:** conversa livre só depois do encerramento, reusando lentes do `CONVERSATION_BRIEF`.

**Fazer:**
- Habilitar input livre apenas com diagnóstico encerrado.
- Manter lentes: cruzamento, Porter, Ansoff, operação, resultado, direção.
- Não reiniciar SWOT inteira; não apagar estado da reunião.

**Pronto quando:**
- Tentativa de chat livre antes do encerramento é bloqueada ou redirecionada ao comando atual.

**Fora:** transformar modo livre no caminho principal de novo.

#### Resultado da Etapa 8 (2026-11-16)

Status: **concluída**.

- `phaseAllowsFreeChat` exige `MODO_LIVRE` + `closedAt`; resposta de lacuna continua só em `PERGUNTAR`.
- API `action: chat` rejeita se o diagnóstico não estiver encerrado.
- `CONVERSATION_BRIEF` reforçado com lentes (cruzamento, Porter, Ansoff, operação, resultado, direção) e proibição de reiniciar SWOT/plano.
- UI: input livre pós-encerramento; botão Encerrar reunião; histórico da reunião preservado.

---

### Etapa 9 — Limpeza de legado e nomenclatura

**Objetivo:** o código contar a mesma história que o produto.

**Fazer:**
- Renomear ou aliasar `/api/chat/luna` → nome neutro; atualizar clientes.
- Remover ou isolar `LunaChatSheet`, Typebot stub e progresso Jack/Nina se não forem usados.
- Ajustar textos da home / painéis se descrevem “chat livre” como passo central.
- Documentar o fluxo da reunião em `/fundamento/como-usa` **somente** se o fluxo informado mudar (alinhado à Fase 6 do plano de fundamentação).

**Pronto quando:**
- Busca por “Luna” no caminho feliz do usuário não aparece (ou só como alias técnico documentado).
- Nenhum CTA aponta para dashboard/Typebot morto.

#### Resultado da Etapa 9 (2026-11-16)

Status: **concluída**.

- API principal: `/api/chat/consultor`; `/api/chat/luna` ficou só como alias de reexport.
- Removidos: `LunaChatSheet`, Typebot, AgentProgress, DiagnosticCard, StatusCard, `lib/typebot`.
- Dashboard legado → `redirect('/swot')`.
- Nav/footer: **Reunião**; SWOT CTA e home atualizados para reunião de diagnóstico.
- `refs/Como a Autoconsultoria usa esta base.md` e catálogo do fundamento alinhados ao fluxo da reunião.

---

### Etapa 10 — Endurecimento e qualidade

**Objetivo:** a reunião sobrevive a falhas e regressões.

**Fazer:**
- Tratamento de erro de API sem perder fase.
- Limites de token / capítulos injetados por comando.
- Casos de teste manuais (roteiro em seção 9).
- (Opcional) testes unitários dos reducers de `MeetingState` (avançar, revisar, aceitar ajuste).

**Pronto quando:**
- Falha de chave/modelo mostra erro e permite repetir o mesmo comando.
- Checklist manual da seção 9 passa.

#### Resultado da Etapa 10 (2026-11-16)

Status: **concluída** (código + testes automatizados dos reducers; checklist manual fica para validação humana).

- Falha de entrega: banner com **Tentar de novo**; rollback da fase se o avanço já tinha ocorrido.
- Doutrina: limite por capítulo (`5000`), total (`12000`) e máx. 5 capítulos/comando.
- API: `max_tokens` por comando.
- Testes: `lib/meeting.reducers.test.ts` via `npm run test:meeting`.
- Roteiro manual da seção 9 virou checklist (itens 10–11).

---

## 8. Ordem de abertura

| Ordem | Etapa | Por quê nesta ordem |
|---|---|---|
| 1 | Etapa 0 | Acordo de escopo |
| 2 | Etapa 1 | Estado antes de UI |
| 3 | Etapa 2 | Pausas humanas visíveis |
| 4 | Etapa 3 | Contrato de API |
| 5 | Etapa 4 | Primeiro roteiro fechado |
| 6 | Etapa 5 | Coração do diagnóstico |
| 7 | Etapa 6 | SWOT continua soberana e humana |
| 8 | Etapa 7 | Fechamento metodológico |
| 9 | Etapa 8 | Livre só como pós-evento |
| 10 | Etapa 9 | Remover ruído legado |
| 11 | Etapa 10 | Confiança operacional |

Dependência com `PLANO-FUNDAMENTACAO.md`:

- Melhorias no gerador SWOT e nas perguntas (Fases 2–3 da fundamentação) **melhoram a matéria-prima** deste agente, mas **não bloqueiam** Etapas 1–4.
- Confirmações fato/hipótese/desejo na tela `/swot` (Fase 4 da fundamentação) **complementam** Etapa 6; podem ser feitas em paralelo depois da Etapa 5.

---

## 9. Roteiro de teste manual (por etapa entregue)

Empresa fictícia sugerida: padaria de bairro, equipe pequena, poucas respostas, um quadrante fraco.

Checklist (Etapa 10):

1. [ ] Completar diagnóstico → gerar SWOT → editar um item → ir à consulta.  
2. [ ] Ver fase `ABRIR` → Revisar com nota (“não diga que é estratégia”) → conferir regeneração.  
3. [ ] Seguir → `LER_SWOT` → conferir que quadrante vazio vira lacuna, sem invenção.  
4. [ ] Seguir → `MAPEAR_LACUNAS` → lacunas numeradas.  
5. [ ] Loop de pergunta: responder com desejo (“quero crescer”) → interpretação deve marcar desejo ≠ oportunidade.  
6. [ ] Proposta de ajuste na SWOT → recusar → quadro inalterado; depois aceitar → quadro muda.  
7. [ ] Encerrar → síntese sem plano.  
8. [ ] Tentar modo livre antes do fim → bloqueado.  
9. [ ] Recarregar a aba no meio → fase e entregas restauradas.  
10. [ ] Simular falha de API (chave inválida) → erro na fase atual + **Tentar de novo** sem perder a reunião.  
11. [ ] `npm run test:meeting` passa.

---

## 10. Arquivos previstos (mapa de mudança)

| Área | Arquivos prováveis |
|---|---|
| Estado | `lib/session.ts`, `lib/meeting.ts` (novo) |
| Briefs | `lib/agent-brief.ts` → `lib/agent-briefs/*.ts` (ou seções) |
| Doutrina | `lib/agent-docs.ts` (seleção por comando) |
| API | `app/api/chat/luna/route.ts` (+ eventual rename) |
| UI | `app/(public)/consulta/page.tsx`, `components/chat/*` (ações Revisar/Seguir) |
| SWOT | `app/(public)/swot/page.tsx` (só se Etapa 6 gravar de volta) |
| Docs produto | `pesquisa/PLANO-FUNDAMENTACAO.md`, `refs/Como a Autoconsultoria usa esta base.md` (só se fluxo informado mudar) |
| Legado | `components/chat/LunaChatSheet.tsx`, `components/dashboard/*`, Typebot |

---

## 11. Fora deste plano

- Login, autenticação, multi-tenant, banco de dados  
- Gerador automático de plano de ação, OKRs, BSC completo  
- Pesquisa de mercado autônoma, scrapers, agents Jack/Nina  
- Integração Typebot como caminho principal  
- App mobile nativo  
- Cobrança / paywall (salvo decisão futura fora deste documento)

---

## 12. Como abrir cada etapa no dia a dia

1. Escolher a próxima etapa da seção 8.  
2. Copiar o bloco **Objetivo / Fazer / Pronto quando / Fora** da etapa para a issue ou o chat de implementação.  
3. Implementar só aquilo.  
4. Rodar o trecho aplicável do roteiro da seção 9.  
5. Marcar a etapa como feita neste arquivo (checklist abaixo) antes de abrir a seguinte.

### Checklist de progresso

- [x] Etapa 0 — Alinhamento e inventário  
- [x] Etapa 1 — Estado da reunião no cliente  
- [x] Etapa 2 — UI Revisar \| Seguir  
- [x] Etapa 3 — API por comando  
- [x] Etapa 4 — ABRIR → LER_SWOT → MAPEAR_LACUNAS  
- [x] Etapa 5 — PERGUNTAR → INTERPRETAR_RESPOSTA  
- [x] Etapa 6 — ATUALIZAR_QUADRO  
- [x] Etapa 7 — CRUZAR → ENCERRAR  
- [x] Etapa 8 — MODO_LIVRE  
- [x] Etapa 9 — Limpeza e nomenclatura  
- [x] Etapa 10 — Endurecimento e qualidade  

---

## 13. Definição de pronto do plano inteiro

A melhoria está concluída quando:

1. A pessoa com SWOT consegue completar uma reunião só com Revisar/Seguir (+ texto nas perguntas).  
2. Cada entrega é pausável e revisável.  
3. O agente não inventa item de SWOT nem gera plano no encerramento.  
4. Ajustes de quadro exigem aceite humano.  
5. Chat livre, se existir, só após o diagnóstico.  
6. Legado Luna/Typebot não confunde o caminho feliz.  
7. A doutrina em `refs/` continua sendo a regra, não o contrário.
