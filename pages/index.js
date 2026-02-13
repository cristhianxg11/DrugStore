import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from "../components/Layout";

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
      setLoading(false);
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push('/dashboard');
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Usuario creado correctamente');
  };

  if (loading) {
    return <Layout><p>Cargando...</p></Layout>;
  }

  return (
    <Layout>
      <div style={{
        maxWidth: 500,
        margin: '0 auto',
        padding: 40,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: 30 }}>Iniciar Sesión</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: 20, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: 20, borderRadius: 6, border: '1px solid #ccc' }}
        />

        <button onClick={handleLogin} style={{
          width: '48%',
          padding: 10,
          borderRadius: 6,
          border: 'none',
          background: '#27ae60',
          color: 'white',
          cursor: 'pointer'
        }}>Ingresar</button>

        <button onClick={handleSignup} style={{
          width: '48%',
          padding: 10,
          borderRadius: 6,
          border: 'none',
          background: '#2980b9',
          color: 'white',
          marginLeft: '4%',
          cursor: 'pointer'
        }}>Crear cuenta</button>

        {/* Mi negocio */}
        {user && (
          <div style={{
            marginTop: 40,
            padding: 20,
            background: '#f1f2f6',
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <h2>Mi negocio</h2>
            <p>Bienvenido, {user.email}</p>
            <button onClick={() => router.push('/dashboard')} style={{
              padding: '10px 20px',
              borderRadius: 6,
              border: 'none',
              background: '#27ae60',
              color: 'white',
              cursor: 'pointer'
            }}>Ir al Dashboard</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
