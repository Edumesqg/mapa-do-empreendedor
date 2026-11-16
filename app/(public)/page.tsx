import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Code2,
  Linkedin,
  MessageCircle,
  PencilRuler,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { HomePanels } from '@/components/site/HomePanels';
import { SiteHeader } from '@/components/site/SiteHeader';

export const metadata: Metadata = {
  title: 'Autoconsultoria | Estratégia para pequenas empresas',
  description:
    'Um projeto open source que aproxima conhecimento acadêmico, experiência em consultoria e inteligência artificial da realidade de pequenas empresas. Faça seu diagnóstico sem cadastro.',
};

const etapas = [
  {
    numero: '01',
    titulo: 'Responda ao diagnóstico',
    descricao:
      'Conte como sua empresa funciona. Uma pergunta por vez, sobre o que acontece na operação. Sem cadastro.',
    Icone: ClipboardList,
  },
  {
    numero: '02',
    titulo: 'Veja e revise sua SWOT',
    descricao:
      'Receba um quadro baseado nas suas respostas. Ajuste o que não representa a realidade do negócio.',
    Icone: PencilRuler,
  },
  {
    numero: '03',
    titulo: 'Reunião de diagnóstico',
    descricao:
      'Com sua própria chave de API, o consultor conduz a reunião: lê o quadro, mapeia lacunas, pergunta o que falta e só depois libera conversa livre.',
    Icone: MessageCircle,
  },
];

