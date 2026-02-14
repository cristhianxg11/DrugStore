import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/router"
import Layout from "../components/Layout"

export default function Products() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [cost, setCost] = useState("")
  const [editingId, setEditingId] = useState(null)
  const router = useRouter()

  // Obtener productos
  const fetchProducts = async () => {
    const bId = localStorage.getItem("business_id")
    if (!bId) return console.error("No business_id")

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", bId)

    if (error) console.error("Error al obtener productos:", error)
    else setProducts(data)
  }

  // Agregar o modificar producto
  const saveProduct = async () => {
    const bId = localStorage.getItem("business_id")
    if (!bId) return alert("No se encontró negocio asociado")

    if (!name || !price || !stock || !cost) {
      return alert("Completa todos los campos")
    }

    if (editingId) {
      // Modificar producto existente
      const { data, error } = await supabase
        .from("products")
        .update({
          name,
          price: parseFloat(price),
          stock: parseInt(stock),
          cost: parseFloat(cost),
        })
        .eq("id", editingId)
        .eq("business_id", bId)
        .select()

      if (error) {
        console.error("Error al modificar producto:", error)
        return alert("Error al modificar producto: " + error.message)
      }

      setEditingId(null)
    } else {
      // Agregar nuevo producto
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            name,
            price: parseFloat(price),
            stock: parseInt(stock),
            cost: parseFloat(cost),
            business_id: bId,
          },
        ])
        .select()

      if (error) {
        console.error("Error al agregar producto:", error)
        return alert("Error al agregar producto: " + error.message)
      }
    }

    // Limpiar campos
    setName("")
    setPrice("")
    setStock("")
    setCost("")

    fetchProducts()
  }

  // Eliminar producto
  const deleteProduct = async (id) => {
    const bId = localStorage.getItem("business_id")
    if (!bId) return

    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("business_id", bId)

    if (error) {
      console.error("Error al eliminar producto:", error)
      return alert("Error al eliminar producto")
    }

    fetchProducts()
  }

  // Preparar edición
  const editProduct = (product) => {
    setName(product.name)
    setPrice(product.price.toString())
    setStock(product.stock.toString())
    setCost(product.cost.toString())
    setEditingId(product.id)
  }

  // Cerrar sesión
  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("business_id")
    router.push("/")
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <Layout>
      {/* Header con logout */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1>Productos</h1>
        <button
          onClick={logout}
          style={{
            background: "#f44336",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Formulario de producto */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: "1 1 150px", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <input
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ flex: "1 1 100px", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <input
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          style={{ flex: "1 1 100px", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <input
          placeholder="Costo"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          style={{ flex: "1 1 100px", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
        />
        <button
          onClick={saveProduct}
          style={{
            background: editingId ? "#1976d2" : "#4caf50",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
            flex: "1 1 120px"
          }}
        >
          {editingId ? "Guardar cambios" : "Agregar"}
        </button>
      </div>

      {/* Tabla de productos */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1976d2", color: "white" }}>
              <th style={{ padding: 10 }}>Nombre</th>
              <th style={{ padding: 10 }}>Precio</th>
              <th style={{ padding: 10 }}>Stock</th>
              <th style={{ padding: 10 }}>Costo</th>
              <th style={{ padding: 10 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td style={{ padding: 10 }}>{p.name}</td>
                <td style={{ padding: 10 }}>{p.price}</td>
                <td style={{ padding: 10 }}>{p.stock}</td>
                <td style={{ padding: 10 }}>{p.cost}</td>
                <td style={{ padding: 10, display: "flex", gap: 5 }}>
                  <button
                    onClick={() => editProduct(p)}
                    style={{
                      background: "#ff9800",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: 6,
                      cursor: "pointer"
                    }}
                  >
                    Modificar
                  </button>
                  <button
                    onClick={() => deleteProduct(p.id)}
                    style={{
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: 6,
                      cursor: "pointer"
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 10, textAlign: "center" }}>
                  No hay productos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
