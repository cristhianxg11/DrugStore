import { useState } from "react";
import Layout from "../components/Layout";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const addProduct = () => {
    if (!name || !price || !stock) return;

    const newProduct = {
      id: Date.now(),
      name,
      price,
      stock
    };

    setProducts([...products, newProduct]);

    setName("");
    setPrice("");
    setStock("");
  };

  const adjustStock = (id, amount) => {
    const updated = products.map((product) =>
      product.id === id
        ? { ...product, stock: Number(product.stock) + amount }
        : product
    );
    setProducts(updated);
  };

  return (
    <Layout>
      <h1>Productos</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Precio"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <button onClick={addProduct}>
          + Agregar Producto
        </button>
      </div>

      <table style={{ width: "100%", background: "white" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Ajustar</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>$ {product.price}</td>
              <td>{product.stock}</td>
              <td>
                <button onClick={() => adjustStock(product.id, 1)}>+1</button>
                <button onClick={() => adjustStock(product.id, -1)}>-1</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
