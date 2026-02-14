import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/router"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  // LOGIN
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()

    const userId = sessionData.session.user.id

    const { data: membership, error: memberError } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", userId)
      .single()
      console.log("Membership result:", membership)
      console.log("Membership error:", memberError)
    if (memberError) {
      alert("No se encontró negocio asociado")
      return
    }

    localStorage.setItem("business_id", membership.business_id)
    console.log("User ID login:", userId)

    router.push("/dashboard")
  }

  // SIGNUP
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

    // Crear business
    const { data: newBusiness, error: businessError } = await supabase
      .from("businesses")
      .insert([{ name: "Mi Negocio" }])
      .select()
      .single()

    if (businessError) {
      alert(businessError.message)
      return
    }

    // Crear relación en business_members
    const { error: memberError } = await supabase
      .from("business_members")
      .insert([
        {
          business_id: newBusiness.id,
          user_id: userId,
          role: "owner",
        },
      ])

    if (memberError) {
      alert(memberError.message)
      return
    }

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

