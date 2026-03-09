export const metadata = {
  title: 'Fale Conosco | Loja Digital',
  description: 'Tem dúvidas ou sugestões? Entre em contato agora.',
}

export default function ContatoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Fale Conosco</h1>
      
      <div className="prose prose-pink max-w-none text-gray-600 space-y-6">
        <p>
          Nosso objetivo é sempre entregar a melhor experiência e conteúdo de excelência. Caso você não consiga baixar um material, enfrente erro em pagamentos, ou apenas queira dar um feedback construtivo, nossa equipe de suporte está de braços abertos para ouvi-lo.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Informações de E-mail Responsivo</h2>
        <p>
          A melhor forma de lidar com solicitações de downloads corrompidos, licenças ou reembolso de materiais duplicados no carrinho é através do nosso e-mail oficial (tempo médio de resposta de até 48h úteis).
          <br /><br />
          E-mail: <strong>suporte@{process.env.NEXT_PUBLIC_STORE_NAME?.replace(/\s+/g, '').toLowerCase() || 'lojadigital'}.com</strong>
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Parcerias e Produções</h2>
        <p>
          Para contato colaborativo, convites a podcasts, parcerias publicitárias, resenhas de materiais ou contato direto de imprensa/criadores, envie-nos um briefing claro sob a flag de assunto [PARCERIA].
        </p>
      </div>
    </div>
  )
}
