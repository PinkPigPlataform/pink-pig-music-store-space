export const metadata = {
  title: 'Política de Privacidade | Loja Digital',
  description: 'Como protegemos e tratamos os seus dados pessoais.',
}

export default function PrivacidadePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
      
      <div className="prose prose-pink max-w-none text-gray-600 space-y-6">
        <p>
          O seu direito à privacidade é uma prioridade para a nossa empresa. Esta Política de Privacidade serve para esclarecer de que forma recolhemos, utilizamos, partilhamos e protegemos as suas informações pessoais.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Que dados nós recolhemos?</h2>
        <p>
          Recolhemos dados essenciais para o processamento de compras online:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Nome completo</li>
            <li>Endereço de e-mail (para enviar o recibo e o material digital)</li>
            <li>Informações de processamento no Stripe (nós nunca vemos seu cartão de crédito completo)</li>
          </ul>
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Como usamos os seus dados?</h2>
        <p>
          Os dados são exclusivamente utilizados com as seguintes finalidades:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Processar transações e enviar as instruções de produtos correspondentes</li>
            <li>Enviar notificações da conta e atualizações importantes de segurança</li>
            <li>(Opcional) Comunicar lançamentos de novos materiais caso preste consentimento prévio na compra.</li>
          </ul>
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Partilha com Terceiros</h2>
        <p>
          A nossa plataforma não comercializa quaisquer dados com empresas terceiras de publicidade ou telemarketing. Os seus dados são transmitidos unicamente ao processador de pagamentos escolhido pela plataforma (ex: Stripe) e sistemas de envio de e-mails de confirmação (ex: Resend). Todos certificados por práticas mundiais de segurança de dados.
        </p>

        <p className="mt-8 text-sm text-gray-500">
          Última atualização: Março de 2026
        </p>
      </div>
    </div>
  )
}
