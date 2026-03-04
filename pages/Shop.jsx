import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function Shop() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState("")

  const businessId = "TU_BUSINESS_ID_AQUI"

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", businessId)

      setProducts(data || [])

      const uniqueCategories = [
        "Todos",
        ...new Set(data.map(p => p.category).filter(Boolean))
      ]

      setCategories(uniqueCategories)
    }

    fetchProducts()
  }, [])

  const addToCart = (product) => {
    const exists = cart.find(p => p.id === product.id)

    if (exists) {
      setCart(cart.map(p =>
        p.id === product.id
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(p => p.id !== id))
  }

  const sendOrder = async () => {
    if (cart.length === 0) return

    const { data: order } = await supabase
      .from("orders")
      .insert([{
        business_id: businessId,
        client_name: "Cliente Web",
        client_phone: "Web",
        status: "pending"
      }])
      .select()
      .single()

    for (const item of cart) {
      await supabase.from("order_items").insert([{
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }])
    }

    let message = "Hola, quiero hacer este pedido:%0A%0A"
    cart.forEach(item => {
      message += `- ${item.name} x ${item.quantity}%0A`
    })

    window.open(`https://wa.me/549XXXXXXXXX?text=${message}`)

    setCart([])
  }

  const filteredProducts = products
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(p =>
      selectedCategory === "Todos"
        ? true
        : p.category === selectedCategory
    )

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 32 }}>Supermercado Online</h1>

      {/* Buscador */}
      <input
        placeholder="Buscar productos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: 10,
          width: "100%",
          marginBottom: 20,
          borderRadius: 8,
          border: "1px solid #ddd"
        }}
      />

      {/* Categorías */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              background:
                selectedCategory === cat ? "#1976d2" : "#eee",
              color:
                selectedCategory === cat ? "white" : "black"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 30 }}>
        {/* Productos */}
        <div style={{
          flex: 3,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 20
        }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{
              borderRadius: 12,
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              padding: 15,
              background: "white"
            }}>
              <img
                src={product.image_url || "https://via.placeholder.com/200"}
                alt={product.name}
                style={{
                  width: "100%",
                  height: 150,
                  objectFit: "cover",
                  borderRadius: 8
                }}
              />
              <h3>{product.name}</h3>
              <p style={{ fontWeight: "bold" }}>${product.price}</p>
              <button
                onClick={() => addToCart(product)}
                style={{
                  width: "100%",
                  padding: 10,
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                Agregar al carrito
              </button>
            </div>
          ))}
        </div>

        {/* Carrito lateral */}
        <div style={{
          flex: 1,
          background: "#f9f9f9",
          padding: 20,
          borderRadius: 12,
          height: "fit-content"
        }}>
          <h2>Carrito</h2>

          {cart.length === 0 && <p>Vacío</p>}

          {cart.map(item => (
            <div key={item.id} style={{ marginBottom: 10 }}>
              {item.name} x {item.quantity}
              <button
                onClick={() => removeFromCart(item.id)}
                style={{ marginLeft: 5 }}
              >
                ❌
              </button>
            </div>
          ))}

          {cart.length > 0 && (
            <button
              onClick={sendOrder}
              style={{
                marginTop: 15,
                width: "100%",
                padding: 12,
                background: "#25D366",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: "bold"
              }}
            >
              Enviar pedido por WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
