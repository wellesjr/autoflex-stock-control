import { useEffect, useState } from "react";
import { api } from "../api/api";

import PageHeader from "../components/PageHeader";
import ErrorAlert from "../components/ErrorAlert";
import DataTable from "../components/DataTable";

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
      setError(e?.response?.data?.message || e.message || "Falha ao carregar sugestão de produção");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: "id", header: "ID" },
    { key: "code", header: "Código" },
    { key: "name", header: "Nome" },
    { key: "unit", header: "Preço unitário", className: "text-right" },
    { key: "qty", header: "Quantidade sugerida", className: "text-right" },
    { key: "total", header: "Valor total", className: "text-right" },
  ];

  const rows = (data?.items || []).map((it) => ({
    key: it.productId,
    id: it.productId,
    code: it.productCode,
    name: it.productName,
    unit: Number(it.unitPrice).toFixed(2),
    qty: it.suggestedQuantity,
    total: Number(it.totalValue).toFixed(2),
  }));

  const grandTotal = Number(data?.grandTotalValue || 0).toFixed(2);

  return (
    <div className="grid gap-4">
      <PageHeader
        title="Produção sugerida"
        subtitle=""
        onRefresh={load}
        refreshing={loading}
        right={<div className="text-sm font-semibold sm:text-right">Total geral: {grandTotal}</div>}
      />

      <ErrorAlert error={error} />

      <DataTable columns={columns} rows={rows} emptyText="Nenhum produto encontrado" />
    </div>
  );
}
