import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Layout from "../components/Layout";
import { useRouter } from "next/router";

export default function Sales() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
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

  const registerSale = async () => {
    const product = products.find(p => p.id == selectedProduct);
    if (!product) return alert("Seleccionar producto");

    const total = product.price * quantity;

    const { data: sale } = await supabase
      .from("sales")
      .insert([{ user_id: user.id, total }])
      .select()
      .single();

    await supabase.from("sale_items").insert([
      {
        sale_id: sale.id,
        product_id: product.id,
        quantity,
        price: product.price
      }
    ]);

    await supabase
      .from("products")
      .update({ stock: product.stock - quantity })
      .eq("id", product.id);

    alert("Venta registrada");
    loadProducts(user.id);
  };

  if (!user) return null;

  return (
    <Layout>
      <h1>Registrar Venta</h1>

      <select
        value={selectedProduct}
        onChange={(e) => setSelectedProduct(e.target.value)}
      >
        <option value="">Seleccionar producto</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} - $ {p.price}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value))}
      />

      <button onClick={registerSale}>
        Registrar Venta
      </button>
    </Layout>
  );
}
