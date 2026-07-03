import { Layout } from "@/components/Layout";

export function PrivacidadePage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
          🔒
        </div>
        <h1 className="mb-4 text-3xl font-bold text-slate-900">Privacidade</h1>
        <p className="mb-6 text-base leading-7 text-slate-600">
          Nós respeitamos seus dados e usamos informações apenas para melhorar
          sua experiência no CampuShop.
        </p>
        <div className="space-y-6 text-slate-700">
          <div>
            <p className="font-semibold">Quais dados coletamos?</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Coletamos informações de cadastro, dados de contato, detalhes dos
              seus anúncios e comunicações com outros usuários para oferecer um
              serviço seguro e personalizado.
            </p>
          </div>
          <div>
            <p className="font-semibold">Como usamos seus dados?</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Usamos suas informações para validar anúncios, facilitar
              negociações, enviar notificações e melhorar a segurança da
              plataforma. Também usamos dados de uso para melhorar o aplicativo.
            </p>
          </div>
          <div>
            <p className="font-semibold">Com quem compartilhamos?</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Não vendemos seus dados para terceiros. Podemos compartilhar
              informações com provedores de hospedagem ou com autoridades quando
              exigido por lei.
            </p>
          </div>
          <div>
            <p className="font-semibold">Seus direitos</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Você pode atualizar seus dados, solicitar exclusão de conta e
              revisar suas informações a qualquer momento pelo seu perfil.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
