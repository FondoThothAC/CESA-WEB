// Descarga documentos oficiales (.docx) con autenticación JWT vía blob
export type TipoDocumento = 'fp1' | 'fp2' | 'carta_tutor' | 'fpp3' | 'fpp4' | 'fpp5';

export async function downloadDocumento(
  apiUrl: string,
  token: string | null | undefined,
  action: TipoDocumento,
  params: Record<string, number | string>,
  fallbackName: string
): Promise<void> {
  const qs = new URLSearchParams({ action, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const res = await fetch(`${apiUrl}/documentos.php?${qs}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  });
  const ct = res.headers.get('content-type') || '';
  if (!res.ok || ct.includes('application/json')) {
    const data = await res.json().catch(() => ({ error: 'Error al generar el documento.' }));
    throw new Error(data.error || 'Error al generar el documento.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
