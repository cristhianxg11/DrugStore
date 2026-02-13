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
    router.push('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: '#2c3e50',
        color: 'white',
        padding: '20px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2 style={{ textAlign: 'center' }}>DrugStore</h2>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', padding: '5px 10px' }}>Home</Link>
        {user && (
          <>
            <Link href="/dashboard" style={{ color: 'white', textDecoration: 'none', padding: '5px 10px' }}>Dashboard</Link>
            <Link href="/products" style={{ color: 'white', textDecoration: 'none', padding: '5px 10px' }}>Productos</Link>
            <button onClick={handleLogout} style={{
              marginTop: '20px',
              padding: '8px 12px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px'
            }}>Cerrar sesión</button>
          </>
        )}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 40, background: '#ecf0f1' }}>
        {children}
      </main>
    </div>
  );
}
