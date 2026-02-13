import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Layout from "../components/Layout";
import { useRouter } from "next/router";

export default function Products() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/");
    } else {
      setUser(user);
      loadProducts(user.id);
    }
  };

  const loadProducts = async (userId) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId);

    setProducts(data || []);
  };

  const addProduct = async () => {
    if (!name || !price) {
      alert("Completar datos");
      return;
    }

    await supabase.from("products").insert([
      {
        name,
        price: parseFloat(price),
        stock: 0,
        user_id: user.id
      }
    ]);

    setName("");
    setPrice("");
    setShowForm(false);
    loadProducts(user.id);
  };

  if (!user) return null;

  return (
    <Layout>
      <h1 style={{ marginBottom: 20 }}>Productos</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "10px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        + Agregar Producto
      </button>

      {showForm && (
        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
        }}>
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginRight: "10px", padding: "8px" }}
          />
          <input
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={{ marginRight: "10px", padding: "8px" }}
          />
          <button
            onClick={addProduct}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Guardar
          </button>
        </div>
      )}

      <table style={{
        width: "100%",
        background: "white",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
      }}>
        <thead style={{ background: "#f1f5f9" }}>
          <tr>
            <th style={{ padding: "12px" }}>Nombre</th>
            <th style={{ padding: "12px" }}>Precio</th>
            <th style={{ padding: "12px" }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td style={{ padding: "12px" }}>{product.name}</td>
              <td style={{ padding: "12px" }}>$ {product.price}</td>
              <td style={{ padding: "12px" }}>{product.stock ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
