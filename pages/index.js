import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/router"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    const userId = data.user.id

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", userId)
      .single()

    localStorage.setItem("business_id", business.id)

    router.push("/dashboard")
  }

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    const userId = data.user.id

    const { data: newBusiness } = await supabase
      .from("businesses")
      .insert([{ name: "Mi Negocio", owner_id: userId }])
      .select()
      .single()

    localStorage.setItem("business_id", newBusiness.id)

    alert("Usuario creado correctamente")
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
      <button onClick={handleSignup} style={{ marginLeft: 10 }}>
        Crear cuenta
      </button>
    </div>
  )
}
