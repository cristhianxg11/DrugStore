import Layout from "../components/Layout";

<table style={{ width: "100%", background: "white", borderRadius: "10px" }}>
  <thead>
    <tr style={{ background: "#f9fafb" }}>
      <th style={th}>Nombre</th>
      <th style={th}>Precio</th>
      <th style={th}>Stock</th>
    </tr>
  </thead>
  <tbody>
    {products.map((product) => (
      <tr key={product.id}>
        <td style={td}>{product.name}</td>
        <td style={td}>$ {product.price}</td>
        <td style={td}>{product.stock}</td>
      </tr>
    ))}
  </tbody>
</table>
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

