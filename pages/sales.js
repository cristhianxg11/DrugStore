import { useEffect, useState, useRef } from "react"
import { supabase } from "../lib/supabaseClient"
import Layout from "../components/Layout"

export default function Sales() {
  const [sales, setSales] = useState([])
  const [customer, setCustomer] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const chartCustomerRef = useRef(null)
  const chartTotalRef = useRef(null)

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
      .order("created_at", { ascending: true })

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

    if (!customer || !amount) {
      alert("Ingrese cliente y monto")
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

  // Dibujar gráficos con Chart.js
  const drawCharts = () => {
    if (!sales.length) return

    // Ventas por cliente
    const salesByCustomer = {}
    sales.forEach((s) => {
      if (!salesByCustomer[s.customer]) salesByCustomer[s.customer] = 0
      salesByCustomer[s.customer] += s.amount
    })

    const customerLabels = Object.keys(salesByCustomer)
    const customerData = Object.values(salesByCustomer)

    if (chartCustomerRef.current) {
      new window.Chart(chartCustomerRef.current, {
        type: "bar",
        data: {
          labels: customerLabels,
          datasets: [
            {
              label: "Ventas por cliente",
              data: customerData,
              backgroundColor: "#1976d2",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
        },
      })
    }

    // Ventas totales por día
    const salesByDate = {}
    sales.forEach((s) => {
      const date = new Date(s.created_at).toLocaleDateString()
      if (!salesByDate[date]) salesByDate[date] = 0
      salesByDate[date] += s.amount
    })

    const dateLabels = Object.keys(salesByDate)
    const dateData = Object.values(salesByDate)

    if (chartTotalRef.current) {
      new window.Chart(chartTotalRef.current, {
        type: "line",
        data: {
          labels: dateLabels,
          datasets: [
            {
              label: "Ventas totales",
              data: dateData,
              borderColor: "#4caf50",
              backgroundColor: "rgba(76,175,80,0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: { responsive: true },
      })
    }
  }

  useEffect(() => {
    fetchSales()
  }, [])

  useEffect(() => {
    // Cargar Chart.js desde CDN si no existe
    if (!window.Chart) {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/chart.js"
      script.onload = drawCharts
      document.body.appendChild(script)
    } else {
      drawCharts()
    }
  }, [sales])

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

      {/* Gráficos */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300, background: "white", padding: 20, borderRadius: 8 }}>
          <canvas ref={chartCustomerRef}></canvas>
        </div>
        <div style={{ flex: 1, minWidth: 300, background: "white", padding: 20, borderRadius: 8 }}>
          <canvas ref={chartTotalRef}></canvas>
        </div>
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
