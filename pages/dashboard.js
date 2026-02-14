import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import Layout from "../components/Layout"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [loading, setLoading] = useState(true)

  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bId = localStorage.getItem("business_id")
        if (!bId) {
          console.error("No existe business_id")
          setLoading(false)
          return
        }

        // Productos
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("business_id", bId)
        if (productsError) console.error("Error al obtener productos:", productsError)

        // Ventas
        const { data: sales, error: salesError } = await supabase
          .from("sales")
          .select("*")
          .eq("business_id", bId)
        if (salesError) console.error("Error al obtener ventas:", salesError)

        const totalProductsCount = products?.length || 0
        const totalSalesCount = sales?.length || 0

        setTotalProducts(totalProductsCount)
        setTotalSales(totalSalesCount)

        // Datos para gráfico
        setChartData([
          { name: "Productos", cantidad: totalProductsCount },
          { name: "Ventas", cantidad: totalSalesCount },
        ])
      } catch (err) {
        console.error("Error general:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <Layout>
      <h1 style={{ marginBottom: 20 }}>Dashboard</h1>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <>
          {/* Tarjetas de métricas */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 40 }}>
            <div
              style={{
                flex: "1 1 200px",
                background: "white",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <h3 style={{ marginBottom: 10, color: "#1976d2" }}>Productos</h3>
              <p style={{ fontSize: 28, fontWeight: "bold" }}>{totalProducts}</p>
            </div>

            <div
              style={{
                flex: "1 1 200px",
                background: "white",
                padding: 20,
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <h3 style={{ marginBottom: 10, color: "#1976d2" }}>Ventas</h3>
              <p style={{ fontSize: 28, fontWeight: "bold" }}>{totalSales}</p>
            </div>
          </div>

          {/* Gráfico de barras */}
          <div style={{ background: "white", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: 20, color: "#1976d2" }}>Productos vs Ventas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </Layout>
  )
}
