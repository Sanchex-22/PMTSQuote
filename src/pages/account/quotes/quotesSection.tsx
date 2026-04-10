import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
const generateDescription = (courses: QuoteCourse[]) => {
  if (!courses?.length) return 'Sin cursos';
  const names = courses.map(qc => qc.course.name);
  return names.slice(0, 2).join(', ') + (names.length > 2 ? '...' : '');
};
const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const translateStatus = (s: Quote['status']) => ({ PENDING: 'Pendiente', APPROVED: 'Aprobada', REJECTED: 'Rechazada', EXPIRED: 'Expirada' }[s] || 'Desconocido');
const getStatusClass = (s: Quote['status']) => {
  switch (s) {
    case 'APPROVED': return 'bg-green-100 text-green-800';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'REJECTED': case 'EXPIRED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const LIMIT = 10;
const fetcher = (url: string) => fetch(url).then(r => r.json());

export function QuotesSection() {
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useSWR<PaginatedResponse | Quote[]>(
    `${VITE_API_URL}/api/quotations/all/getAll?page=${page}&limit=${LIMIT}`,
    fetcher
  );

  // Soporta tanto el formato paginado { data, pagination } como el array directo (backend viejo)
  const quotes: Quote[] = Array.isArray(data) ? data : (data?.data || []);
  const pagination = Array.isArray(data) ? null : data?.pagination;

  if (error) return <p className="text-center p-8 text-red-600">Error al cargar los datos.</p>;
  if (isLoading) return <p className="text-center p-8">Cargando cotizaciones...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Historial de Cotizaciones</h2>
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 relative"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-500">No se encontraron cotizaciones.</td></tr>
            )}
            {quotes.map(quote => (
              <tr key={quote.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{formatQuoteId(quote.id)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">{quote.user.name || quote.user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{generateDescription(quote.courses)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(quote.createdAt)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatCurrency(quote.quotedPrice)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(quote.status)}`}>
                    {translateStatus(quote.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/account/quotes/${quote.id}`} className="text-orange-600 hover:text-orange-900">Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Mostrando {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)} de {pagination.total} cotizaciones
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded border text-sm ${p === page ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
