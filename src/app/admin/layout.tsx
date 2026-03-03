// Layout raiz do /admin — sem auth check.
// A proteção é feita pelo middleware (getToken) e pelo layout de (protected).
// A página /admin/login precisa ficar fora do layout protegido para evitar redirect loop.

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
