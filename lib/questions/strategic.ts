import { Question } from '@/types/form';

export const strategicQuestions: Question[] = [
  {
    id: 'situacaoFinanceira',
    number: 6,
    label: 'Como o caixa fecha em relação às contas do mês?',
    microcopy: 'Condição interna. Sozinha, não vira recomendação nem força.',
    type: 'radio',
    options: [
      {
        value: 'prejuizo',
        label: 'As contas não fecham, ou fecham no prejuízo',
      },
      {
        value: 'equilibrio',
        label: 'As contas fecham, e sobra pouco',
      },
      {
        value: 'lucro-pequeno',
        label: 'Sobra um pouco, de forma repetida',
      },
      {
        value: 'lucro-crescente',
        label: 'O que sobra se mantém e tem crescido',
      },
      {
        value: 'excelente',
        label: 'O caixa cobre as contas e ainda forma reserva',
      },
    ],
  },
  {
    id: 'objetivoPrincipal',
    number: 7,
    label: 'Qual resultado você quer mudar nos próximos 12 meses?',
    microcopy: 'Uma intenção. Fica para a conversa. Não entra na SWOT como oportunidade.',
    type: 'radio',
    options: [
      {
        value: 'aumentar-vendas',
        label: 'Vender mais do que já se vende',
      },
      {
        value: 'aumentar-lucro',
        label: 'Melhorar a margem do que já se vende',
      },
      {
        value: 'expandir',
        label: 'Levar a oferta a outro público, ou criar oferta nova',
      },
      {
        value: 'eficiencia',
        label: 'Entregar o mesmo resultado com menos desperdício',
      },
      {
        value: 'marca',
        label: 'Ser reconhecido por quem já deveria comprar',
      },
      {
        value: 'equipe',
        label: 'Executar sem depender de uma única pessoa',
      },
    ],
  },
  {
    id: 'maiorDesafio',
    number: 8,
    label: 'Qual dificuldade explica a distância entre o resultado de hoje e o que o negócio precisa?',
    microcopy: 'O tema. O efeito concreto entra nas perguntas do ramo e na conversa.',
    type: 'radio',
    options: [
      {
        value: 'aquisicao',
        label: 'Chegam poucos clientes novos',
      },
      {
        value: 'retencao',
        label: 'Quem compra não volta',
      },
      {
        value: 'financeiro',
        label: 'O caixa não acompanha o que é vendido',
      },
      {
        value: 'tempo',
        label: 'O tempo de quem opera não cobre a demanda',
      },
      {
        value: 'precificacao',
        label: 'O preço não cobre o custo, ou não se sabe se cobre',
      },
      {
        value: 'concorrencia',
        label: 'Quem o cliente compara leva a venda ou aperta o preço',
      },
      {
        value: 'dependencia',
        label: 'Poucos clientes sustentam grande parte da receita',
      },
    ],
  },
  {
    id: 'diferenciacaoCompetitiva',
    number: 9,
    label: 'O que o cliente já recebe, e a operação consegue repetir?',
    microcopy: 'Marque só o que já acontece. Elogio sem efeito não sustenta força. Pode marcar mais de uma.',
    type: 'checkbox',
    options: [
      {
        value: 'preco',
        label: 'Preço menor que a alternativa que o cliente compara',
        icon: 'DollarSign',
        color: '#10B981',
      },
      {
        value: 'qualidade',
        label: 'Atributo pelo qual o cliente aceita pagar a mais',
        icon: 'Award',
        color: '#F59E0B',
      },
      {
        value: 'atendimento',
        label: 'Atendimento que muda a decisão de compra',
        icon: 'Heart',
        color: '#EF4444',
      },
      {
        value: 'velocidade',
        label: 'Prazo ou resposta mais curtos que a alternativa',
        icon: 'Zap',
        color: '#42A5F5',
      },
      {
        value: 'localizacao',
        label: 'Um lugar que o cliente já percorre',
        icon: 'MapPin',
        color: '#10B981',
      },
      {
        value: 'inovacao',
        label: 'Um modo de fazer que o concorrente próximo não oferece',
        icon: 'Lightbulb',
        color: '#F59E0B',
      },
      {
        value: 'tradicao',
        label: 'Recompra ou indicação que se repetem',
        icon: 'Shield',
        color: '#0D47A1',
      },
      {
        value: 'nao-sei',
        label: 'Ainda não sei o que muda a escolha do cliente',
        icon: 'HelpCircle',
        color: '#9CA3AF',
      },
    ],
  },
  {
    id: 'nivelDigitalizacao',
    number: 10,
    label: 'Como o digital entra na venda ou na entrega hoje?',
    microcopy: 'Presença fraca pode ser limite, se houver efeito. Querer ir para o digital não é oportunidade.',
    type: 'radio',
    options: [
      {
        value: 'zero',
        label: 'Quase não uso canal digital para vender ou entregar',
      },
      {
        value: 'basico',
        label: 'Tenho redes, e uso pouco para vender',
      },
      {
        value: 'social-ativo',
        label: 'Uso redes de forma contínua para vender ou atender',
      },
      {
        value: 'site',
        label: 'Site ou loja online já recebe pedido',
      },
      {
        value: 'digital-forte',
        label: 'O pedido ou a entrega dependem do digital',
      },
    ],
  },
  {
    id: 'capacidadeInvestimento',
    number: 11,
    label: 'Quanto dá para aplicar no negócio nos próximos 6 meses, sem comprometer as contas?',
    microcopy: 'Folga declarada. Não é força por si. Ausência de aporte não é fraqueza se a direção não exige dinheiro novo.',
    type: 'radio',
    options: [
      {
        value: 'zero',
        label: 'Nada além do que já paga as contas',
      },
      {
        value: '<5k',
        label: 'Até R$ 5.000',
      },
      {
        value: '5k-20k',
        label: 'R$ 5.000 a R$ 20.000',
      },
      {
        value: '20k-50k',
        label: 'R$ 20.000 a R$ 50.000',
      },
      {
        value: '>50k',
        label: 'Mais de R$ 50.000',
      },
    ],
  },
  {
    id: 'principaisClientes',
    number: 12,
    label: 'Quem paga pelo que você vende?',
    microcopy: 'Tipo de comprador. Ainda não diz como escolhe nem quanto pesa na receita. Pode marcar mais de uma.',
    type: 'checkbox',
    options: [
      {
        value: 'b2c',
        label: 'Pessoa física, para uso próprio',
        icon: 'Users',
        color: '#0D47A1',
      },
      {
        value: 'b2b',
        label: 'Outra empresa',
        icon: 'Building2',
        color: '#0D47A1',
      },
      {
        value: 'b2g',
        label: 'Órgão público',
        icon: 'Landmark',
        color: '#0D47A1',
      },
      {
        value: 'resellers',
        label: 'Quem revende ou distribui',
        icon: 'TrendingUp',
        color: '#10B981',
      },
    ],
  },
  {
    id: 'concorrenciaPercebida',
    number: 13,
    label: 'Quando o cliente compara, o que acontece com o seu preço ou com o seu volume?',
    microcopy: 'Rivalidade percebida. Não vira posição favorável nem ameaça sem um mecanismo.',
    type: 'radio',
    options: [
      {
        value: 'nenhum',
        label: 'Quase não há com quem o cliente compare',
      },
      {
        value: 'baixa',
        label: 'Há alternativas, e ainda sobra procura',
      },
      {
        value: 'moderada',
        label: 'A comparação é frequente, sem dominar a venda',
      },
      {
        value: 'alta',
        label: 'A comparação aperta preço ou tira volume',
      },
      {
        value: 'muito-alta',
        label: 'A comparação decide a maior parte das vendas',
      },
    ],
  },
];
