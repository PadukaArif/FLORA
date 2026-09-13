export function fmt(n: any, d: number = 1): string {
  const num = Number(n);
  return Number.isFinite(num) ? num.toFixed(d) : '—';
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return '—';
  }
}
