export default function StoreFooter() {
  const year = new Date().getFullYear()
  const name = process.env.NEXT_PUBLIC_STORE_NAME || 'Loja Digital'

  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          © {year} {name}. Todos os direitos reservados.
        </p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:text-white transition-colors">Termos</a>
          <a href="#" className="hover:text-white transition-colors">Privacidade</a>
          <a href="#" className="hover:text-white transition-colors">Contato</a>
        </div>
      </div>
    </footer>
  )
}
