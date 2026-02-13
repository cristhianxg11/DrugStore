import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [editingId, setEditingId] = useState(null);

  // 🔹 Cargar productos desde BD
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (!error) {
      setProducts(data);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addOrUpdateProduct = async () => {
    if (!name || !price || !stock) return;

    if (editingId) {
      await supabase
        .from("products")
        .update({
          name,
          price: parseFloat(price),
          stock: parseInt(stock),
        })
        .eq("id", editingId);

      setEditingId(null);
    } else {
      await supabase.from("products").insert([
        {
          name,
          price: parseFloat(price),
          stock: parseInt(stock),
        },
      ]);
    }

    setName("");
    setPrice("");
    setStock("");

    fetchProducts(); // 🔥 recargar tabla
  };

  const deleteProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const editProduct = (product) => {
    setName(product.name);
    setPrice(product.price);
    setStock(product.stock);
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
          placeholder="Precio"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ marginRight: "10px", padding: "6px" }}
        />
        <input
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
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
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>$ {product.price}</td>
              <td>{product.stock}</td>
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

