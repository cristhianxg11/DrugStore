import Layout from "../components/Layout";

export default function Products() {
  const products = [];

  return (
    <Layout>
      <h1>Productos</h1>

      <button
        style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "10px 16px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "15px"
        }}
      >
        + Agregar Producto
      </button>

      <table style={{ width: "100%", background: "white" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>$ {product.price}</td>
              <td>{product.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </Layout>
  );
}
