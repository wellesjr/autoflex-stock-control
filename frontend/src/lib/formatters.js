const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

export function formatCurrencyBRL(value) {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) {
    return brlFormatter.format(0);
  }
  return brlFormatter.format(numericValue);
}

export function formatInteger(value) {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) {
    return integerFormatter.format(0);
  }
  return integerFormatter.format(Math.trunc(numericValue));
}
