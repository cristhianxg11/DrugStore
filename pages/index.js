import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  // Función para navegación segura
  const navigate = (path) => {
    if (user) {
      router.push(path);
    } else {
      alert("Debes iniciar sesión para acceder a esta sección");
    }
  };

  return (
    <div>
      <nav style={{ padding: 20, borderBottom: '1px solid #ccc', marginBottom: 20 }}>
        <span style={{ cursor: 'pointer', marginRight: 20 }} onClick={() => router.push('/')}>Home</span>
        <span style={{ cursor: 'pointer', marginRight: 20 }} onClick={() => navigate('/dashboard')}>Dashboard</span>
        <span style={{ cursor: 'pointer', marginRight: 20 }} onClick={() => navigate('/products')}>Productos</span>
        {user && (
          <button onClick={handleLogout} style={{ marginLeft: 20 }}>Cerrar sesión</button>
        )}
      </nav>

      <main>{children}</main>
    </div>
  );
}
