import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

const fetchProducts = async () => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', user.id)

  setProducts(data || [])
}

  const addProduct = async () => {
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('products').insert([
    { 
      name,
      price,
      cost: 0,
      user_id: user.id
    }
  ])

  setName('')
  setPrice('')
  fetchProducts()
}

const handleLogout = async () => {
  await supabase.auth.signOut()
  window.location.href = '/'
}

<div class="container">
  <h2>Resumen</h2>

  <div class="card">
    <h3>Ventas Hoy</h3>
    <p>$ 24.500</p>
  </div>

  <div class="card">
    <h3>Productos Activos</h3>
    <p>128</p>
  </div>
</div>
 
  return (
    <div style={{ maxWidth: 600, margin: '50px auto' }}>
      <h2>Dashboard</h2>

      <button onClick={handleLogout}>Cerrar sesión</button>

      <hr />

      <h3>Agregar Producto</h3>

      <input
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Precio"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button onClick={addProduct}>Guardar</button>

      <hr />

      <h3>Mis Productos</h3>

      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price}
          </li>
        ))}
      </ul>
    </div>
  )
}

