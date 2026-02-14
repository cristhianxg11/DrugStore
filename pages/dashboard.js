import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import Layout from "../components/Layout"

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bId = localStorage.getItem("business_id")
        if (!bId) {
          console.error("No existe business_id")
          setLoading(false)
          return
        }

        // Contar productos
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id")
          .eq("business_id", bId)
        if (productsError) console.error("Error al obtener productos:", productsError)

        // Contar ventas
        const { data: sales, error: salesError } = await supabase
          .from("sales")
          .select("id")
          .eq("business_id", bId)
        if (salesError) console.error("Error al obtener ventas:", salesError)

        setTotalProducts(products?.length || 0)
        setTotalSales(sales?.length || 0)
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
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          {/* Tarjeta Productos */}
          <div
            style={{
              flex: "1 1 200px",
              background: "white",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 10, color: "#1976d2" }}>Productos</h3>
            <p style={{ fontSize: 28, fontWeight: "bold" }}>{totalProducts}</p>
          </div>

          {/* Tarjeta Ventas */}
          <div
            style={{
              flex: "1 1 200px",
              background: "white",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 10, color: "#1976d2" }}>Ventas</h3>
            <p style={{ fontSize: 28, fontWeight: "bold" }}>{totalSales}</p>
          </div>
        </div>
      )}
    </Layout>
  )
}
