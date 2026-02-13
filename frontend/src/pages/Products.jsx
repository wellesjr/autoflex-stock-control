import { useEffect, useMemo, useState } from "react";
import { api } from "../api/api";

const emptyForm = { code: "", name: "", price: "" };

export default function Products() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return form.code.trim() && form.name.trim() && String(form.price).trim();
  }, [form]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/products", { params: { q } });
      setItems(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        price: Number(form.price),
      };
      await api.post("/api/products", payload);
      setForm(emptyForm);
      await load();
    } catch (e) {
      setError(e?.response?.data || e?.response?.data?.message || e.message || "Failed to create product");
    }
  }

  async function onDelete(id) {
    if (!confirm("Delete this product?")) return;
    setError("");
    try {
      await api.delete(`/api/products/${id}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to delete product");
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h2 style={{ margin: 0 }}>Products</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>CRUD for products (RF005)</p>
        </div>

        <button onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      {error ? (
        <div style={{ padding: 12, border: "1px solid #f99", background: "#fff5f5" }}>
          <strong>Error:</strong> <span>{String(error)}</span>
        </div>
      ) : null}

      <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Create product</h3>
          <form onSubmit={onCreate} style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Code</span>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="P-001"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Brake Pad"
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Price</span>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="120.00"
              />
            </label>

            <button type="submit" disabled={!canSubmit}>
              Create
            </button>
          </form>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>List</h3>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
            <button onClick={load} disabled={loading}>
              Search
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Name</th>
                  <th style={{ textAlign: "right" }}>Price</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f3f3f3" }}>
                    <td>{p.id}</td>
                    <td>{p.code}</td>
                    <td>{p.name}</td>
                    <td style={{ textAlign: "right" }}>{Number(p.price).toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>
                      <button onClick={() => onDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {!items.length ? (
                  <tr>
                    <td colSpan="5" style={{ opacity: 0.7, padding: 12 }}>
                      No products found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <p style={{ opacity: 0.7, margin: 0 }}>
        Tip: keep backend running on <code>http://localhost:8080</code>
      </p>
    </div>
  );
}