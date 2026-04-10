import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, ExternalLink, Trash2 } from 'lucide-react';
import UserProfileContext from '../../../context/userProfileContext';
import Context from '../../../context/userContext';

const { VITE_API_URL } = import.meta.env;

interface CourseInfo { id: number; name: string; abbr: string | null; imo_no: string | null; }
interface QuoteCourse { id: number; type: string; basePrice: number; surcharge: number; course: CourseInfo; }
interface UserInfo { id: number; name: string | null; email: string; }
interface Quote {
  id: number; createdAt: string; quotedPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  user: UserInfo; courses: QuoteCourse[];
}
interface PaginatedResponse {
  data: Quote[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const formatQuoteId = (id: number) => `PMTS/Q/${id.toString().padStart(4, '0')}`;
const formatDate = (iso: string) => {
  const opts = { timeZone: 'America/Panama' };
  const d = new Date(iso);
  const date = d.toLocaleDateString('es-ES', { ...opts, day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('es-ES', { ...opts, hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
};
const generateDescription = (courses: QuoteCourse[]) => {
  if (!courses?.length) return 'Sin cursos';
  const names = courses.map(qc => qc.course.name);
  return names.slice(0, 2).join(', ') + (names.length > 2 ? '...' : '');
};
const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Pendiente', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  APPROVED: { label: 'Aprobada',  cls: 'bg-green-50 text-green-700 border border-green-200' },
  REJECTED: { label: 'Rechazada', cls: 'bg-red-50 text-red-700 border border-red-200' },
  EXPIRED:  { label: 'Expirada',  cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

const LIMIT = 10;
const fetcher = (url: string) => fetch(url).then(r => r.json());

export function QuotesSection() {
  const [page, setPage] = useState(1);
  const { profile } = useContext(UserProfileContext)!;
  const { jwt: rawJwt } = useContext(Context) as { jwt: string | null; setJWT: unknown };
  const jwt = rawJwt ? (() => { try { return JSON.parse(rawJwt)?.token || rawJwt; } catch { return rawJwt; } })() : '';
  const isAdmin = profile?.roles === 'admin' || profile?.roles === 'super_admin' || profile?.roles === 'moderator';
  const [deleteTarget, setDeleteTarget] = useState<Quote | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse | Quote[]>(
    `${VITE_API_URL}/api/quotations/all/getAll?page=${page}&limit=${LIMIT}`,
    fetcher
  );

  const quotes: Quote[] = Array.isArray(data) ? data : (data?.data || []);
  const pagination = Array.isArray(data) ? null : (data as PaginatedResponse)?.pagination;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${VITE_API_URL}/api/quotations/quote/${deleteTarget.id}/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error'); }
      toast.success('Cotización eliminada');
      setDeleteTarget(null);
      mutate();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Cotizaciones</h1>
          {pagination && (
            <p className="text-sm text-gray-400 mt-0.5">{pagination.total} registros en total</p>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {error && (
          <div className="px-6 py-8 text-center text-red-500 text-sm">Error al cargar los datos.</div>
        )}
        {isLoading && (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">Cargando cotizaciones...</div>
        )}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Solicitante</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cursos</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">No se encontraron cotizaciones.</td>
                  </tr>
                )}
                {quotes.map(quote => {
                  const status = STATUS_MAP[quote.status] || { label: quote.status, cls: 'bg-gray-100 text-gray-500' };
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-gray-700">{formatQuoteId(quote.id)}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-800">{quote.user.name || '—'}</div>
                        <div className="text-xs text-gray-400">{quote.user.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 max-w-[200px] truncate">{generateDescription(quote.courses)}</td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(quote.createdAt)}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-gray-800 whitespace-nowrap">{formatCurrency(quote.quotedPrice)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/account/quotes/${quote.id}`}
                            className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 font-medium transition">
                            Ver <ExternalLink className="h-3 w-3" />
                          </Link>
                          {isAdmin && (
                            <button onClick={() => setDeleteTarget(quote)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Eliminar">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación — siempre visible cuando hay datos */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)} de {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages || 1, 7) }, (_, i) => {
              const total = pagination.totalPages || 1;
              const p = total <= 7 ? i + 1 : Math.max(1, page - 3) + i;
              if (p > total) return null;
              return (
                <button key={p} onClick={() => setPage(p)} disabled={total <= 1}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed
                    ${p === page ? 'bg-orange-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages || (pagination.totalPages || 1) <= 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-800">Eliminar cotización</h3>
            <p className="text-sm text-gray-600">
              ¿Eliminar <strong>{formatQuoteId(deleteTarget.id)}</strong>? La cotización quedará oculta pero sus datos se conservarán en la base de datos.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium transition">
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
