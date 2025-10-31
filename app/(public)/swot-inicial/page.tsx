'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Loader2,
  User,
} from 'lucide-react';
import {
  generateMockSwot,
  getSetorLabel,
  getExperienciaLabel,
  SwotData,
  SwotItem,
} from '@/lib/swot-generator';

export default function SwotInicialPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [swotData, setSwotData] = useState<SwotData | null>(null);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      try {
        const completeData = JSON.parse(
          localStorage.getItem('formCompleto') || '{}'
        );
        setFormData(completeData);

        const swot = generateMockSwot(completeData);
        setSwotData(swot);

        localStorage.setItem(
          'swotInicial',
          JSON.stringify({
            empresaNome: completeData.empresaNome,
            setor: getSetorLabel(completeData.setor),
            forcas: swot.strengths,
            fraquezas: swot.weaknesses,
            oportunidades: swot.opportunities,
            ameacas: swot.threats,
          })
        );
      } catch (error) {
        console.error('Error loading form data:', error);
      }

      setIsLoading(false);
    }, 2500);
  }, []);


  const handleUpgradeClick = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-gray to-white">
        <div className="text-center">
          <Loader2 className="mx-auto mb-6 h-16 w-16 animate-spin text-royal-blue" />
          <h2 className="mb-2 text-2xl font-bold text-navy-blue">
            Analisando suas respostas...
          </h2>
          <p className="text-lg text-gray-600">
            Preparando sua análise SWOT personalizada
          </p>
        </div>
      </div>
    );
  }

  if (!swotData || !formData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">
            Nenhum dado encontrado. Por favor, complete o formulário.
          </p>
          <Button
            onClick={() => router.push('/formulario-basico')}
            className="mt-4 bg-royal-blue hover:bg-[#1565C0]"
          >
            Ir para o formulário
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white px-6 py-6 md:px-8">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <h1 className="text-xl font-semibold text-navy-blue">
            Diagnóstico Estratégico Automatizado
          </h1>

          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <span className="hidden text-sm font-medium text-gray-700 md:block">
              {formData.empresaNome || 'Empreendedor'}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-royal-blue text-white">
              <User className="h-5 w-5" />
            </div>
          </button>
        </div>
      </header>

      <section className="bg-gradient-to-b from-slate-gray to-white px-6 py-12 text-center md:px-8 md:py-16">
        <div className="mx-auto max-w-[1200px]">
          <Badge className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-green to-[#059669] px-5 py-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4" />
            Análise Completa
          </Badge>

          <h1 className="mb-4 text-3xl font-bold text-navy-blue md:text-5xl">
            Sua Análise SWOT está pronta!
          </h1>

          <p className="mx-auto mb-8 max-w-[700px] text-lg text-gray-600 md:text-xl">
            Veja uma análise inicial do seu negócio baseada nas suas respostas.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-base font-medium text-gray-600 md:gap-4 md:text-lg">
            <span className="font-semibold text-navy-blue">
              {formData.empresaNome || 'Seu Negócio'}
            </span>
            <span className="hidden md:inline">•</span>
            <span>{getSetorLabel(formData.setor)}</span>
            <span className="hidden md:inline">•</span>
            <span>{getExperienciaLabel(formData.experiencia)}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SwotCard
            title="Forças"
            icon={TrendingUp}
            items={swotData.strengths}
            type="strength"
            delay={0.1}
          />

          <SwotCard
            title="Oportunidades"
            icon={Sparkles}
            items={swotData.opportunities}
            type="opportunity"
            delay={0.2}
          />

          <SwotCard
            title="Fraquezas"
            icon={AlertCircle}
            items={swotData.weaknesses}
            type="weakness"
            delay={0.3}
          />

          <SwotCard
            title="Ameaças"
            icon={AlertTriangle}
            items={swotData.threats}
            type="threat"
            delay={0.4}
          />
        </div>
      </section>

      <section className="border-t border-gray-200 bg-slate-gray px-6 py-12 text-center md:px-8 md:py-16">
        <div className="mx-auto max-w-[1000px]">
          <Badge className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-royal-blue to-sky-blue px-6 py-3 text-sm font-bold text-white">
            🔓 Desbloqueie o Diagnóstico Completo
          </Badge>

          <h2 className="mb-4 text-2xl font-bold text-navy-blue md:text-4xl">
            Quer ir além da análise básica?
          </h2>

          <p className="mx-auto mb-10 max-w-[700px] text-base text-gray-600 md:text-lg">
            Nossa IA avançada e agentes especialistas avaliam sua SWOT e montam
            um plano completo com TOWS, OKRs e Roadmap de Ações.
          </p>

          <div className="mx-auto mb-10 grid max-w-[900px] grid-cols-1 gap-4 md:grid-cols-3">
            {[
              'Validação SWOT com IA (Luna)',
              'Pesquisa de mercado (Jack)',
              'Plano estratégico completo (Nina)',
              'Matriz TOWS personalizada',
              'OKRs e metas claras',
              '3 relatórios em PDF',
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-left text-sm font-medium text-carbon md:text-base"
              >
                <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-green" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleUpgradeClick}
            className="mb-4 h-auto w-full bg-gradient-to-r from-emerald-green to-[#059669] px-12 py-5 text-lg font-bold text-white shadow-lg shadow-emerald-green/30 transition-all hover:translate-y-[-2px] hover:shadow-xl active:scale-[0.98] md:w-auto md:text-xl"
          >
            Acessar Análise Completa →
          </Button>

          <p className="mb-2 text-base font-semibold text-gray-700">
            ⏱️ Entrega em ~45 minutos
          </p>

          <p className="text-sm text-gray-500">
            ✓ Garantia de satisfação. Reembolso simples em até 7 dias.
          </p>
        </div>
      </section>

    </div>
  );
}

interface SwotCardProps {
  title: string;
  icon: React.ElementType;
  items: SwotItem[];
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  delay: number;
}

function SwotCard({ title, icon: Icon, items, type, delay }: SwotCardProps) {
  const styles = {
    strength: {
      borderColor: 'border-emerald-green',
      borderLeft: 'border-l-4 border-l-emerald-green',
      bgGradient: 'bg-gradient-to-br from-emerald-green/5 to-white',
      iconBg: 'bg-emerald-green/10',
      iconColor: 'text-emerald-green',
      titleColor: 'text-[#047857]',
      badgeBg: 'bg-emerald-green/20',
      badgeColor: 'text-[#047857]',
    },
    opportunity: {
      borderColor: 'border-sky-blue',
      borderLeft: 'border-l-4 border-l-sky-blue',
      bgGradient: 'bg-gradient-to-br from-sky-blue/5 to-white',
      iconBg: 'bg-sky-blue/10',
      iconColor: 'text-sky-blue',
      titleColor: 'text-[#1E40AF]',
      badgeBg: 'bg-sky-blue/20',
      badgeColor: 'text-[#1E40AF]',
    },
    weakness: {
      borderColor: 'border-coral-red',
      borderLeft: 'border-l-4 border-l-coral-red',
      bgGradient: 'bg-gradient-to-br from-coral-red/5 to-white',
      iconBg: 'bg-coral-red/10',
      iconColor: 'text-coral-red',
      titleColor: 'text-[#B91C1C]',
      badgeBg: 'bg-coral-red/20',
      badgeColor: 'text-[#B91C1C]',
    },
    threat: {
      borderColor: 'border-amber-orange',
      borderLeft: 'border-l-4 border-l-amber-orange',
      bgGradient: 'bg-gradient-to-br from-amber-orange/5 to-white',
      iconBg: 'bg-amber-orange/10',
      iconColor: 'text-amber-orange',
      titleColor: 'text-[#D97706]',
      badgeBg: 'bg-amber-orange/20',
      badgeColor: 'text-[#D97706]',
    },
  };

  const style = styles[type];

  return (
    <div
      className={`animate-fade-in-up min-h-[320px] rounded-2xl border-2 ${style.borderColor} ${style.borderLeft} ${style.bgGradient} p-8 shadow-md transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className={`rounded-xl ${style.iconBg} p-3`}>
          <Icon className={`h-8 w-8 ${style.iconColor}`} />
        </div>
        <h3 className={`text-2xl font-bold ${style.titleColor}`}>{title}</h3>
      </div>

      <ul className="space-y-4">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={`flex items-start gap-3 ${
              index !== items.length - 1 ? 'border-b border-gray-200 pb-4' : ''
            }`}
          >
            <CheckCircle
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${style.iconColor}`}
            />
            <div className="flex-1">
              <p className="text-base leading-relaxed text-carbon">
                {item.texto}
              </p>
              {(item.relevancia === 'alta' ||
                item.potencial === 'alto' ||
                item.criticidade === 'alta' ||
                item.urgencia === 'alta') && (
                <Badge
                  className={`mt-2 ${style.badgeBg} ${style.badgeColor} border-0 text-xs font-medium`}
                >
                  {item.relevancia === 'alta' && 'Alta relevância'}
                  {item.potencial === 'alto' && 'Alto potencial'}
                  {item.criticidade === 'alta' && 'Alta criticidade'}
                  {item.urgencia === 'alta' && 'Alta urgência'}
                </Badge>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