const garantias = [
  {
    titulo: 'Sem cadastro',
    descricao: 'O diagnóstico fica no seu navegador.',
    Icone: CheckCircle2,
  },
  {
    titulo: 'Open source',
    descricao: 'Código e método abertos para consulta.',
    Icone: Code2,
  },
  {
    titulo: 'Sua chave, seu controle',
    descricao: 'A chave é sua e não fica no servidor.',
    Icone: ShieldCheck,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative isolate overflow-hidden bg-[#061f3c] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-90"
            style={{
              background:
                'radial-gradient(ellipse 800px 500px at 78% 14%, rgba(0, 133, 241, .18), transparent 70%), radial-gradient(ellipse 650px 450px at 5% 105%, rgba(0, 117, 215, .24), transparent 80%)',
            }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 h-[680px] w-[680px] -skew-x-12 rounded-[100px] bg-cyan-400/[0.035]" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-14 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:pb-16 lg:pt-20">
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200 sm:text-sm">
                <span className="h-5 w-[3px] rounded-full bg-sky-400" />
                Projeto independente e open source
              </div>

              <h1 className="mt-7 text-4xl font-bold leading-[1.1] tracking-[-0.045em] sm:text-5xl lg:text-[clamp(3.3rem,4.65vw,4.8rem)]">
                Análise estratégica para <span className="text-[#72c6ff]">pequenas empresas.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200 sm:text-xl">
                Entenda melhor o seu negócio com um diagnóstico simples, uma SWOT baseada no que você conta e uma reunião guiada com IA para explorar o que ainda falta.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/diagnostico"
                  className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-[#078cf4] px-6 py-3.5 text-base font-semibold text-white shadow-[0_12px_30px_rgba(0,106,210,0.28)] transition hover:-translate-y-0.5 hover:bg-[#027fe4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
                >
                  Começar o diagnóstico <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
                <Link
                  href="/fundamento"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-white/45 bg-white/[0.04] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  Ler o fundamento
                </Link>
              </div>

              <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300">
                O diagnóstico não exige conhecimento de administração. Basta contar o que já acontece na sua empresa.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[540px] lg:max-w-none">
              <div className="absolute -inset-4 rounded-[42px] bg-gradient-to-tr from-sky-500/20 via-transparent to-white/5 blur-2xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#153958] shadow-[0_34px_90px_rgba(0,8,25,0.45)]">
                <Image
                  src="/autoconsultoria/hero-empreendedor.webp"
                  alt="Empreendedor atendendo clientes em seu pequeno comércio"
                  width={880}
                  height={680}
                  priority
                  className="aspect-[1.19] w-full object-cover object-[center_28%]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#061f3c]/25 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-white/15 bg-[#082947]/95 px-5 py-3 shadow-xl backdrop-blur sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300"><BookOpen className="h-5 w-5" /></span>
                <span className="text-sm font-medium text-slate-100">Conhecimento aplicado à vida real</span>
              </div>
            </div>
          </div>

          <div className="relative border-t border-white/10 bg-[#051b34]/65">
            <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:grid-cols-3 sm:gap-4 sm:px-8">
              {garantias.map(({ titulo, descricao, Icone }, index) => (
                <div
                  key={titulo}
                  className={`flex items-start gap-3 sm:py-1 ${index > 0 ? 'sm:border-l sm:border-white/15 sm:pl-6 lg:pl-10' : ''}`}
                >
                  <Icone aria-hidden="true" className="mt-0.5 h-7 w-7 shrink-0 text-sky-300" strokeWidth={1.65} />
                  <div>
                    <p className="font-semibold text-white">{titulo}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-300">{descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HISTÓRIA DO PROJETO */}
        <section className="px-5 py-20 sm:px-8 lg:py-24" aria-labelledby="historia-titulo">
          <div className="mx-auto grid max-w-7xl items-center gap-11 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0876cf]">Por trás do projeto</p>
              <h2 id="historia-titulo" className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.035em] text-[#07294a] sm:text-4xl">
                Por que criei a <span className="text-[#087de0]">Autoconsultoria?</span>
              </h2>
              <div className="mt-6 max-w-[620px] space-y-4 text-base leading-8 text-slate-600 sm:text-lg">
                <p>
                  Trabalhando com consultoria empresarial, participei de projetos de diagnóstico, análise de negócios e melhoria de processos em empresas de diferentes setores.
                </p>
                <p>
                  Nesse caminho, percebi que muito do conhecimento usado em grandes projetos também poderia ser útil para quem toca uma padaria, uma oficina, uma loja ou um pequeno negócio no campo.
                </p>
                <p>
                  Criei a Autoconsultoria para aproximar esses conhecimentos da rotina de quem empreende, reunindo fundamentos acadêmicos, experiência prática e inteligência artificial em um projeto aberto.
                </p>
              </div>
              <div className="mt-7 border-l-[3px] border-[#078cf4] pl-5 text-lg font-semibold leading-8 text-[#0a3356]">
                A proposta não é a IA decidir por você. É ajudar a olhar para o seu negócio com mais clareza.
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-[#e9f4fb] shadow-[0_20px_70px_rgba(19,63,103,0.1)]">
              <Image
                src="/autoconsultoria/livros-estrategia.webp"
                alt="Imagem ilustrativa de livros sobre estratégia e gestão de negócios"
                width={778}
                height={440}
                className="w-full object-cover"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-xl border border-white/70 bg-white/90 px-5 py-3 text-sm font-medium text-[#123c60] shadow-sm backdrop-blur-sm sm:inset-x-8">
                Da teoria de gestão às perguntas do dia a dia.
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-usar" className="scroll-mt-24 bg-[#f5f9fd] px-5 py-20 sm:px-8 lg:py-24" aria-labelledby="como-titulo">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0876cf]">Simples de começar</p>
              <h2 id="como-titulo" className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#07294a] sm:text-4xl">Como funciona?</h2>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                Você descreve sua empresa, revisa o que a análise mostra e abre uma reunião guiada com o consultor.
              </p>
            </div>

            <div className="mt-11 grid gap-5 md:grid-cols-3">
              {etapas.map(({ numero, titulo, descricao, Icone }) => (
                <article key={numero} className="group relative rounded-[24px] border border-[#dbe8f3] bg-white p-7 shadow-[0_12px_32px_rgba(11,55,95,0.035)] transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_22px_40px_rgba(11,55,95,0.09)]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f5ff] text-[#078cf4]">
                      <Icone className="h-7 w-7" aria-hidden="true" strokeWidth={1.8} />
                    </span>
                    <span className="text-sm font-bold tracking-[0.13em] text-slate-300">{numero}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-bold tracking-tight text-[#082b4b]">{titulo}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{descricao}</p>
                </article>
              ))}
            </div>

            <p className="mx-auto mt-7 max-w-3xl text-center text-sm leading-6 text-slate-500">
              O que não estiver sustentado pelas respostas não precisa entrar na SWOT. Um quadrante pode ficar vazio; o quadro pode ser editado por você.
            </p>
          </div>
        </section>

        <HomePanels />

        {/* AUTOR */}
        <section className="px-5 py-20 sm:px-8 lg:py-24" aria-labelledby="autor-titulo">
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[260px_1fr] lg:gap-14">
            <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-[32px] border border-[#0c5e9b]/20 bg-[#0c5e9b]/5 shadow-[0_24px_60px_rgba(2,54,99,.22)] lg:h-64 lg:w-64">
              <Image
                src="/autoconsultoria/eduardo-mesquita.webp"
                alt="Foto de Eduardo Mesquita Gomes, criador do projeto"
                width={512}
                height={512}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0876cf]">Quem criou o projeto</p>
              <h2 id="autor-titulo" className="mt-3 text-3xl font-bold tracking-[-0.035em] text-[#07294a] sm:text-4xl">Eduardo Mesquita Gomes</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Profissional de dados, inteligência artificial e estratégia de negócios, com experiência em consultoria e projetos de transformação empresarial.
              </p>
              <ul className="mt-6 grid gap-3 text-sm leading-6 text-slate-700 sm:text-base">
                <li className="flex items-start gap-3"><BookOpen aria-hidden="true" className="mt-1 h-[18px] w-[18px] shrink-0 text-[#087de0]" />Mestrando em Administração — ESALQ/USP</li>
                <li className="flex items-start gap-3"><BookOpen aria-hidden="true" className="mt-1 h-[18px] w-[18px] shrink-0 text-[#087de0]" />Executive MBA em Data Science &amp; Analytics — ESALQ/USP</li>
                <li className="flex items-start gap-3"><BookOpen aria-hidden="true" className="mt-1 h-[18px] w-[18px] shrink-0 text-[#087de0]" />Engenheiro de Agronegócios — UFF</li>
              </ul>
              <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4 text-sm font-semibold sm:text-base">
                <a href="https://www.linkedin.com/in/engeduardomesquita/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#0877d4] transition hover:text-[#055a9d] hover:underline">
                  <Linkedin aria-hidden="true" className="h-5 w-5" /> LinkedIn
                </a>
                <a href="tel:+5521983199660" className="inline-flex items-center gap-2 text-[#0877d4] transition hover:text-[#055a9d] hover:underline">
                  <Phone aria-hidden="true" className="h-5 w-5" /> (21) 98319-9660
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CONVITE FINAL */}
        <section className="relative isolate overflow-hidden bg-[#062b53] px-5 py-16 text-white sm:px-8 lg:py-20" aria-labelledby="cta-titulo">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-20 h-96 w-96 rounded-full border-[80px] border-[#0c75bc]/20" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-56 left-[-7%] h-[420px] w-[420px] rounded-full bg-[#0d90e8]/10 blur-3xl" />
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Conheça sua empresa com outros olhos</p>
            <h2 id="cta-titulo" className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Comece pelo que seu negócio já faz.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              Um projeto aberto para ajudar quem empreende a organizar informações, reconhecer limites e fazer perguntas melhores sobre o futuro do negócio.
            </p>
            <Link href="/diagnostico" className="mt-8 inline-flex min-h-[52px] items-center justify-center gap-3 rounded-xl bg-[#078cf4] px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#027fe4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Começar o diagnóstico <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Link>
            <p className="mt-5 text-sm text-slate-300">Sem cadastro. A reunião com o consultor requer sua própria chave de API.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
