import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [businessId, setBusinessId] = useState(null);

  // 🔹 Obtener usuario y business_id
  useEffect(() => {
    const getUserBusiness = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setBusinessId(data.id);
        fetchProducts(data.id);
      }
    };

    getUserBusiness();
  }, []);

  const fetchProducts = async (bId) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", bId)
      .order("created_at", { ascending: false });

    if (data) setProducts(data);
  };

  const addOrUpdateProduct = async () => {
    if (!name || !price || !cost) return;

    if (editingId) {
      await supabase
        .from("products")
        .update({
          name,
          price: parseFloat(price),
          cost: parseFloat(cost),
        })
        .eq("id", editingId);

      setEditingId(null);
    } else {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("products").insert([
        {
          name,
          price: parseFloat(price),
          cost: parseFloat(cost),
          business_id: businessId,
          user_id: user.id,
        },
      ]);
    }

    setName("");
    setPrice("");
    setCost("");

    fetchProducts(businessId);
  };

  const deleteProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts(businessId);
  };

  const editProduct = (product) => {
    setName(product.name);
    setPrice(product.price);
    setCost(product.cost);
    setEditingId(product.id);
  };

  return (
    <Layout>
      <h1>Productos</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />
        <input
          placeholder="Costo"
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />
        <input
          placeholder="Precio"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />

        <button
          onClick={addOrUpdateProduct}
          style={{
            background: editingId ? "#f59e0b" : "#2563eb",
            color: "white",
            border: "none",
            padding: "8px 14px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {editingId ? "Actualizar" : "+ Agregar Producto"}
        </button>
      </div>

      <table style={{ width: "100%", background: "white" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Costo</th>
            <th>Precio</th>
            <th>Margen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>$ {product.cost}</td>
              <td>$ {product.price}</td>
              <td>
                ${ (product.price - product.cost).toFixed(2) }
              </td>
              <td>
                <button
                  onClick={() => editProduct(product)}
                  style={{ marginRight: "5px" }}
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  style={{ background: "#ef4444", color: "white" }}
                >
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

