import { useState } from 'react';
import useSWR from 'swr';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;
const LIMIT = 50;

interface LastQuote {
  createdAt: string;
  quotedPrice: number;
  status: string;
}

interface Client {
  id: number;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  totalQuotes: number;
  lastQuote: LastQuote | null;
}

interface PaginatedClients {
  data: Client[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Pendiente', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  APPROVED: { label: 'Aprobada',  cls: 'bg-green-50 text-green-700 border border-green-200' },
  REJECTED: { label: 'Rechazada', cls: 'bg-red-50 text-red-700 border border-red-200' },
  EXPIRED:  { label: 'Expirada',  cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

export default function ClientsAdmin() {
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useSWR<PaginatedClients>(
    `${API_URL}/api/clients/getAll?page=${page}&limit=${LIMIT}`,
    fetcher
  );

  const clients = data?.data || [];
  const pagination = data?.pagination;

  if (error) return <p className="text-center py-8 text-red-500 text-sm">Error al cargar clientes.</p>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Clientes</h1>
          {pagination && <p className="text-sm text-gray-400 mt-0.5">{pagination.total} clientes registrados</p>}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Cargando clientes...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Cotizaciones</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Última cotización</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registro</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">No hay clientes aún.</td>
                  </tr>
                )}
                {clients.map((client, i) => {
                  const status = client.lastQuote ? STATUS_MAP[client.lastQuote.status] : null;
                  return (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{(page - 1) * LIMIT + i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(client.name || client.email).slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{client.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{client.email}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-200">
                          {client.totalQuotes}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                        {client.lastQuote ? formatDate(client.lastQuote.createdAt) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        {status ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${status.cls}`}>
                            {status.label}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-gray-800 whitespace-nowrap">
                        {client.lastQuote ? formatCurrency(client.lastQuote.quotedPrice) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">{formatDate(client.createdAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/account/quotes?user=${client.id}`}
                          className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 font-medium transition">
                          Ver <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación — siempre visible */}
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
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed ${p === page ? 'bg-orange-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40'}`}>
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
    </div>
  );
}
