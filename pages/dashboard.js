import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import Layout from "../components/Layout"

export default function Dashboard() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
          if (!data.user) {
            router.push("/")
          } 
        const { data: membership } = await supabase
          .from("business_members")
          .select("business_id")
          .eq("user_id", user.id)
          .single()
        
        const bId = membership.business_id
        
        }

        // Productos
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id")
          .eq("business_id", bId)

        if (productsError) {
          console.error("Error cargando productos:", productsError.message)
        }
      
        const handleLogout = async () => {
          await supabase.auth.signOut()
          router.push("/")
        }

        // Ventas
        const { data: sales, error: salesError } = await supabase
          .from("sales")
          .select("id")
          .eq("business_id", bId)

        if (salesError) {
          console.error("Error cargando ventas:", salesError.message)
        }

        setTotalProducts(products?.length || 0)
        setTotalSales(sales?.length || 0)

      } catch (err) {
        console.error("Error general:", err)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  return (
    <Layout>
      <h1>Dashboard</h1>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ 
            background: "#1f2937", 
            color: "white",
            padding: 20, 
            borderRadius: 12,
            minwidth: 150 }}>
            <h3>Productos</h3>
            <p>{totalProducts}</p>
          </div>

          <div style={{ background: "white", padding: 20, borderRadius: 8 }}>
            <h3>Ventas</h3>
            <p>{totalSales}</p>
          </div>
        </div>
      )}
    </Layout>
  )
}


