import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Link from 'next/link';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Opcional: escuchar cambios de sesión en tiempo real
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  return (
    <div>
      <nav style={{ padding: 20, borderBottom: '1px solid #ccc', marginBottom: 20 }}>
        <Link href="/">Home</Link>
        {user && (
          <>
            <Link href="/dashboard" style={{ marginLeft: 20 }}>Dashboard</Link>
            <Link href="/products" style={{ marginLeft: 20 }}>Productos</Link>
            <button onClick={handleLogout} style={{ marginLeft: 20 }}>Cerrar sesión</button>
          </>
        )}
      </nav>

      <main>{children}</main>
    </div>
  );
}
