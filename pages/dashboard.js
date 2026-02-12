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

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>

      <h3>Agregar producto</h3>
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

      <h3>Productos</h3>
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

