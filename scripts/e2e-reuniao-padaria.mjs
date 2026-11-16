/**
 * Teste E2E da reunião de diagnóstico (padaria fictícia).
 * Usa a chave de /api/dev-config — não imprime a chave.
 */
const BASE = process.env.E2E_BASE || 'http://localhost:3000';

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function json(url, init, retries = 3) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 240000);
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      lastErr = err;
      console.log(`  (rede tentativa ${attempt}/${retries}: ${err.message || err})`);
      if (attempt < retries) await sleep(2500 * attempt);
    }
  }
  throw lastErr;
}

function preview(text, n = 280) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : `${t.slice(0, n)}…`;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  console.log('=== E2E reunião — Padaria do Bairro ===\n');

  const cfg = await json(`${BASE}/api/dev-config`);
  assert(cfg.ok && cfg.data.apiKey, 'Sem DEV_API_KEY (/api/dev-config).');
  const { apiKey, model, baseURL } = cfg.data;
  console.log(`API ok · model=${model}`);

  const answers = {
    empresaNome: 'Padaria do Bairro',
    setor: 'alimentos',
    experiencia: '3-5',
    equipe: '2-5',
    receita: '10-50k',
    situacaoFinanceira: 'apertado',
    objetivoPrincipal: 'aumentar-vendas',
    maiorDesafio: 'tempo',
    nivelDigitalizacao: 'whatsapp',
    concorrenciaPercebida: 'media',
    diferencial: 'Pão fresquinho de manhã e atendimento pelo nome',
    quemCompra: 'Vizinhos que passam a caminho do trabalho',
    oQueRepete: 'Assar pão francês todo dia às 5h',
    pressaoExterna: '',
  };

  const swotRes = await json(`${BASE}/api/generate-swot-initial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
  });
  assert(swotRes.ok, `SWOT falhou: ${swotRes.status} ${JSON.stringify(swotRes.data)}`);
  const swot = swotRes.data;
  console.log(
    `SWOT gerada · F=${swot.forcas?.length || 0} Fr=${swot.fraquezas?.length || 0} O=${swot.oportunidades?.length || 0} A=${swot.ameacas?.length || 0} lacunas=${swot.lacunas?.length || 0}`
  );

  const swotData = {
    empresaNome: answers.empresaNome,
    setor: 'Alimentos e bebidas',
    contexto: Object.entries(answers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n'),
    forcas: swot.forcas || [],
    fraquezas: swot.fraquezas || [],
    oportunidades: swot.oportunidades || [],
    ameacas: swot.ameacas || [],
    lacunas: swot.lacunas || [],
  };

  let meeting = {
    version: 1,
    phase: 'ABRIR',
    deliveries: [],
    openGaps: [...(swot.lacunas || [])],
    askedGapIndexes: [],
    sessionFingerprint: 'e2e-padaria',
  };

  async function run(command, action = 'run', extra = {}) {
    const body = {
      command,
      action,
      meeting,
      apiKey,
      model,
      baseURL,
      swotData,
      messages: [],
      ...extra,
    };
    const started = Date.now();
    const res = await json(`${BASE}/api/chat/consultor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const ms = Date.now() - started;
    assert(res.ok, `${command}/${action} falhou (${res.status}): ${res.data.error || JSON.stringify(res.data)}`);
    meeting = res.data.meeting;
    const msg = res.data.message || '';
    console.log(`\n--- ${command} (${action}) · ${ms}ms · fase=${meeting.phase} · entregas=${meeting.deliveries.length}`);
    console.log(preview(msg, 360));
    return msg;
  }

  function accept() {
    const last = meeting.deliveries[meeting.deliveries.length - 1];
    if (last && last.status === 'draft') last.status = 'accepted';
  }

  // 1–3 núcleo
  await run('ABRIR');
  accept();
  meeting = { ...meeting, phase: 'LER_SWOT' };
  await run('LER_SWOT');
  accept();
  meeting = { ...meeting, phase: 'MAPEAR_LACUNAS' };
  await run('MAPEAR_LACUNAS');
  accept();

  // 4–6 pergunta → interpretar → atualizar
  meeting = { ...meeting, phase: 'PERGUNTAR', openGaps: swotData.lacunas };
  await run('PERGUNTAR');
  accept();

  const userAnswer =
    'Quero crescer no digital e vender mais pelo WhatsApp, mas ainda não sei se o vizinho compra assim.';
  meeting = {
    ...meeting,
    phase: 'INTERPRETAR_RESPOSTA',
    pendingUserAnswer: userAnswer,
    askedGapIndexes: meeting.openGaps.length ? [0] : [0],
  };
  await run('INTERPRETAR_RESPOSTA', 'run', { userAnswer });
  accept();

  meeting = { ...meeting, phase: 'ATUALIZAR_QUADRO', pendingUserAnswer: userAnswer };
  await run('ATUALIZAR_QUADRO', 'run', { userAnswer });
  const adj = meeting.swotDraftAdjustments?.[0];
  console.log(
    adj
      ? `Ajuste proposto: ${adj.action} / ${adj.quadrant} → ${preview(adj.text, 120)}`
      : 'Sem ajuste sustentável (hasAdjustment false) — ok metodológico'
  );
  accept();

  // 7 cruzar + encerrar
  meeting = { ...meeting, phase: 'CRUZAR', pendingUserAnswer: undefined, swotDraftAdjustments: [] };
  await run('CRUZAR');
  accept();
  meeting = { ...meeting, phase: 'ENCERRAR_DIAGNOSTICO' };
  const encerrar = await run('ENCERRAR_DIAGNOSTICO');
  assert(!/cronograma|plano de ação|próximos passos operacionais/i.test(encerrar), 'ENCERRAR não deveria parecer plano automático');
  accept();

  // 8 modo livre
  meeting = {
    ...meeting,
    phase: 'MODO_LIVRE',
    closedAt: new Date().toISOString(),
  };
  await run('MODO_LIVRE');
  accept();

  const chat = await json(`${BASE}/api/chat/consultor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command: 'MODO_LIVRE',
      action: 'chat',
      meeting,
      apiKey,
      model,
      baseURL,
      swotData,
      userAnswer: 'Se eu priorizar o WhatsApp, o que isso exige da operação da padaria?',
      messages: [{ role: 'user', content: 'Se eu priorizar o WhatsApp, o que isso exige da operação da padaria?' }],
    }),
  });
  assert(chat.ok, `chat livre falhou: ${chat.data.error || chat.status}`);
  console.log(`\n--- MODO_LIVRE (chat) · preview`);
  console.log(preview(chat.data.message, 360));

  // Bloqueio antes do encerramento
  const blocked = await json(`${BASE}/api/chat/consultor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command: 'ABRIR',
      action: 'chat',
      meeting: { ...meeting, phase: 'ABRIR', closedAt: undefined },
      apiKey,
      model,
      baseURL,
      swotData,
      userAnswer: 'quero conversar agora',
      messages: [],
    }),
  });
  assert(blocked.status === 400, 'chat antes do encerramento deveria ser 400');
  console.log('\nBloqueio de chat pré-encerramento: OK');

  console.log('\n=== E2E CONCLUÍDO COM SUCESSO ===');
  console.log(`Entregas acumuladas: ${meeting.deliveries.length}`);
}

main().catch((err) => {
  console.error('\nE2E FALHOU:', err.message || err);
  process.exit(1);
});
