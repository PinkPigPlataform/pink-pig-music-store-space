export const metadata = {
  title: 'Termos de Serviço | Loja Digital',
  description: 'Termos de Serviço e condições de uso da plataforma.',
}

export default function TermosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Termos de Serviço</h1>
      
      <div className="prose prose-pink max-w-none text-gray-600 space-y-6">
        <p>
          Bem-vindo à nossa loja digital. Ao acessar e utilizar este site, você concorda em cumprir os nossos Termos de Serviço. Leia atentamente as condições abaixo antes de realizar qualquer compra.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Produtos Digitais</h2>
        <p>
          Comercializamos produtos estritamente digitais (ex: E-books, PDFs, Arquivos de Áudio, etc). A entrega de todos os produtos é feita de forma eletrônica, diretamente por download, imediatamente após a confirmação do pagamento.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Pagamento e Segurança</h2>
        <p>
          Os pagamentos são processados de forma segura através do Stripe. Não armazenamos os dados do seu cartão de crédito em nosos servidores. Todos os dados confidenciais são encriptados de ponta a ponta pelo gateway de pagamento.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Política de Reembolso</h2>
        <p>
          Devido à natureza dos produtos digitais (os quais podem ser baixados e copiados logo após a compra), não oferecemos reembolso padrão após a liberação do arquivo para download. Caso haja indisponibilidade, falha técnica comprovada no arquivo enviado ou duplicação de pagamento sistêmica, avaliaremos o estorno pontualmente.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Propriedade Intelectual</h2>
        <p>
          A compra dos nossos materiais concede a você uma licença de uso individual e intransferível. É expressamente proibida a revenda, reprodução em massa, distribuição em sites de compartilhamento e plagio direto do material disponibilizado.
        </p>

        <p className="mt-8 text-sm text-gray-500">
          Última atualização: Março de 2026
        </p>
      </div>
    </div>
  )
}
