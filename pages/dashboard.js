import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Layout from "../components/Layout";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  // Traer productos del usuario
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id);

    setProducts(data || []);
  };

  const addProduct = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('products').insert([
      { 
        name,
        price,
        cost: 0,
        user_id: user.id
      }
    ]);

    setName('');
    setPrice('');
    fetchProducts();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Estilos
  const cardStyle = {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  };

  const bigNumber = {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "10px"
  };

  return (
    <Layout>
      <h1 style={{ marginBottom: "20px" }}>Resumen</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
        <div style={cardStyle}>
          <h3>Ventas Hoy</h3>
          <p style={bigNumber}>$ 0</p>
        </div>

        <div style={cardStyle}>
          <h3>Ventas del Mes</h3>
          <p style={bigNumber}>$ 0</p>
        </div>

        <div style={cardStyle}>
          <h3>Productos</h3>
          <p style={bigNumber}>{products.length}</p>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '50px auto' }}>
        <button onClick={handleLogout}>Cerrar sesión</button>

        <hr />

        <h3>Agregar Productos</h3>
        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <input
          placeholder="Precio"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button onClick={addProduct} style={{ marginLeft: 10 }}>Guardar</button>

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
    </Layout>
  );
}


