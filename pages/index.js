import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import Layout from "../components/Layout";

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  const handleSignup = async () => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    alert(error.message)
  } else {
    alert('Usuario creado correctamente')
  }
}

  return (
    <div style={{ padding: 40 }}>
      <h1>Almacén SaaS</h1>
      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />
      <button onClick={handleLogin}>Ingresar</button>
      <button onClick={handleSignup}>Crear cuenta</button>
    </div>
  )
}

