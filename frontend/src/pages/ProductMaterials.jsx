import { useEffect, useMemo, useState } from "react";
import { api } from "../api/api";

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
				e?.response?.data?.message || e.message || "Failed to load materials",
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
					"Failed to add material",
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
					"Failed to update",
			);
		}
	}

	async function onRemove(rmId) {
		if (!confirm("Remove this material from product?")) return;
		setError("");
		try {
			await api.delete(`/api/products/${product.id}/materials/${rmId}`);
			await loadAll();
		} catch (e) {
			setError(e?.response?.data?.message || e.message || "Failed to remove");
		}
	}

	const linkedIds = new Set(materials.map((m) => String(m.rawMaterialId)));
	const availableToAdd = rawMaterials.filter(
		(rm) => !linkedIds.has(String(rm.id)),
	);

	return (
		<div
			style={{
				border: "1px solid #ddd",
				borderRadius: 8,
				padding: 16,
				display: "grid",
				gap: 12,
			}}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "baseline",
					gap: 12,
				}}>
				<div>
					<h3 style={{ margin: 0 }}>Bill of Materials (RF007)</h3>
					<p style={{ margin: 0, opacity: 0.8 }}>
						Product: <strong>{product.code}</strong> — {product.name}
					</p>
				</div>

				<button onClick={loadAll} disabled={loading}>
					{loading ? "Loading..." : "Refresh"}
				</button>
			</div>

			{error ? (
				<div
					style={{
						padding: 12,
						border: "1px solid #f99",
						background: "#fff5f5",
					}}>
					<strong>Error:</strong> <span>{String(error)}</span>
				</div>
			) : null}

			<form
				onSubmit={onAdd}
				style={{
					display: "grid",
					gap: 10,
					gridTemplateColumns: "1fr 1fr auto",
				}}>
				<label style={{ display: "grid", gap: 6 }}>
					<span>Raw material</span>
					<select
						value={rawMaterialId}
						onChange={(e) => setRawMaterialId(e.target.value)}>
						<option value="">Select...</option>
						{availableToAdd.map((rm) => (
							<option key={rm.id} value={rm.id}>
								{rm.code} — {rm.name} (stock:{" "}
								{Number(rm.stockQuantity).toFixed(2)})
							</option>
						))}
					</select>
				</label>

				<label style={{ display: "grid", gap: 6 }}>
					<span>Required quantity</span>
					<input
						type="number"
						step="0.0001"
						value={requiredQuantity}
						onChange={(e) => setRequiredQuantity(e.target.value)}
						placeholder="e.g. 2"
					/>
				</label>

				<div style={{ display: "grid", alignContent: "end" }}>
					<button type="submit" disabled={!canAdd}>
						Add
					</button>
				</div>
			</form>

			<div style={{ overflowX: "auto" }}>
				<table
					width="100%"
					cellPadding="8"
					style={{ borderCollapse: "collapse" }}>
					<thead>
						<tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
							<th>Raw material</th>
							<th style={{ textAlign: "right" }}>Required qty</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{materials.map((m) => (
							<Row
								key={m.rawMaterialId}
								item={m}
								onUpdate={(qty) => onUpdate(m.rawMaterialId, qty)}
								onRemove={() => onRemove(m.rawMaterialId)}
							/>
						))}
						{!materials.length ? (
							<tr>
								<td colSpan="3" style={{ opacity: 0.7, padding: 12 }}>
									No materials linked yet
								</td>
							</tr>
						) : null}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function Row({ item, onUpdate, onRemove }) {
	const [editing, setEditing] = useState(false);
	const [qty, setQty] = useState(String(item.requiredQuantity ?? ""));

	return (
		<tr style={{ borderBottom: "1px solid #f3f3f3" }}>
			<td>
				<strong>{item.rawMaterialCode}</strong> — {item.rawMaterialName}
			</td>

			<td style={{ textAlign: "right" }}>
				{editing ? (
					<input
						type="number"
						step="0.0001"
						value={qty}
						onChange={(e) => setQty(e.target.value)}
						style={{ width: 140, textAlign: "right" }}
					/>
				) : (
					Number(item.requiredQuantity).toFixed(4)
				)}
			</td>

			<td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
				{editing ? (
					<>
						<button
							onClick={() => {
								setEditing(false);
								onUpdate(qty);
							}}
							style={{ marginRight: 8 }}>
							Save
						</button>
						<button
							onClick={() => {
								setEditing(false);
								setQty(String(item.requiredQuantity ?? ""));
							}}>
							Cancel
						</button>
					</>
				) : (
					<>
						<button onClick={() => setEditing(true)} style={{ marginRight: 8 }}>
							Edit
						</button>
						<button onClick={onRemove}>Remove</button>
					</>
				)}
			</td>
		</tr>
	);
}
