import { Layout } from '@/components/Layout'
import { PlanBadge } from '@/components/PlanBadge'
import { subscriptionAPI } from '@/lib/api-service'
import { useAuthStore } from '@/store'
import { CheckCircle2, Globe, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const plans = [
  {
    title: 'Essencial',
    badge: 'ESSENCIAL',
    description: 'O plano básico para vender no campus com todas as funcionalidades essenciais.',
    price: 'Grátis',
    features: [
      'Até 10 anúncios ativos',
      'Chat interno com compradores',
      'Upload de até 7 fotos por anúncio',
      'Respostas em até 24 horas',
      'Visibilidade natural nos resultados',
    ],
    badgeColor: '#8E8E8E',
    badgeIcon: 'shield',
  },
  {
    title: 'Plus',
    badge: 'PLUS',
    description: 'Ideal para quem quer vender mais rápido com mais alcance e métricas de desempenho.',
    price: 'R$ 9,90 / mês',
    features: [
      'Tudo do Essencial',
      'Até 50 anúncios ativos',
      'Destaque nos resultados de busca',
      'Relatórios de vendas e avaliações',
      'Prioridade no suporte',
    ],
    badgeColor: '#1E88E5',
    badgeIcon: 'sparkle',
  },
  {
    title: 'Premium',
    badge: 'PREMIUM',
    description: 'A experiência completa com anúncios ilimitados, impulsionamento e selo de destaque.',
    price: 'R$ 19,90 / mês',
    features: [
      'Tudo do Plus',
      'Anúncios ilimitados',
      'Impulsionamento de produto',
      'Selo Premium e destaque visual',
      'Painel financeiro e insights de crescimento',
    ],
    badgeColor: '#DAA520',
    badgeIcon: 'diamond',
  },
]

const highlightFeatures = [
  'Impulsionamento automático para anúncios Premium.',
  'Produtos aparecem no topo de categorias e resultados relevantes.',
  'Maior alcance entre estudantes do campus.',
  'Aumento da visibilidade para quem busca com urgência.',
]

export function PlanosPage() {
  const { usuario } = useAuthStore()
  const [planoAtual, setPlanoAtual] = useState<'ESSENTIAL' | 'PLUS' | 'PREMIUM' | null>(null)

  useEffect(() => {
    const carregarPlano = async () => {
      if (!usuario) {
        setPlanoAtual(null)
        return
      }
      try {
        const response = await subscriptionAPI.current()
        setPlanoAtual(response.data?.plan ?? null)
      } catch {
        setPlanoAtual(null)
      }
    }

    carregarPlano()
  }, [usuario])

  const planoBadgeAtual = planoAtual === 'ESSENTIAL' ? 'ESSENCIAL' : planoAtual

  return (
    <Layout>
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-sm shadow-slate-200/40 backdrop-blur sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">
                Escolha o plano certo
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Planos CampuShop para vender com mais alcance.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Compare o Essencial, Plus e Premium para encontrar o plano que cabe no seu ritmo de venda no campus. Cada opção é pensada para aumentar a visibilidade, facilitar a venda e deixar sua loja estudantil ainda mais competitiva.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-center lg:gap-4">
              <Link
                to="/conta"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Ver meu plano
              </Link>
              <a
                href="/ajuda"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Precisa de ajuda?
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.title} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
              <div className="border-b border-slate-200 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">{plan.title}</h2>
                    <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                  </div>
                  <PlanBadge text={plan.badge} color={plan.badgeColor} icon={plan.badgeIcon} />
                </div>
                <p className="mt-6 text-3xl font-black tracking-tight text-slate-900">{plan.price}</p>
              </div>

              <div className="space-y-4 p-6">
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className="mt-1 text-slate-400">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                      <p className="text-sm leading-6 text-slate-700">{feature}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <Link
                    to={usuario ? '/conta' : '/cadastro'}
                    className={`inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-white transition ${planoBadgeAtual === plan.badge ? 'cursor-not-allowed bg-slate-400 hover:bg-slate-400' : 'bg-slate-900 hover:bg-slate-800'}`}
                    aria-disabled={planoBadgeAtual === plan.badge}
                  >
                    {planoBadgeAtual === plan.badge ? 'Adquirido' : 'Adquirir Plano'}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-sm shadow-slate-950/10 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_0.9fr] lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
                Impulsionamento Premium
              </span>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">Mais visibilidade para seus anúncios Premium.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                O impulsionamento é um recurso exclusivo do plano Premium que coloca seus produtos em posições de destaque, alcançando mais estudantes e aumentando as chances de venda rápida.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {highlightFeatures.map((item) => (
                  <div key={item} className="rounded-3xl border border-slate-700/70 bg-slate-900/80 p-4 text-sm leading-6 text-slate-300">
                    <div className="flex items-center gap-3 font-semibold text-white">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-slate-700/80 bg-slate-900/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.35)]">
              <div className="flex items-center gap-3 text-emerald-400">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">Visibilidade estendida</span>
              </div>
              <p className="mt-5 text-lg font-semibold text-white">Impulsione seus produtos para o público certo</p>
              <ul className="mt-6 space-y-4 text-slate-300">
                <li className="flex gap-3">
                  <span className="mt-1 text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <span>Mais exposição em destaque dentro das categorias.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 text-emerald-400">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span>Maior chance de receber mensagens e ofertas rápidas.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span>Perfeito para produtos que precisam ser vendidos em curto prazo.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}
