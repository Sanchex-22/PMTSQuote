import { useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { toast } from 'sonner';
import { ArrowLeft, Send, Save, ChevronDown, Trash2 } from 'lucide-react';
import UserProfileContext from '../../../../context/userProfileContext';
import Context from '../../../../context/userContext';

const { VITE_API_URL } = import.meta.env;

interface CourseInfo { id: number; name: string; abbr: string | null; imo_no: string | null; }
interface QuoteCourse { id: number; type: string; basePrice: number; surcharge: number; course: CourseInfo; }
interface UserInfo { id: number; name: string | null; email: string; }
interface Quote {
  id: number; createdAt: string; expiresAt: string; quotedPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  government: string | null; user: UserInfo; courses: QuoteCourse[];
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const formatQuoteId = (id: number) => `PMTS/Q/${id.toString().padStart(4, '0')}`;

const STATUS_MAP = {
  PENDING:  { label: 'Pendiente', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
  APPROVED: { label: 'Aprobada',  cls: 'bg-green-50 text-green-700 border border-green-200' },
  REJECTED: { label: 'Rechazada', cls: 'bg-red-50 text-red-700 border border-red-200' },
  EXPIRED:  { label: 'Expirada',  cls: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useContext(UserProfileContext)!;
  const { jwt: rawJwt } = useContext(Context) as { jwt: string | null; setJWT: unknown };
  const jwt = rawJwt ? (() => { try { return JSON.parse(rawJwt)?.token || rawJwt; } catch { return rawJwt; } })() : '';

  const isAdmin = profile?.roles === 'admin' || profile?.roles === 'super_admin' || profile?.roles === 'moderator';
  const isSuperAdmin = profile?.roles === 'admin' || profile?.roles === 'super_admin';

  const { data: quote, error, isLoading, mutate } = useSWR<Quote>(
    `${VITE_API_URL}/api/quotations/quote/${id}/get`,
    fetcher
  );

  const [editStatus, setEditStatus] = useState<string>('');
  const [editPrice, setEditPrice] = useState<string>('');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<null | 'soft' | 'hard'>(null);
  const [deleting, setDeleting] = useState(false);

  const effectiveStatus = (editStatus || quote?.status || 'PENDING') as keyof typeof STATUS_MAP;
  const effectivePrice = editPrice !== '' ? parseFloat(editPrice) : (quote?.quotedPrice ?? 0);

  const handleSave = async (resendEmail = false) => {
    if (!quote) return;
    if (resendEmail) setResending(true); else setSaving(true);
    try {
      const body: any = {};
      if (editStatus && editStatus !== quote.status) body.status = editStatus;
      if (editPrice !== '' && parseFloat(editPrice) !== quote.quotedPrice) body.quotedPrice = parseFloat(editPrice);
      if (resendEmail) { body.resendEmail = true; if (adminNote.trim()) body.adminNote = adminNote.trim(); }

      const res = await fetch(`${VITE_API_URL}/api/quotations/quote/${quote.id}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error'); }
      toast.success(resendEmail ? 'Cotización actualizada y correo reenviado' : 'Cotización actualizada');
      setEditStatus('');
      setEditPrice('');
      setAdminNote('');
      setEditOpen(false);
      mutate();
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar');
    } finally {
      setSaving(false);
      setResending(false);
    }
  };

  const hasChanges = (editStatus && editStatus !== quote?.status) || (editPrice !== '' && parseFloat(editPrice) !== quote?.quotedPrice);

  const handleDelete = async (hard: boolean) => {
    if (!quote) return;
    setDeleting(true);
    try {
      const url = `${VITE_API_URL}/api/quotations/quote/${quote.id}/delete${hard ? '?hard=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${jwt}` } });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error'); }
      toast.success(hard ? 'Cotización eliminada permanentemente' : 'Cotización eliminada');
      navigate('/account/quotes');
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando cotización...</p>
    </div>
  );

  if (error || !quote?.id) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
      <p className="text-gray-600 font-medium">Cotización no encontrada</p>
      <Link to="/account/quotes" className="text-sm text-orange-500 hover:text-orange-700">← Volver al listado</Link>
    </div>
  );

  const status = STATUS_MAP[quote.status] || STATUS_MAP.PENDING;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Back + header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link to="/account/quotes"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition mb-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Volver al listado
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">{formatQuoteId(quote.id)}</h1>
            <p className="text-sm text-gray-400 mt-0.5">Creada el {formatDate(quote.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_MAP[effectiveStatus]?.cls || status.cls}`}>
              {STATUS_MAP[effectiveStatus]?.label || status.label}
            </span>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditOpen(o => !o)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                  Editar <ChevronDown className={`h-3.5 w-3.5 transition-transform ${editOpen ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={() => setConfirmDelete('soft')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition">
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Admin edit panel */}
        {isAdmin && editOpen && (
          <div className="bg-white rounded-xl border border-orange-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Editar cotización</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Estado</label>
                <select
                  value={editStatus || quote.status}
                  onChange={e => setEditStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="APPROVED">Aprobada</option>
                  <option value="REJECTED">Rechazada</option>
                  <option value="EXPIRED">Expirada</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Precio total (USD)</label>
                <input
                  type="number" min="0" step="0.01"
                  value={editPrice !== '' ? editPrice : quote.quotedPrice}
                  onChange={e => setEditPrice(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Nota para el cliente <span className="text-gray-400 font-normal normal-case">(aparece en el correo al reenviar)</span>
              </label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={2}
                placeholder="Ej: Hemos actualizado su cotización con los cambios solicitados..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => { setEditOpen(false); setEditStatus(''); setEditPrice(''); setAdminNote(''); }}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={() => handleSave(false)} disabled={saving || !hasChanges}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <Save className="h-3.5 w-3.5" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => handleSave(true)} disabled={resending}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium">
                <Send className="h-3.5 w-3.5" />
                {resending ? 'Enviando...' : 'Guardar y reenviar correo'}
              </button>
            </div>
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Solicitante</h2>
            <div className="space-y-1.5 text-sm">
              <p className="font-medium text-gray-800">{quote.user.name || '—'}</p>
              <p className="text-gray-500">{quote.user.email}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Resumen</h2>
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between"><span>Creación</span><span className="font-medium text-gray-800">{formatDate(quote.createdAt)}</span></div>
              <div className="flex justify-between"><span>Vencimiento</span><span className="font-medium text-gray-800">{formatDate(quote.expiresAt)}</span></div>
              <div className="flex justify-between"><span>Gobierno</span><span className="font-medium text-gray-800 capitalize">{quote.government || '—'}</span></div>
            </div>
          </div>
        </div>

        {/* Courses table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Cursos incluidos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Curso</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio base</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Gov. fee</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quote.courses.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{item.course.name}</td>
                    <td className="px-5 py-3.5 text-gray-500 capitalize">{item.type === 'new' ? 'Nuevo' : 'Renovación'}</td>
                    <td className="px-5 py-3.5 text-right text-gray-600">{formatCurrency(item.basePrice)}</td>
                    <td className="px-5 py-3.5 text-right text-gray-600">{formatCurrency(item.surcharge)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-800">{formatCurrency(item.basePrice + item.surcharge)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={4} className="px-5 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</td>
                  <td className="px-5 py-4 text-right font-bold text-base text-gray-900">
                    {formatCurrency(effectivePrice)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmDelete && quote && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-800">
              {confirmDelete === 'hard' ? 'Eliminar permanentemente' : 'Eliminar cotización'}
            </h3>
            <p className="text-sm text-gray-600">
              {confirmDelete === 'hard'
                ? <>¿Eliminar <strong>{formatQuoteId(quote.id)}</strong> de forma <strong className="text-red-600">permanente</strong>? Se borrarán también todos los items de curso asociados. Esta acción no se puede deshacer.</>
                : <>¿Eliminar <strong>{formatQuoteId(quote.id)}</strong>? La cotización quedará oculta pero sus datos se conservarán en la base de datos.</>
              }
            </p>
            {isSuperAdmin && confirmDelete === 'soft' && (
              <button onClick={() => setConfirmDelete('hard')}
                className="text-xs text-red-400 hover:text-red-600 underline transition">
                Eliminar permanentemente en su lugar
              </button>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete === 'hard')} disabled={deleting}
                className={`px-4 py-2 text-sm rounded-lg font-medium text-white transition disabled:opacity-50 ${confirmDelete === 'hard' ? 'bg-red-700 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'}`}>
                {deleting ? 'Eliminando...' : confirmDelete === 'hard' ? 'Eliminar permanentemente' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
