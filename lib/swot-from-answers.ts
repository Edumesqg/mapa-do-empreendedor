export type SwotText = { texto: string };

export type SwotDraft = {
  forcas: SwotText[];
  fraquezas: SwotText[];
  oportunidades: SwotText[];
  ameacas: SwotText[];
  lacunas: string[];
};

type Answers = Record<string, unknown>;

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function includes(value: unknown, needle: string) {
  return Array.isArray(value) && value.includes(needle);
}

const objetivoLabel: Record<string, string> = {
  expandir: 'crescer e expandir',
  marca: 'fortalecer a marca',
  eficiencia: 'ganhar eficiência',
  'aumentar-vendas': 'aumentar vendas',
  'aumentar-lucro': 'melhorar a margem',
  equipe: 'formar equipe',
};

const desafioInterno: Record<string, string> = {
  aquisicao:
    'Desafio declarado: atrair clientes novos. Ainda não há o mecanismo, se é oferta, acesso ou procura.',
  retencao:
    'Desafio declarado: reter quem já compra. Ainda não há o que interrompe a recompra.',
  financeiro:
    'Desafio declarado: caixa e margem. Falta saber se o limite é registro, preço ou prazo de recebimento.',
  tempo:
    'Limite declarado: falta de tempo. Falta onde esse tempo é consumido na operação.',
  precificacao: 'Limite declarado: dificuldade de formar preço e de enxergar a margem.',
  dependencia:
    'A receita declarada depende de poucos clientes. A saída de um deles muda o resultado.',
};

