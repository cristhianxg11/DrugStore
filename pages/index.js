import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from "../components/Layout";

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null); // Estado usuario
  const [loading, setLoading] = useState(true); // Loading mientras valida
  const router = useRouter();

  // Validar usuario
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data?.user ?? null);
      } catch (err) {
        console.error("Error obteniendo usuario:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
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

  // Mientras carga, mostrar lo mismo que el login (no rompe la UI)
  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 40 }}>
          <h1>DrugStore</h1>
          <p>Cargando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: 40 }}>
        <h1>DrugStore</h1>

        {/* Inputs login */}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />
        <button onClick={handleLogin}>Ingresar</button>
        <button onClick={handleSignup} style={{ marginLeft: 10 }}>Crear cuenta</button>

        {/* Mi negocio solo si hay usuario */}
        {user && (
          <div style={{ marginTop: 50, border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
            <h2>Mi negocio</h2>
            <p>Bienvenido, {user.email}</p>
            <button onClick={() => router.push('/dashboard')}>Ir al Dashboard</button>
          </div>
        )}
      </div>
    </Layout>
  );
}
