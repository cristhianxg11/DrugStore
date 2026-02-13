export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      
      {/* Sidebar */}
      <aside style={{
        width: "220px",
        background: "#111827",
        color: "white",
        padding: "20px"
      }}>
        <h2 style={{ marginBottom: "30px" }}>Mi Negocio</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <a href="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</a>
          <a href="/products" style={{ color: "white", textDecoration: "none" }}>Productos</a>
          <a href="/sales" style={{ color: "white", textDecoration: "none" }}>Ventas</a>
          <a href="/settings" style={{ color: "white", textDecoration: "none" }}>Configuración</a>
        </nav>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: "30px" }}>
        {children}
      </main>

    </div>
  );
}
