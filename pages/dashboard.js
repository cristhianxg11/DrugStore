import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import Layout from "../components/Layout"

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalSales, setTotalSales] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const bId = localStorage.getItem("business_id")

      const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", bId)

      const { data: sales } = await supabase
        .from("sales")
        .select("*")
        .eq("business_id", bId)

      setTotalProducts(products?.length || 0)
      setTotalSales(sales?.length || 0)
    }

    fetchData()
  }, [])

  return (
    <Layout>
      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ background: "white", padding: 20, borderRadius: 8 }}>
          <h3>Productos</h3>
          <p>{totalProducts}</p>
        </div>

        <div style={{ background: "white", padding: 20, borderRadius: 8 }}>
          <h3>Ventas</h3>
          <p>{totalSales}</p>
        </div>
      </div>
    </Layout>
  )
}


