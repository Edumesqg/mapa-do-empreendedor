import { z } from 'zod';

export const formBasicoSchema = z.object({
  empresaNome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  setor: z.string().min(1, 'Selecione um setor'),
  experiencia: z.string().min(1, 'Selecione uma opção'),
  equipe: z.string().min(1, 'Selecione uma opção'),
  receita: z.string().min(1, 'Selecione uma opção'),
});

export type FormBasicoData = z.infer<typeof formBasicoSchema>;

export const setorOptions = [
  {
    value: 'comercio',
    label: 'Comércio',
    icon: 'ShoppingBag',
    color: '#0D47A1',
  },
  {
    value: 'servicos',
    label: 'Serviços',
    icon: 'Briefcase',
    color: '#0D47A1',
  },
  {
    value: 'educacao',
    label: 'Educação e treinamento',
    icon: 'GraduationCap',
    color: '#0D47A1',
  },
  {
    value: 'saude',
    label: 'Saúde e bem-estar',
    icon: 'Heart',
    color: '#EF4444',
  },
  {
    value: 'industria',
    label: 'Indústria e construção',
    icon: 'Factory',
    color: '#6B7280',
  },
  {
    value: 'alimentacao',
    label: 'Alimentação',
    icon: 'Utensils',
    color: '#F59E0B',
  },
  {
    value: 'agro',
    label: 'Agro',
    icon: 'Sprout',
    color: '#10B981',
  },
  {
    value: 'tecnologia',
    label: 'Tecnologia',
    icon: 'Laptop',
    color: '#42A5F5',
  },
  {
    value: 'outro',
    label: 'Outro',
    icon: 'HelpCircle',
    color: '#9CA3AF',
  },
];

export const experienciaOptions = [
  {
    value: '<1ano',
    label: 'Menos de 1 ano',
  },
  {
    value: '1-2anos',
    label: 'De 1 a 2 anos',
  },
  {
    value: '3-5anos',
    label: 'De 3 a 5 anos',
  },
  {
    value: '6-10anos',
    label: 'De 6 a 10 anos',
  },
  {
    value: '>10anos',
    label: 'Mais de 10 anos',
  },
];

export const equipeOptions = [
  {
    value: 'so-eu',
    label: 'Só eu',
  },
  {
    value: '2-5',
    label: '2 a 5 pessoas',
  },
  {
    value: '6-10',
    label: '6 a 10 pessoas',
  },
  {
    value: '11-20',
    label: '11 a 20 pessoas',
  },
  {
    value: '>20',
    label: 'Mais de 20 pessoas',
  },
];

export const receitaOptions = [
  {
    value: '<5k',
    label: 'Até R$ 5.000 por mês',
  },
  {
    value: '5k-20k',
    label: 'De R$ 5.000 a R$ 20.000 por mês',
  },
  {
    value: '20k-50k',
    label: 'De R$ 20.000 a R$ 50.000 por mês',
  },
  {
    value: '50k-100k',
    label: 'De R$ 50.000 a R$ 100.000 por mês',
  },
  {
    value: '>100k',
    label: 'Mais de R$ 100.000 por mês',
  },
];
