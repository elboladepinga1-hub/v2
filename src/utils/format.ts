export const parsePrice = (value: number | string): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  try {
    // remove all non digit, dot or comma, minus
    const cleaned = String(value).replace(/[^0-9,.-]/g, '').trim();
    // If string contains comma and dot, assume dot is thousand separator
    // e.g. "1.234,56" -> remove dots, replace comma with dot
    if (cleaned.indexOf(',') > -1 && cleaned.indexOf('.') > -1) {
      const normalized = cleaned.replace(/\./g, '').replace(',', '.');
      const n = parseFloat(normalized);
      return isNaN(n) ? 0 : n;
    }
    // If only comma present, replace comma with dot
    if (cleaned.indexOf(',') > -1) {
      const normalized = cleaned.replace(/\./g, '').replace(',', '.');
      const n = parseFloat(normalized);
      return isNaN(n) ? 0 : n;
    }
    // Otherwise remove thousand separators (dots) and parse
    const normalized = cleaned.replace(/\./g, '');
    const n = parseFloat(normalized);
    return isNaN(n) ? 0 : n;
  } catch (_) {
    return 0;
  }
};

export const formatPrice = (price: number | string): string => {
  const value = parsePrice(price);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};
