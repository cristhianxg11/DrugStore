import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Layout from "../components/Layout";
import { useRouter } from "next/router";

export default function Products() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);
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
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setProducts(data || []);
  };

  const saveProduct = async () => {
    if (!name || !price) return alert("Completar datos");

    if (editingId) {
      await supabase
        .from("products")
        .update({
          name,
          price: parseFloat(price)
        })
        .eq("id", editingId);
    } else {
      await supabase.from("products").insert([
        {
          name,
          price: parseFloat(price),
          stock: 0,
          user_id: user.id
        }
      ]);
    }

    resetForm();
    loadProducts(user.id);
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setShowForm(true);
  };

  const deleteProduct = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;

    await supabase
      .from("products")
      .delete()
      .eq("id", id);

    loadProducts(user.id);
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setEditingId(null);
    setShowForm(false);
  };

  if (!user) return null;

  return (
    <Layout>
      <h1 style={{ marginBottom: 20 }}>Productos</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        style={buttonPrimary}
      >
        + Agregar Producto
      </button>

      {showForm && (
        <div style={formCard}>
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            style={inputStyle}
          />
          <button onClick={saveProduct} style={buttonSuccess}>
            {editingId ? "Actualizar" : "Guardar"}
          </button>
          <button onClick={resetForm} style={buttonSecondary}>
            Cancelar
          </button>
        </div>
      )}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>$ {p.price}</td>
              <td>{p.stock ?? 0}</td>
              <td>
                <button onClick={() => editProduct(p)} style={buttonSmall}>
                  Editar
                </button>
                <button onClick={() => deleteProduct(p.id)} style={buttonDanger}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

/* estilos */

const buttonPrimary = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "20px"
};

const buttonSuccess = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "10px"
};

const buttonSecondary = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "6px",
  cursor: "pointer"
};

const buttonDanger = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  marginLeft: "5px"
};

const buttonSmall = {
  background: "#f59e0b",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer"
};

const inputStyle = {
  marginRight: "10px",
  padding: "8px",
  marginBottom: "10px"
};

const formCard = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};

const tableStyle = {
  width: "100%",
  background: "white",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};
