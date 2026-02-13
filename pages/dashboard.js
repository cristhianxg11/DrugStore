import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Layout from "../components/Layout";
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const router = useRouter();

  // Validar sesión al cargar la página
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/'); // redirige al login si no hay sesión
      } else {
        setUser(user);
        fetchProducts(user.id);
      }
    };
    checkUser();
  }, [router]);

  const fetchProducts = async (userId) => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId);

    setProducts(data || []);
  };

  const addProduct = async () => {
    if (!user) return;
    await supabase.from('products').insert([
      { name, price, cost: 0, user_id: user.id }
    ]);
    setName('');
    setPrice('');
    fetchProducts(user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Mientras no sabemos si hay usuario, no renderizamos contenido
  if (!user) return null;

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '50px auto' }}>
        <h2>Dashboard</h2>
        <button onClick={handleLogout}>Cerrar sesión</button>

        <hr />

        <h3>Agregar Productos</h3>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Precio" value={price} onChange={(e) => setPrice(e.target.value)} />
        <button onClick={addProduct}>Guardar</button>

        <hr />

        <h3>Mis Productos</h3>
        <ul>
          {products.map((p) => (
            <li key={p.id}>{p.name} - ${p.price}</li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}


