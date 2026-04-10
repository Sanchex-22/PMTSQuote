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

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-red-100 text-red-800',
};
const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente', APPROVED: 'Aprobada', REJECTED: 'Rechazada', EXPIRED: 'Expirada',
};

export default function ClientsAdmin() {
  const [page, setPage] = useState(1);

  const { data, error, isLoading } = useSWR<PaginatedClients>(
    `${API_URL}/api/clients/getAll?page=${page}&limit=${LIMIT}`,
    fetcher
  );

  const clients = data?.data || [];
  const pagination = data?.pagination;

  if (error) return <p className="text-center py-8 text-red-600">Error al cargar clientes.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Clientes{pagination ? <span className="ml-2 text-sm font-normal text-gray-500">({pagination.total} total)</span> : null}
        </h2>
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-gray-500">Cargando clientes...</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cotizaciones</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última cotización</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">No hay clientes aún.</td>
                </tr>
              )}
              {clients.map((client, i) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * LIMIT + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{client.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{client.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                      {client.totalQuotes}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {client.lastQuote ? formatDate(client.lastQuote.createdAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {client.lastQuote ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[client.lastQuote.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[client.lastQuote.status] || client.lastQuote.status}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {client.lastQuote ? formatCurrency(client.lastQuote.quotedPrice) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(client.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/account/quotes?user=${client.id}`}
                      className="text-orange-500 hover:text-orange-700"
                      title="Ver cotizaciones"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Mostrando {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)} de {pagination.total} clientes
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => {
              const p = pagination.totalPages <= 10 ? i + 1 : Math.max(1, page - 4) + i;
              if (p > pagination.totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded border text-sm ${p === page ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              );
            })}
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
