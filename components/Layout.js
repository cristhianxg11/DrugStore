import Link from "next/link"

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          background: "#111827",
          color: "white",
          padding: 20,
        }}
      >
        <h2 style={{ marginBottom: 30 }}>Almacén SaaS</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <Link href="/dashboard" style={{ color: "white", textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link href="/products" style={{ color: "white", textDecoration: "none" }}>
            Productos
          </Link>
          <Link href="/sales" style={{ color: "white", textDecoration: "none" }}>
            Ventas
          </Link>
        </nav>
      </aside>

      <main
        style={{
          flex: 1,
          padding: 40,
          background: "#f3f4f6",
        }}
      >
        {children}
      </main>
    </div>
  )
}
