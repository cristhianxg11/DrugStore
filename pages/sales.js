import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import Layout from "../components/Layout"

export default function Sales() {
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [sales, setSales] = useState([])

  const fetchData = async () => {
    const bId = localStorage.getItem("business_id")

    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", bId)

    const { data: salesData } = await supabase
      .from("sales")
      .select("*")
      .eq("business_id", bId)

    setProducts(productsData || [])
    setSales(salesData || [])
  }

  const addSale = async () => {
    const bId = localStorage.getItem("business_id")

    await supabase.from("sales").insert([
      {
        product_id: productId,
        quantity: parseInt(quantity),
        business_id: bId,
      },
    ])

    setQuantity("")
    fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Layout>
      <h1>Ventas</h1>

      <select onChange={(e) => setProductId(e.target.value)}>
        <option value="">Seleccionar producto</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        placeholder="Cantidad"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        style={{ marginLeft: 10 }}
      />

      <button onClick={addSale} style={{ marginLeft: 10 }}>
        Registrar venta
      </button>

      <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td>{s.product_id}</td>
              <td>{s.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  )
}

