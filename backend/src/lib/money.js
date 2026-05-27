export function lkrToCents(value) {
  if (typeof value === "number") return Math.round(value * 100);
  if (typeof value === "string") {
    let cleaned = value.replace(/Rs\.?\s*/i, "");
    cleaned = cleaned.replace(/,/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
  }
  return 0;
}

