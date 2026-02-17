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
  const [recentSales, setRecentSales] = useState([])

  // --- Obtener business_id ---
  useEffect(() => {
    const fetchBusinessId = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
  
      if (!userId) return
  
      const { data: membership, error } = await supabase
        .from("business_members")
        .select("business_id")
        .eq("user_id", userId)
        .single()
  
      if (error) {
        console.error("Error obteniendo business_id:", error)
        return
      }
  
      setBId(membership.business_id)
    }
  
    fetchBusinessId()
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
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("*")
          .eq("business_id", bId)
        if (clientsError) console.error("Error clientes:", clientsError)
        else setClients(clientsData)

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("business_id", bId)
        if (productsError) console.error("Error productos:", productsError)
        else setProductsList(productsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [bId])

  // --- Calcular total automáticamente ---
  useEffect(() => {
    const newTotal = saleItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    setTotal(newTotal)
  }, [saleItems])

  // --- Cargar ventas recientes de cliente ---
  useEffect(() => {
    if (!selectedClient || !bId) return

    const fetchSales = async () => {
      try {
        const { data, error } = await supabase
          .from("sales")
          .select(`*, sale_items(*, product(*))`)
          .eq("business_id", bId)
          .eq("client_id", selectedClient.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error ventas:", error)
          setRecentSales([])
        } else {
          setRecentSales(data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchSales()
  }, [selectedClient, bId])

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

  // --- Productos para venta ---
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

  // --- Guardar venta ---
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
      // Reducir stock
      await supabase.from("products").update({ stock: item.stock - item.quantity }).eq("id", item.id)
    }

    alert("Venta guardada correctamente")
    setSaleItems([])
    setTotal(0)

    // Recargar productos
    const { data: productsData } = await supabase.from("products").select("*").eq("business_id", bId)
    setProductsList(productsData)

    // Recargar ventas recientes
    setRecentSales(prev => [sale, ...prev])
  }

  if (loading) return <Layout><p>Cargando...</p></Layout>
  if (!bId) return <Layout><p>No se encontró negocio asociado</p></Layout>

    return (
    <Layout>
      <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30
        }}>
          <h1 style={{ fontSize: 28, fontWeight: "bold" }}>Panel de Ventas</h1>
  
          <button
            onClick={logout}
            style={{
              padding: "10px 18px",
              background: "#e53935",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Cerrar sesión
          </button>
        </div>
  
        {/* Clientes */}
        <div style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginBottom: 30
        }}>
          <h2 style={{ marginBottom: 15 }}>Clientes</h2>
  
          <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
            <input
              placeholder="Nuevo cliente"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ddd"
              }}
            />
            <button
              onClick={addClient}
              style={{
                padding: "10px 16px",
                background: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer"
              }}
            >
              Agregar
            </button>
          </div>
  
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {clients.map(client => (
              <div
                key={client.id}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: selectedClient?.id === client.id ? "#e3f2fd" : "#f5f5f5",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5
                }}
              >
                <span onClick={() => setSelectedClient(client)}>
                  {client.name}
                </span>
                <button onClick={() => updateClient(client)}>✏️</button>
                <button onClick={() => deleteClient(client)} style={{ color: "red" }}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
  
        {selectedClient && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 30
          }}>
  
            {/* Venta */}
            <div style={{
              background: "white",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}>
              <h2>Registrar Venta</h2>
  
              <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                <select
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ddd"
                  }}
                >
                  <option value="">Seleccione un producto</option>
                  {productsList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.price} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
  
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value))}
                  style={{
                    width: 80,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid #ddd"
                  }}
                />
  
                <button
                  onClick={addProductToSale}
                  style={{
                    padding: "10px 16px",
                    background: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                >
                  Agregar
                </button>
              </div>
  
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ padding: 10 }}>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {saleItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: 10 }}>{item.name}</td>
                      <td>${item.price}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price * item.quantity}</td>
                      <td>
                        <button onClick={() => removeSaleItem(index)}>❌</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
  
              <div style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <h3>Total: ${total}</h3>
                <button
                  onClick={saveSale}
                  style={{
                    padding: "12px 20px",
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Guardar Venta
                </button>
              </div>
            </div>
  
            {/* Historial */}
            <div style={{
              background: "white",
              padding: 20,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}>
              <h2>Historial</h2>
  
              {recentSales.length === 0 ? (
                <p>No hay ventas.</p>
              ) : (
                recentSales.map(sale => (
                  <div key={sale.id} style={{
                    marginBottom: 15,
                    padding: 10,
                    background: "#f9f9f9",
                    borderRadius: 8
                  }}>
                    <strong>Total: ${sale.total}</strong>
                  </div>
                ))
              )}
            </div>
  
          </div>
        )}
      </div>
    </Layout>
  )
}
