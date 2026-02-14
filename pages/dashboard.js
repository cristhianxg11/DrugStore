import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import Layout from "../components/Layout"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from "recharts"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [totalStock, setTotalStock] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [productsData, setProductsData] = useState([])
  const [salesData, setSalesData] = useState([])

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
        if (productsError) console.error("Error productos:", productsError)

        // Ventas
        const { data: sales, error: salesError } = await supabase
          .from("sales")
          .select("*")
          .eq("business_id", bId)
        if (salesError) console.error("Error ventas:", salesError)

        setTotalProducts(products?.length || 0)
        setTotalSales(sales?.length || 0)
        setTotalStock(products?.reduce((acc, p) => acc + p.stock, 0) || 0)
        setTotalRevenue(sales?.reduce((acc, s) => acc + s.price, 0) || 0)

        setProductsData(products || [])
        setSalesData(sales || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Datos para gráficos
  const barChartData = [
    { name: "Productos", cantidad: totalProducts },
    { name: "Ventas", cantidad: totalSales }
  ]

  const stockPieData = productsData.map(p => ({ name: p.name, value: p.stock }))
  const COLORS = ["#1976d2", "#4caf50", "#ff9800", "#f44336", "#9c27b0", "#00bcd4"]

  // Ventas por fecha
  const salesByDate = {}
  salesData.forEach(s => {
    const date = new Date(s.created_at).toLocaleDateString()
    if (!salesByDate[date]) salesByDate[date] = 0
    salesByDate[date] += s.price
  })
  const lineChartData = Object.entries(salesByDate).map(([date, total]) => ({ date, total }))

  return (
    <Layout>
      <h1 style={{ marginBottom: 20 }}>Dashboard Avanzado</h1>

      {loading ? <p>Cargando datos...</p> : (
        <>
          {/* Tarjetas resumen */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 40 }}>
            <Card title="Productos" value={totalProducts} color="#1976d2" />
            <Card title="Ventas" value={totalSales} color="#4caf50" />
            <Card title="Stock total" value={totalStock} color="#ff9800" />
            <Card title="Ingresos" value={`$${totalRevenue}`} color="#f44336" />
          </div>

          {/* Gráfico de barras */}
          <Section title="Productos vs Ventas">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          {/* Gráfico de líneas */}
          <Section title="Ingresos por fecha">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#1976d2" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Section>

          {/* Gráfico de pastel */}
          <Section title="Distribución de stock por producto">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stockPieData} dataKey="value" nameKey="name" outerRadius={100} fill="#8884d8" label>
                  {stockPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Section>
        </>
      )}
    </Layout>
  )
}

// Componente Tarjeta
function Card({ title, value, color }) {
  return (
    <div style={{
      flex: "1 1 200px",
      background: "white",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      textAlign: "center"
    }}>
      <h3 style={{ marginBottom: 10, color }}>{title}</h3>
      <p style={{ fontSize: 28, fontWeight: "bold" }}>{value}</p>
    </div>
  )
}

// Componente sección de gráfico
function Section({ title, children }) {
  return (
    <div style={{
      background: "white",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      marginBottom: 40
    }}>
      <h3 style={{ marginBottom: 20, color: "#1976d2" }}>{title}</h3>
      {children}
    </div>
  )
}
