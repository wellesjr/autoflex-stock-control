import { useEffect, useMemo, useState } from "react";
import { api } from "../api/api";

import PageHeader from "../components/PageHeader";
import ErrorAlert from "../components/ErrorAlert";
import DataTable from "../components/DataTable";
import FormCard from "../components/FormCard";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatInteger } from "@/lib/formatters";

export default function ProductMaterials({ product }) {
	const [materials, setMaterials] = useState([]);
	const [rawMaterials, setRawMaterials] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [rawMaterialId, setRawMaterialId] = useState("");
	const [requiredQuantity, setRequiredQuantity] = useState("");

	const canAdd = useMemo(() => {
		return product?.id && rawMaterialId && String(requiredQuantity).trim();
	}, [product, rawMaterialId, requiredQuantity]);

	async function loadAll() {
		if (!product?.id) return;
		setLoading(true);
		setError("");
		try {
			const [linkedRes, rawRes] = await Promise.all([
				api.get(`/api/products/${product.id}/materials`),
				api.get("/api/raw-materials"),
			]);
			setMaterials(linkedRes.data || []);
			setRawMaterials(rawRes.data || []);
		} catch (e) {
			setError(
				e?.response?.data?.message || e.message || "Falha ao carregar materiais",
			);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		setMaterials([]);
		setRawMaterials([]);
		setRawMaterialId("");
		setRequiredQuantity("");
		if (product?.id) loadAll();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [product?.id]);

	async function onAdd(e) {
		e.preventDefault();
		setError("");
		try {
			await api.post(`/api/products/${product.id}/materials`, {
				rawMaterialId: Number(rawMaterialId),
				requiredQuantity: Number(requiredQuantity),
			});
			setRawMaterialId("");
			setRequiredQuantity("");
			await loadAll();
		} catch (e) {
			setError(
				e?.response?.data ||
					e?.response?.data?.message ||
					e.message ||
					"Falha ao adicionar material",
			);
		}
	}

	async function onUpdate(rmId, newQty) {
		setError("");
		try {
			await api.put(`/api/products/${product.id}/materials/${rmId}`, {
				rawMaterialId: Number(rmId),
				requiredQuantity: Number(newQty),
			});
			await loadAll();
		} catch (e) {
			setError(
				e?.response?.data ||
					e?.response?.data?.message ||
					e.message ||
					"Falha ao atualizar quantidade necessária",
			);
		}
	}

	async function onRemove(rmId) {
		if (!confirm("Remover esta matéria-prima do produto?")) return;
		setError("");
		try {
			await api.delete(`/api/products/${product.id}/materials/${rmId}`);
			await loadAll();
		} catch (e) {
			setError(e?.response?.data?.message || e.message || "Falha ao remover material");
		}
	}

	const linkedIds = new Set(materials.map((m) => String(m.rawMaterialId)));
	const availableToAdd = rawMaterials.filter(
		(rm) => !linkedIds.has(String(rm.id)),
	);

	const columns = [
		{ key: "material", header: "Matéria-prima" },
		{ key: "qty", header: "Quantidade necessária", className: "text-right" },
		{ key: "actions", header: "", className: "text-right" },
	];

	const rows = materials.map((m) => ({
		key: m.rawMaterialId,
		material: (
			<div>
				<div className="font-semibold">{m.rawMaterialCode}</div>
				<div className="text-sm text-muted-foreground">{m.rawMaterialName}</div>
			</div>
		),
		qty: (
			<EditableQty
				value={m.requiredQuantity}
				onSave={(v) => onUpdate(m.rawMaterialId, v)}
			/>
		),
		actions: (
			<Button
				variant="destructive"
				size="sm"
				onClick={() => onRemove(m.rawMaterialId)}>
				Remove
			</Button>
		),
	}));

	return (
		<div className="grid gap-4">
			<PageHeader
				title="Lista de Materiais"
				subtitle={`Produto: ${product.code} — ${product.name}`}
				onRefresh={loadAll}
				refreshing={loading}
			/>

			<ErrorAlert error={error} />

			<FormCard title="Adicionar matéria-prima ao produto">
				<form onSubmit={onAdd} className="grid gap-3 md:grid-cols-3">
					<div className="md:col-span-2">
						<Select value={rawMaterialId} onValueChange={setRawMaterialId}>
							<SelectTrigger>
								<SelectValue placeholder="Selecionar matéria-prima..." />
							</SelectTrigger>
							<SelectContent>
								{availableToAdd.map((rm) => (
									<SelectItem key={rm.id} value={String(rm.id)}>
										{rm.code} — {rm.name} (estoque:{" "}
										{formatInteger(rm.stockQuantity)})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2 sm:grid-cols-[1fr_auto]">
						<Input
							type="number"
							step="0.0001"
							value={requiredQuantity}
							onChange={(e) => setRequiredQuantity(e.target.value)}
							placeholder="Quantidade necessária (ex. 10)"
						/>
						<Button
							type="submit"
							disabled={!canAdd}
							className="w-full sm:w-auto">
							Adicionar
						</Button>
					</div>
				</form>
			</FormCard>

			<DataTable
				columns={columns}
				rows={rows}
				emptyText="Nenhum material vinculado ainda"
			/>
		</div>
	);
}

function EditableQty({ value, onSave }) {
	const [editing, setEditing] = useState(false);
	const [qty, setQty] = useState(() => String(value ?? ""));

	if (!editing) {
		return (
			<div className="flex flex-wrap items-center justify-end gap-2">
				<span>{Number(value).toFixed(4)}</span>
				<Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
					Editar
				</Button>
			</div>
		);
	}

	return (
		<div className="grid w-full gap-2 sm:flex sm:items-center sm:justify-end">
			<Input
				className="w-full text-right sm:w-32"
				type="number"
				step="0.0001"
				value={qty}
				onChange={(e) => setQty(e.target.value)}
			/>
			<div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
				<Button
					size="sm"
					className="w-full sm:w-auto"
					onClick={() => {
						setEditing(false);
						onSave(qty);
					}}>
					Salvar
				</Button>
				<Button
					variant="outline"
					size="sm"
					className="w-full sm:w-auto"
					onClick={() => {
						setEditing(false);
						setQty(String(value ?? ""));
					}}>
					Cancel
				</Button>
			</div>
		</div>
	);
}
