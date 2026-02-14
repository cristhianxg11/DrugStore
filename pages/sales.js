import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import Layout from "../components/Layout"

export default function Sales() {
  const [bId, setBId] = useState(null)
  const [clients, setClients] = useState([])
  const [clientName, setClientName] = useState("")
  const [selectedClient, setSelectedClient] = useState(null)
  const [productsList, setProductsList] = useState([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [saleItems, setSaleItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // --- Obtener business_id ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const businessId = localStorage.getItem("business_id")
      setBId(businessId)
    }
  }, [])

  // --- Cerrar sesión ---
  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("business_id")
    window.location.href = "/"
  }

  // --- Cargar clientes y productos ---
  useEffect(() => {
    if (!bId) return
    const fetchData = async () => {
      try {
        const { data: clientsData } = await supabase.from("clients").select("*").eq("business_id", bId)
        setClients(clientsData || [])

        const { data: productsData } = await supabase.from("products").select("*").eq("business_id", bId)
        setProductsList(productsData || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [bId])

  // --- Calcular total ---
  useEffect(() => {
    setTotal(saleItems.reduce((acc, item) => acc + item.price * item.quantity, 0))
  }, [saleItems])

  // --- Clientes ---
  const addClient = async () => {
    if (!clientName) return alert("Ingrese el nombre del cliente")
    const { data, error } = await supabase
      .from("clients")
      .insert([{ name: clientName, business_id: bId }])
      .select()
      .single()
    if (error) return alert("Error al agregar cliente: " + error.message)
    setClients([...clients, data])
    setClientName("")
  }

  const updateClient = async (client) => {
    const newName = prompt("Nuevo nombre del cliente:", client.name)
    if (!newName) return
    const { data, error } = await supabase
      .from("clients")
      .update({ name: newName })
      .eq("id", client.id)
      .select()
      .single()
    if (error) return alert("Error al modificar cliente: " + error.message)
    setClients(clients.map(c => c.id === client.id ? data : c))
  }

  const deleteClient = async (client) => {
    if (!confirm(`Eliminar cliente ${client.name}?`)) return
    const { error } = await supabase.from("clients").delete().eq("id", client.id)
    if (error) return alert("Error al eliminar cliente: " + error.message)
    setClients(clients.filter(c => c.id !== client.id))
    if (selectedClient?.id === client.id) setSelectedClient(null)
  }

  // --- Productos ---
  const addProductToSale = () => {
    if (!selectedProduct) return alert("Seleccione un producto")
    const product = productsList.find(p => p.id === selectedProduct)
    if (!product) return
    if (quantity > product.stock) return alert("No hay suficiente stock")
    setSaleItems([...saleItems, { ...product, quantity }])
    setSelectedProduct("")
    setQuantity(1)
  }

  const removeSaleItem = (index) => {
    const items = [...saleItems]
    items.splice(index, 1)
    setSaleItems(items)
  }

  const saveSale = async () => {
    if (!selectedClient) return alert("Seleccione un cliente")
    if (saleItems.length === 0) return alert("Agregue productos a la venta")

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert([{ client_id: selectedClient.id, business_id: bId, total }])
      .select()
      .single()
    if (saleError) return alert("Error al guardar venta: " + saleError.message)

    for (const item of saleItems) {
      await supabase.from("sale_items").insert([
        { sale_id: sale.id, product_id: item.id, quantity: item.quantity, price: item.price }
      ])
      await supabase.from("products").update({ stock: item.stock - item.quantity }).eq("id", item.id)
    }

    alert("Venta guardada correctamente")
    setSelectedClient(null)
    setSaleItems([])
    setTotal(0)

    const { data: productsData } = await supabase.from("products").select("*").eq("business_id", bId)
    setProductsList(productsData)
  }

  if (loading) return <Layout><p>Cargando...</p></Layout>
  if (!bId) return <Layout><p>No se encontró negocio asociado</p></Layout>

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 style={{ marginBottom: 0 }}>Ventas</h1>
        <button
          onClick={logout}
          style={{ padding: "8px 16px", background: "#f44336", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <SummaryCard title="Clientes" value={clients.length} color="#1976d2" />
        <SummaryCard title="Productos" value={productsList.length} color="#4caf50" />
        <SummaryCard title="Total Venta" value={`$${total}`} color="#ff9800" />
      </div>

      {/* Clientes */}
      <div style={{ marginBottom: 30 }}>
        <input
          placeholder="Nuevo cliente"
          value={clientName}
          onChange={e => setClientName(e.target.value)}
        />
        <button onClick={addClient} style={{ marginLeft: 10, padding: "5px 10px" }}>Agregar</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 30 }}>
        {clients.map(client => (
          <div key={client.id} style={{
            padding: 10, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            background: selectedClient?.id === client.id ? "#e3f2fd" : "white",
            display: "flex", justifyContent: "space-between", alignItems: "center", minWidth: 150
          }}>
            <span onClick={() => setSelectedClient(client)} style={{ cursor: "pointer" }}>
              {client.name}
            </span>
            <div>
              <button onClick={() => updateClient(client)} style={{ marginRight: 5 }}>✏️</button>
              <button onClick={() => deleteClient(client)} style={{ color: "red" }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {selectedClient && (
        <div>
          <h3>Cliente seleccionado: {selectedClient.name}</h3>

          {/* Selección de productos */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
              <option value="">Seleccione un producto</option>
              {productsList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.price} (Stock: {p.stock})
                </option>
              ))}
            </select>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} style={{ width: 60 }} />
            <button onClick={addProductToSale} style={{ padding: "5px 10px" }}>Agregar</button>
          </div>

          {/* Lista de productos */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc" }}>Producto</th>
                <th style={{ borderBottom: "1px solid #ccc" }}>Precio</th>
                <th style={{ borderBottom: "1px solid #ccc" }}>Cantidad</th>
                <th style={{ borderBottom: "1px solid #ccc" }}>Subtotal</th>
                <th style={{ borderBottom: "1px solid #ccc" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {saleItems.map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td>${item.price}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price * item.quantity}</td>
                  <td><button onClick={() => removeSaleItem(i)} style={{ color: "red" }}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Total Venta: ${total}</h3>
          <button onClick={saveSale} style={{ padding: "8px 16px" }}>Guardar Venta</button>
        </div>
      )}
    </Layout>
  )
}

// --- Componente resumen ---
function SummaryCard({ title, value, color }) {
  return (
    <div style={{
      flex: 1, padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      background: "white", textAlign: "center"
    }}>
      <h3 style={{ color, marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 24, fontWeight: "bold" }}>{value}</p>
    </div>
  )
}
