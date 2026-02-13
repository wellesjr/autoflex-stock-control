import { useEffect, useMemo, useState } from "react";
import { api } from "../api/api";

import PageHeader from "../components/PageHeader";
import ErrorAlert from "../components/ErrorAlert";
import FormCard from "../components/FormCard";
import DataTable from "../components/DataTable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrencyBRL } from "@/lib/formatters";

import ProductMaterials from "./ProductMaterials";

const emptyForm = { code: "", name: "", price: "" };

export default function Products() {
	const [items, setItems] = useState([]);
	const [q, setQ] = useState("");
	const [loading, setLoading] = useState(false);

	const [form, setForm] = useState(emptyForm);
	const [error, setError] = useState("");

	const [selected, setSelected] = useState(null);

	const canSubmit = useMemo(() => {
		return form.code.trim() && form.name.trim() && String(form.price).trim();
	}, [form]);

	async function load() {
		setLoading(true);
		setError("");
		try {
			const res = await api.get("/api/products", { params: { q } });
			setItems(res.data);

			if (selected?.id) {
				const updated = res.data.find((p) => p.id === selected.id);
				if (updated) setSelected(updated);
			}
		} catch (e) {
			setError(
				e?.response?.data?.message || e.message || "Falhao ao carregar produtos",
			);
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
			await api.post("/api/products", {
				code: form.code.trim(),
				name: form.name.trim(),
				price: Number(form.price),
			});
			setForm(emptyForm);
			await load();
		} catch (e) {
			setError(
				e?.response?.data ||
					e?.response?.data?.message ||
					e.message ||
					"Falha ao criar produto",
			);
		}
	}

	async function onDelete(id) {
		if (!confirm("Excluir este produto?")) return;
		setError("");
		try {
			await api.delete(`/api/products/${id}`);
			if (selected?.id === id) setSelected(null);
			await load();
		} catch (e) {
			setError(
				e?.response?.data?.message || e.message || "Falha ao excluir produto",
			);
		}
	}

	const columns = [
		{ key: "id", header: "ID" },
		{ key: "code", header: "Código" },
		{ key: "name", header: "Nome" },
		{ key: "price", header: "Preço", className: "text-right" },
		{ key: "actions", header: "", className: "text-right" },
	];

	const rows = items.map((p) => ({
		key: p.id,
		id: p.id,
		code: (
			<span className={selected?.id === p.id ? "font-semibold" : ""}>
				{p.code}
			</span>
		),
		name: p.name,
		price: formatCurrencyBRL(p.price),
		actions: (
			<div className="flex flex-wrap justify-end gap-2">
				<Button variant="secondary" size="sm" onClick={() => setSelected(p)}>
					Materiais
				</Button>
				<Button variant="destructive" size="sm" onClick={() => onDelete(p.id)}>
					Excluir
				</Button>
			</div>
		),
	}));

	return (
		<div className="grid gap-4">
			<PageHeader
				title="Produtos"
				subtitle="Lista de produtos e seus materiais necessários"
				onRefresh={load}
				refreshing={loading}
			/>

			<ErrorAlert error={error} />

			<div className="grid gap-4 lg:grid-cols-2">
				<FormCard title="Criar produto">
					<form onSubmit={onCreate} className="grid gap-3">
						<Input
							value={form.code}
							onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
							placeholder="Código (ex. P-001)"
						/>
						<Input
							value={form.name}
							onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
							placeholder="Nome (ex. Pastilha de Freio)"
						/>
						<Input
							type="number"
							step="0.01"
							value={form.price}
							onChange={(e) =>
								setForm((f) => ({ ...f, price: e.target.value }))
							}
							placeholder="Preço (ex. 120.00)"
						/>
						<Button type="submit" disabled={!canSubmit}>
							Criar
						</Button>
					</form>
				</FormCard>

				<FormCard title="Lista">
					<div className="grid gap-2 sm:grid-cols-[1fr_auto]">
						<Input
							value={q}
							onChange={(e) => setQ(e.target.value)}
							placeholder="Pesquisar..."
						/>
						<Button
							variant="outline"
							onClick={load}
							disabled={loading}
							className="w-full sm:w-auto">
							Pesquisar
						</Button>
					</div>

					<DataTable
						columns={columns}
						rows={rows}
						emptyText="Nenhum produto encontrado"
					/>
				</FormCard>
			</div>

			{selected ? <ProductMaterials product={selected} /> : null}
		</div>
	);
}
