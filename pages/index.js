import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useRouter } from "next/router"

export default function Home() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  // LOGIN
  const handleLogin = async () => {
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) {
        alert(loginError.message)
        return
      }

      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session.user.id

      // Obtener los negocios del usuario
      const { data: memberships, error: memberError } = await supabase
        .from("business_members")
        .select("business_id")
        .eq("user_id", userId)

      if (memberError || !memberships || memberships.length === 0) {
        alert("No se encontró negocio asociado")
        return
      }

      // Tomar el primer negocio único
      const uniqueBusinessIds = [...new Set(memberships.map(m => m.business_id))]
      const businessId = uniqueBusinessIds[0]

      localStorage.setItem("business_id", businessId)
      console.log("User ID login:", userId)
      console.log("Membership result:", memberships)

      router.push("/dashboard")
    } catch (err) {
      console.error("Error en login:", err)
      alert("Ocurrió un error en el login")
    }
  }

  // SIGNUP
  const handleSignup = async () => {
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signupError) {
        alert(signupError.message)
        return
      }

      const userId = data.user.id

      // Verificar si ya existe un negocio para este usuario
      const { data: existingBusiness } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", userId)
        .single()

      let businessId

      if (!existingBusiness) {
        // Crear negocio si no existe
        const { data: newBusiness, error: businessError } = await supabase
          .from("businesses")
          .insert([{ name: "Mi Negocio", owner_id: userId }])
          .select()
          .single()

        if (businessError) {
          alert(businessError.message)
          return
        }

        businessId = newBusiness.id
      } else {
        businessId = existingBusiness.id
      }

      // Verificar relación en business_members
      const { data: existingMember } = await supabase
        .from("business_members")
        .select("*")
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .single()

      if (!existingMember) {
        await supabase.from("business_members").insert([
          {
            business_id: businessId,
            user_id: userId,
            role: "owner",
          },
        ])
      }

      localStorage.setItem("business_id", businessId)
      alert("Usuario creado correctamente")
    } catch (err) {
      console.error("Error en signup:", err)
      alert("Ocurrió un error al crear el usuario")
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
      <button onClick={handleSignup} style={{ marginLeft: 10 }}>
        Crear cuenta
      </button>
    </div>
  )
}