export function buildSwotFromAnswers(input: Answers): SwotDraft {
  const forcas: SwotText[] = [];
  const fraquezas: SwotText[] = [];
  const oportunidades: SwotText[] = [];
  const ameacas: SwotText[] = [];
  const lacunas: string[] = [];

  const diferencial = text(input.diferencial) || text(input.observacoesAdicionais);
  const repete = text(input.oQueRepete);
  const quem = text(input.quemCompra);
  const pressao = text(input.pressaoExterna);
  const financeiro = text(input.situacaoFinanceira);
  const desafio = text(input.maiorDesafio);
  const digital = text(input.nivelDigitalizacao);
  const concorrencia = text(input.concorrenciaPercebida);
  const objetivo = text(input.objetivoPrincipal);
  const investimento = text(input.capacidadeInvestimento);

  if (diferencial) {
    forcas.push({
      texto: `Condição declarada pelo dono: ${diferencial}. O efeito no cliente ainda precisa ser confirmado.`,
    });
  }

  if (repete) {
    forcas.push({
      texto: `Capacidade que a operação declara repetir: ${repete}.`,
    });
  } else {
    lacunas.push('Não há descrição de uma capacidade que a operação consiga repetir, nem do efeito dela.');
  }

  if (digital === 'site' || digital === 'digital-forte') {
    forcas.push({
      texto: 'O dono declara presença digital própria em uso. Falta o efeito sobre como o cliente chega ou compra.',
    });
  }

  if (financeiro === 'prejuizo') {
    fraquezas.push({
      texto: 'O caixa declarado não cobre as contas. A operação fica restrita ao que já está comprometido.',
    });
  } else if (financeiro === 'equilibrio') {
    fraquezas.push({
      texto: 'As contas fecham sem sobra declarada. Ainda não há medida de quanto isso limita uma ação.',
    });
  }

  if (desafio === 'financeiro' && (financeiro === 'prejuizo' || financeiro === 'equilibrio')) {
    lacunas.push('Caixa e desafio financeiro se sobrepõem. A conversa precisa separar registro, preço e prazo de recebimento.');
  } else if (desafioInterno[desafio]) {
    fraquezas.push({ texto: desafioInterno[desafio] });
  } else if (desafio === 'concorrencia') {
    ameacas.push({
      texto: 'O desafio declarado é a concorrência. Falta quem o cliente compara, em quê e quando isso comprime a margem.',
    });
  }

  if (investimento === 'zero' || investimento === '<5k') {
    fraquezas.push({
      texto: 'Não há folga declarada para investir nos próximos meses.',
    });
  } else if (investimento === '20k-50k' || investimento === '>50k' || investimento === '5k-20k') {
    lacunas.push('Há folga de investimento declarada. Ela não é força enquanto não estiver ligada a um efeito.');
  }

  if (input.controleDesperdicioAlimentacao === 'nao') {
    fraquezas.push({
      texto: 'Não há controle declarado de desperdício e validade. Efeito a confirmar: perda de insumo e de margem.',
    });
  }

  if (input.controleEstoqueComercio === 'nao') {
    fraquezas.push({
      texto: 'Não há controle declarado de estoque. A loja não sabe o que pode vender sem ruptura ou sobra.',
    });
  }

  if (input.margemLucroComercio === 'nao') {
    fraquezas.push({
      texto: 'A margem por produto não é conhecida. O preço fica sem base de custo.',
    });
  }

  if (input.processosDocumentadosServicos === 'nao' || input.processosDocumentadosServicos === 'mental') {
    fraquezas.push({
      texto: 'A forma de entregar o serviço não está registrada. A repetição depende de quem já sabe fazer.',
    });
  }

  if (input.controleQualidadeIndustria === 'nao') {
    fraquezas.push({
      texto: 'Não há controle de qualidade declarado antes da entrega.',
    });
  }

  if (input.gestaoFinanceiraAgro === 'nao') {
    fraquezas.push({
      texto: 'O custo da produção não está registrado. A margem fica sem medida.',
    });
  }

  if (input.certificacoesAgro === 'sim') {
    forcas.push({
      texto: 'Há certificação declarada. Falta saber se o comprador paga por ela ou se ela só libera a venda.',
    });
  }

  if (quem) {
    lacunas.push(
      `Quem compra foi descrito assim: “${quem}”. Isso ainda não é oportunidade. Falta a condição externa, o público e o benefício.`
    );
  } else {
    lacunas.push('Não há descrição de quem compra nem de como essa pessoa escolhe.');
  }

  if (pressao) {
    ameacas.push({
      texto: `Pressão declarada de fora: ${pressao}. Confirmar a exposição da empresa e o mecanismo de dano.`,
    });
  }

  if (concorrencia === 'alta' || concorrencia === 'muito-alta') {
    if (desafio !== 'concorrencia') {
      ameacas.push({
        texto: 'A concorrência é percebida como alta. Falta quem compara, em quê e quando isso comprime a margem.',
      });
    }
  } else if (concorrencia === 'baixa' || concorrencia === 'nenhum' || concorrencia === 'moderada') {
    lacunas.push(
      'A concorrência informada é percepção, não força. Falta com quem o cliente compara e o que decide a escolha.'
    );
  } else if (!pressao) {
    lacunas.push('Nenhuma pressão externa foi descrita. Ameaça sem fato não entra no quadro.');
  }

  if (digital === 'zero' || digital === 'basico') {
    lacunas.push(
      'A presença digital foi descrita como fraca. Isso só vira fraqueza se impedir o cliente de chegar ou de comprar.'
    );
  }

  if (objetivo) {
    lacunas.push(
      `A intenção deste ciclo é ${objetivoLabel[objetivo] || objetivo}. Intenção não entra como oportunidade. Se a conversa for de crescimento, separar penetração, produto novo, mercado novo e diversificação.`
    );
  }

  lacunas.push(
    'Tempo de mercado, tamanho da equipe e faturamento são contexto. Eles não viram força nem fraqueza sem um efeito observável.'
  );

  if (includes(input.diferenciacaoCompetitiva, 'nao-sei')) {
    lacunas.push('O dono declarou que ainda não sabe o que diferencia o negócio. Não transformar isso em força.');
  }

  if (oportunidades.length === 0) {
    lacunas.push(
      'Nenhuma oportunidade externa foi sustentada. Desejo, ação pretendida e canal ainda não usado ficam de fora até haver condição, público e benefício.'
    );
  }

  return { forcas, fraquezas, oportunidades, ameacas, lacunas };
}
