import { useState } from "react";
import Products from "./pages/Products";
import RawMaterials from "./pages/RawMaterials";
import Production from "./pages/Production";

function NavButton({ active, children, onClick }) {
	return (
		<button
			onClick={onClick}
			style={{
				padding: "8px 12px",
				borderRadius: 8,
				border: "1px solid #ddd",
				background: active ? "#111" : "#fff",
				color: active ? "#fff" : "#111",
				cursor: "pointer",
			}}>
			{children}
		</button>
	);
}

export default function App() {
	const [page, setPage] = useState("products");

	return (
		<main
			style={{
				maxWidth: 1100,
				margin: "0 auto",
				padding: 16,
				display: "grid",
				gap: 16,
			}}>
			<header
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					gap: 12,
					flexWrap: "wrap",
				}}>
				<div>
					<h1 style={{ margin: 0 }}>Autoflex Stock Control</h1>
					<p style={{ margin: 0, opacity: 0.75 }}>Frontend (RF005–RF008)</p>
				</div>

				<nav style={{ display: "flex", gap: 8 }}>
					<NavButton
						active={page === "products"}
						onClick={() => setPage("products")}>
						Products
					</NavButton>
					<NavButton active={page === "raw"} onClick={() => setPage("raw")}>
						Raw Materials
					</NavButton>
					<NavButton
						active={page === "production"}
						onClick={() => setPage("production")}>
						Production
					</NavButton>
				</nav>
			</header>

			{page === "products" ? <Products /> : null}
			{page === "raw" ? <RawMaterials /> : null}
            {page === "production" ? <Production /> : null}
		</main>
	);
}
