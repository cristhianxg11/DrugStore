import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from "../components/Layout"
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [productsCount, setProductsCount] = useState(0)
  const [todaySales, setTodaySales] = useState(0)
  const [monthSales, setMonthSales] = useState(0)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/')
    } else {
      setUser(user)
      loadKPIs(user.id)
    }
  }

  const loadKPIs = async (userId) => {
    // Productos
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    setProductsCount(count || 0)

    // Ventas hoy
    const today = new Date().toISOString().split('T')[0]

    const { data: todayData } = await supabase
      .from('sales')
      .select('total')
      .eq('user_id', userId)
      .gte('created_at', today)

    const totalToday = todayData?.reduce((acc, s) => acc + s.total, 0) || 0
    setTodaySales(totalToday)

    // Ventas del mes
    const firstDayMonth = new Date()
    firstDayMonth.setDate(1)
    const monthStart = firstDayMonth.toISOString()

    const { data: monthData } = await supabase
      .from('sales')
      .select('total')
      .eq('user_id', userId)
      .gte('created_at', monthStart)

    const totalMonth = monthData?.reduce((acc, s) => acc + s.total, 0) || 0
    setMonthSales(totalMonth)
  }

  if (!user) return null

  return (
    <Layout>
      <h1 style={{ marginBottom: 30 }}>Dashboard</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px"
      }}>

        <Card title="Ventas Hoy" value={`$ ${todaySales}`} />
        <Card title="Ventas del Mes" value={`$ ${monthSales}`} />
        <Card title="Productos Activos" value={productsCount} />

      </div>
    </Layout>
  )
}

function Card({ title, value }) {
  return (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
    }}>
      <h3>{title}</h3>
      <p style={{
        fontSize: "28px",
        fontWeight: "bold",
        marginTop: "10px"
      }}>{value}</p>
    </div>
  )
}

