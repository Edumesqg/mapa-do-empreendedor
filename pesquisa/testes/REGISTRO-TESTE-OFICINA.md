# Registro de teste — Oficina do Centro

**Data:** 2026-11-16  
**Objetivo:** Validar o projeto funcionando de ponta a ponta (diagnóstico → SWOT → reunião com Claude → modo livre), com evidências por passo.  
**Provedor:** Claude Haiku 5.5 (`claude-haiku-5-5` via Anthropic OpenAI-compatible)  
**URL:** http://localhost:3000  
**Cenário:** negócio fictício distinto da padaria (serviços / oficina)

## Critérios de aceite

| # | Critério | Status |
|---|----------|--------|
| C1 | Formulário básico aceita dados da oficina | pendente |
| C2 | SWOT gerada sem inventar oportunidade/ameaça sem fato | pendente |
| C3 | Reunião abre com Claude (fase ABRIR) | pendente |
| C4 | Fluxo Revisar/Seguir até ENCERRAR | pendente |
| C5 | Conversa livre só após encerrar; resposta sem plano automático | pendente |

## Roteiro

1. Configurar API Claude no navegador (dev-config)
2. Preencher formulário básico — Oficina do Centro
3. Completar personalizado / gerar SWOT (ou seed equivalente + UI)
4. Revisar SWOT em `/swot`
5. Abrir reunião — ABRIR
6. Seguir — LER_SWOT
7. Seguir — MAPEAR_LACUNAS
8. PERGUNTAR — responder 1 lacuna
9. INTERPRETAR → ATUALIZAR → pular restantes → CRUZAR → ENCERRAR
10. Modo livre — 1 pergunta de direção
11. Encerrar e fechar registro

## Evidências

Pasta: `pesquisa/testes/evidencias-oficina-2026-11-16/`

| Passo | Arquivo | Resultado |
|-------|---------|-----------|
| — | — | (preenchido durante o teste) |

## Notas ao vivo

_(atualizado durante a execução)_
