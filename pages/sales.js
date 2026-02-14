import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import Layout from "../components/Layout"

export default function Sales() {
  const [sales, setSales] = useState([])
  const [customer, setCustomer] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(true)

  // Obtener ventas
  const fetchSales = async () => {
    const bId = localStorage.getItem("business_id")
    if (!bId) {
      console.error("No business_id")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .eq("business_id", bId)

    if (error) {
      console.error("Error al obtener ventas:", error)
    } else {
      setSales(data)
    }
    setLoading(false)
  }

  // Agregar venta
  const addSale = async () => {
    const bId = localStorage.getItem("business_id")
    if (!bId) {
      alert("No se encontró negocio asociado")
      return
    }

    const { data, error } = await supabase
      .from("sales")
      .insert([
        {
          customer,
          amount: parseFloat(amount),
          business_id: bId,
        },
      ])
      .select()

    if (error) {
      console.error("Error al agregar venta:", error)
      alert("Error al agregar venta: " + error.message)
      return
    }

    setCustomer("")
    setAmount("")
    fetchSales()
  }

  // Eliminar venta
  const deleteSale = async (id) => {
    if (!confirm("¿Desea eliminar esta venta?")) return

    const { error } = await supabase.from("sales").delete().eq("id", id)
    if (error) {
      console.error("Error al eliminar venta:", error)
      alert("Error al eliminar venta")
      return
    }

    fetchSales()
  }

  // Modificar venta
  const updateSale = async (id, newCustomer, newAmount) => {
    const { error } = await supabase
      .from("sales")
      .update({ customer: newCustomer, amount: parseFloat(newAmount) })
      .eq("id", id)
    if (error) {
      console.error("Error al modificar venta:", error)
      alert("Error al modificar venta")
      return
    }

    fetchSales()
  }

  // Cerrar sesión
  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("business_id")
    window.location.href = "/"
  }

  useEffect(() => {
    fetchSales()
  }, [])

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Ventas</h1>
        <button onClick={logout} style={{ padding: "8px 16px", background: "#f44336", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Cerrar sesión
        </button>
      </div>

      {/* Formulario agregar venta */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Cliente"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", flex: 1 }}
        />
        <input
          placeholder="Monto"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc", width: 120 }}
        />
        <button
          onClick={addSale}
          style={{ padding: "8px 16px", background: "#1976d2", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Agregar
        </button>
      </div>

      {/* Tabla de ventas */}
      {loading ? (
        <p>Cargando ventas...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1976d2", color: "white" }}>
              <th style={{ padding: 12 }}>Cliente</th>
              <th style={{ padding: 12 }}>Monto</th>
              <th style={{ padding: 12 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={{ padding: 12 }}>{s.customer}</td>
                <td style={{ padding: 12 }}>${s.amount}</td>
                <td style={{ padding: 12, display: "flex", gap: 10 }}>
                  <button
                    onClick={() => {
                      const newCustomer = prompt("Nuevo cliente:", s.customer)
                      const newAmount = prompt("Nuevo monto:", s.amount)
                      if (newCustomer && newAmount) updateSale(s.id, newCustomer, newAmount)
                    }}
                    style={{ padding: "6px 12px", background: "#4caf50", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                  >
                    Modificar
                  </button>
                  <button
                    onClick={() => deleteSale(s.id)}
                    style={{ padding: "6px 12px", background: "#f44336", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  )
}
