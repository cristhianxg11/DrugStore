import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import Layout from "../components/Layout"

export default function Products() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")

  const fetchProducts = async () => {
    const bId = localStorage.getItem("business_id")

    if (!bId) {
      console.error("No business_id")
      return
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", bId)

    if (error) {
      console.error("Error al traer productos:", error)
    } else {
      setProducts(data || [])
    }
  }

  const addProduct = async () => {
    const bId = localStorage.getItem("business_id")

    if (!bId) {
      alert("No se encontró negocio asociado")
      return
    }

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          price: parseFloat(price),
          stock: parseInt(stock),
          business_id: bId,
        },
      ])
      .select()

    if (error) {
      console.error("Error al agregar producto:", error)
      alert("Error al agregar producto")
      return
    }

    console.log("Producto insertado:", data)

    setName("")
    setPrice("")
    setStock("")
    fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <Layout>
      <h1>Productos</h1>

      <input
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Precio"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={{ marginLeft: 10 }}
      />

      <input
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        style={{ marginLeft: 10 }}
      />

      <button onClick={addProduct} style={{ marginLeft: 10 }}>
        Agregar
      </button>

      <table border="1" cellPadding="10" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  )
}



