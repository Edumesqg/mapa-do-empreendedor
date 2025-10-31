'use client';

import { useState, useEffect } from 'react';
import { LunaChatSheet } from '@/components/chat/LunaChatSheet';
import { AgentProgress } from '@/components/dashboard/AgentProgress';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { DiagnosticCard } from '@/components/dashboard/DiagnosticCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Clock, Bot, MessageCircle } from 'lucide-react';

type DiagnosticStatus = 'none' | 'processing' | 'completed';
type CurrentAgent = 'luna' | 'jack' | 'nina' | null;

export default function DashboardPage() {
  const [diagnosticStatus, setDiagnosticStatus] =
    useState<DiagnosticStatus>('none');
  const [currentAgent, setCurrentAgent] = useState<CurrentAgent>(null);
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [lunaChatOpen, setLunaChatOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasDiagnostic = localStorage.getItem('formCompleto');
      const hasPaid = localStorage.getItem('hasPaid') === 'true';
      const typebotProgress = localStorage.getItem('typebotProgress');

      if (hasDiagnostic && hasPaid) {
        setDiagnosticStatus('processing');

        if (typebotProgress) {
          try {
            const progress = JSON.parse(typebotProgress);
            setCurrentAgent(progress.currentAgent || 'luna');
            setCompletedAgents(progress.completedAgents || []);
            setCurrentStep(progress.completedAgents?.length || 1);
          } catch (e) {
            setCurrentAgent('luna');
            setCurrentStep(1);
          }
        } else {
          setCurrentAgent('luna');
          setCurrentStep(1);
        }
      }
    }
  }, []);

  const totalDiagnostics = diagnosticStatus === 'none' ? 0 : 1;
  const availableReports = diagnosticStatus === 'completed' ? 3 : 0;
  const lastAccess = 'Hoje';

  return (
    <div className="space-y-12">
      <section className="animate-fade-in">
        <h1 className="mb-2 text-3xl font-bold text-navy-blue md:text-4xl">
          Olá, Eduardo! 👋
        </h1>
        <p className="text-lg text-gray-600 md:text-xl">
          Bem-vindo ao seu painel de controle estratégico
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          icon={BarChart3}
          iconColor="text-royal-blue"
          iconBgColor="bg-blue-50"
          value={totalDiagnostics}
          label="Diagnósticos realizados"
        />
        <StatusCard
          icon={FileText}
          iconColor="text-emerald-green"
          iconBgColor="bg-emerald-50"
          value={availableReports}
          label="Relatórios disponíveis"
        />
        <StatusCard
          icon={Clock}
          iconColor="text-amber-orange"
          iconBgColor="bg-amber-50"
          value={lastAccess}
          label="Último acesso"
        />
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="mb-3 text-2xl font-bold text-navy-blue md:text-3xl">
            Continue seu diagnóstico estratégico
          </h2>
          <p className="text-base text-gray-600 md:text-lg">
            Converse com nossos agentes de IA para refinar e completar sua
            análise
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <Card className="overflow-hidden border-2 border-purple-200 shadow-lg transition-shadow hover:shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Bot className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Luna - SWOT Specialist</CardTitle>
                    <p className="text-sm text-gray-600">Validação e refinamento</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-700">
                  Luna irá revisar sua análise SWOT, fazer perguntas estratégicas e
                  aprofundar cada quadrante para garantir máxima precisão.
                </p>
                <Button
                  onClick={() => {
                    setLunaChatOpen(true);
                    if (!currentAgent) {
                      setCurrentAgent('luna');
                      setCurrentStep(1);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Conversar Agora
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <AgentProgress
              currentAgent={currentAgent}
              completedAgents={completedAgents}
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-navy-blue">
          Seu diagnóstico atual
        </h2>

        <DiagnosticCard
          status={diagnosticStatus}
          empresaNome="Padaria do João"
          setor="Alimentação"
          criadoEm="28 de outubro, 2025"
          currentStep={currentStep}
        />
      </section>

      <LunaChatSheet open={lunaChatOpen} onOpenChange={setLunaChatOpen} />
    </div>
  );
}
