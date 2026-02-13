import { useEffect, useMemo, useState } from "react";
import { api } from "../api/api";

import PageHeader from "../components/PageHeader";
import ErrorAlert from "../components/ErrorAlert";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatInteger } from "@/lib/formatters";

const emptyForm = { code: "", name: "", stockQuantity: "" };

export default function RawMaterials() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return form.code.trim() && form.name.trim() && String(form.stockQuantity).trim();
  }, [form]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/raw-materials", { params: { q } });
      setItems(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Falha ao carregar matérias-primas");
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
      await api.post("/api/raw-materials", {
        code: form.code.trim(),
        name: form.name.trim(),
        stockQuantity: Number(form.stockQuantity),
      });
      setForm(emptyForm);
      await load();
    } catch (e) {
      setError(e?.response?.data || e?.response?.data?.message || e.message || "Falha ao criar matéria-prima");
    }
  }

  async function onDelete(id) {
    if (!confirm("Excluir esta matéria-prima?")) return;
    setError("");
    try {
      await api.delete(`/api/raw-materials/${id}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Falha ao excluir matéria-prima");
    }
  }

  const columns = [
    { key: "id", header: "ID" },
    { key: "code", header: "Código" },
    { key: "name", header: "Nome" },
    { key: "stock", header: "Estoque", className: "text-right" },
    { key: "actions", header: "", className: "text-right" },
  ];

  const rows = items.map((rm) => ({
    key: rm.id,
    id: rm.id,
    code: rm.code,
    name: rm.name,
    stock: formatInteger(rm.stockQuantity),
    actions: (
      <div className="flex justify-end">
        <Button variant="destructive" size="sm" onClick={() => onDelete(rm.id)}>
          Excluir
        </Button>
      </div>
    ),
  }));

  return (
    <div className="grid gap-4">
      <PageHeader title="Matérias-primas" subtitle="" onRefresh={load} refreshing={loading} />

      <ErrorAlert error={error} />

      <div className="grid gap-4 lg:grid-cols-2">
        <FormCard title="Criar matéria-prima">
          <form onSubmit={onCreate} className="grid gap-3">
            <Input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="Código (ex. RM-001)"
            />
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nome (ex. Aço inox 304)"
            />
            <Input
              type="number"
              step="0.01"
              value={form.stockQuantity}
              onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
              placeholder="Quantidade em estoque (ex. 100)"
            />
            <Button type="submit" disabled={!canSubmit}>
              Criar     
            </Button>
          </form>
        </FormCard>

        <FormCard title="Lista">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar..." />
            <Button variant="outline" onClick={load} disabled={loading} className="w-full sm:w-auto">
              Pesquisar
            </Button>
          </div>

          <DataTable columns={columns} rows={rows} emptyText="Nenhuma matéria-prima encontrada" />
        </FormCard>
      </div>
    </div>
  );
}
