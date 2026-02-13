import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function Production() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/production/suggestion");
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load suggestion");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h2 style={{ margin: 0 }}>Production Suggestion</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>What can be produced with current stock (RF008)</p>
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

      {!data ? (
        <div style={{ opacity: 0.7 }}>No data</div>
      ) : (
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <h3 style={{ margin: 0 }}>Suggested plan</h3>
            <div style={{ fontWeight: 700 }}>
              Grand total:{" "}
              <span>{Number(data.grandTotalValue || 0).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ overflowX: "auto", marginTop: 12 }}>
            <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Name</th>
                  <th style={{ textAlign: "right" }}>Unit price</th>
                  <th style={{ textAlign: "right" }}>Suggested qty</th>
                  <th style={{ textAlign: "right" }}>Total value</th>
                </tr>
              </thead>
              <tbody>
                {(data.items || []).map((it) => (
                  <tr key={it.productId} style={{ borderBottom: "1px solid #f3f3f3" }}>
                    <td>{it.productId}</td>
                    <td>{it.productCode}</td>
                    <td>{it.productName}</td>
                    <td style={{ textAlign: "right" }}>{Number(it.unitPrice).toFixed(2)}</td>
                    <td style={{ textAlign: "right" }}>{it.suggestedQuantity}</td>
                    <td style={{ textAlign: "right" }}>{Number(it.totalValue).toFixed(2)}</td>
                  </tr>
                ))}
                {!data.items?.length ? (
                  <tr>
                    <td colSpan="6" style={{ opacity: 0.7, padding: 12 }}>
                      No products found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}