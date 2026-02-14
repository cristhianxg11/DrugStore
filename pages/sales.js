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
  const [salesList, setSalesList] = useState([])
  const [expandedSales, setExpandedSales] = useState({})
  const [totalVentas, setTotalVentas] = useState(0)
  const [totalPorCliente, setTotalPorCliente] = useState({})

  useEffect(() => {
    if (typeof window !== "undefined") {
      const businessId = localStorage.getItem("business_id")
      setBId(businessId)
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("business_id")
    window.location.href = "/"
  }

  // --- Cargar clientes, productos y ventas ---
  useEffect(() => {
    if (!bId) return
    const fetchData = async () => {
      try {
        const { data: clientsData } = await supabase
          .from("clients")
          .select("*")
          .eq("business_id", bId)
        setClients(clientsData || [])

        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .eq("business_id", bId)
        setProductsList(productsData || [])

        const { data: salesData } = await supabase
          .from("sales")
          .select("*, sale_items(*, product(*))")
          .eq("business_id", bId)
          .order("created_at", { ascending: false })
        setSalesList(salesData || [])

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [bId])

  // --- Calcular total de venta actual ---
  useEffect(() => {
    const newTotal = saleItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    setTotal(newTotal)
  }, [saleItems])

  // --- Calcular total general y por cliente ---
  useEffect(() => {
    const totalG = salesList.reduce((acc, s) => acc + s.total, 0)
    setTotalVentas(totalG)

    // Total por cliente
    const totals = {}
    salesList.forEach(s => {
      totals[s.client_id] = (totals[s.client_id] || 0) + s.total
    })
    setTotalPorCliente(totals)
  }, [salesList])

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
      await supabase.from("products").update({ stock: item.stock - item.quantity }).eq("id", item.id)
    }

    alert("Venta guardada correctamente")
    setSelectedClient(null)
    setSaleItems([])
    setTotal(0)

    // Recargar productos y ventas
    const { data: productsData } = await supabase.from("products").select("*").eq("business_id", bId)
    setProductsList(productsData)
    const { data: salesData } = await supabase.from("sales").select("*, sale_items(*, product(*))").eq("business_id", bId).order("created_at", { ascending: false })
    setSalesList(salesData)
  }

  if (loading) return <Layout><p>Cargando...</p></Layout>
  if (!bId) return <Layout><p>No se encontró negocio asociado</p></Layout>

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : "Desconocido"
  }

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ marginBottom: 0 }}>Ventas</h1>
        <button
          onClick={logout}
          style={{ padding: "8px 16px", background: "#f44336", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Cerrar sesión
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Total de ventas: ${totalVentas.toLocaleString()}</strong>
      </div>

      {/* Clientes */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nuevo cliente"
          value={clientName}
          onChange={e => setClientName(e.target.value)}
        />
        <button onClick={addClient} style={{ marginLeft: 10 }}>Agregar Cliente</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Clientes:</strong>
        <ul>
          {clients.map(client => (
            <li key={client.id} style={{ marginBottom: 5 }}>
              <button onClick={() => setSelectedClient(client)}>
                {client.name} {selectedClient?.id === client.id ? "(seleccionado)" : ""}
              </button>
              <span style={{ marginLeft: 10, fontWeight: "bold" }}>
                Total compras: ${totalPorCliente[client.id] ? totalPorCliente[client.id] : 0}
              </span>
              <button onClick={() => updateClient(client)} style={{ marginLeft: 5 }}>✏️</button>
              <button onClick={() => deleteClient(client)} style={{ marginLeft: 5, color: "red" }}>🗑️</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Venta actual */}
      {selectedClient && (
        <div style={{ marginBottom: 20 }}>
          <h3>Cliente seleccionado: {selectedClient.name}</h3>
          <div>
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
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
              style={{ width: 60, marginLeft: 5 }}
            />
            <button onClick={addProductToSale} style={{ marginLeft: 5 }}>Agregar producto</button>
          </div>
          <table border="1" cellPadding="10" style={{ marginTop: 10, width: "100%" }}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {saleItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>${item.price}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price * item.quantity}</td>
                  <td><button onClick={() => removeSaleItem(index)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Total: ${total}</h3>
          <button onClick={saveSale} style={{ marginTop: 10, padding: "8px 16px" }}>Guardar Venta</button>
        </div>
      )}

      {/* Ventas recientes */}
      <div style={{ marginTop: 40 }}>
        <h2>Ventas recientes</h2>
        {salesList.map(sale => (
          <div key={sale.id} style={{ marginBottom: 10, border: "1px solid #ccc", padding: 10, borderRadius: 8 }}>
            <div>
              Venta #{sale.id} - Cliente: {getClientName(sale.client_id)} - Total: ${sale.total}
              <button onClick={() => setExpandedSales(prev => ({ ...prev, [sale.id]: !prev[sale.id] }))} style={{ marginLeft: 10 }}>
                {expandedSales[sale.id] ? "Ocultar productos" : "Ver productos"}
              </button>
            </div>
            {expandedSales[sale.id] && (
              <ul style={{ marginTop: 5 }}>
                {sale.sale_items.map((item, idx) => (
                  <li key={idx}>
                    {item.product?.name} - ${item.price} x {item.quantity} = ${item.price * item.quantity}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Layout>
  )
}
