import { useState, useContext, useMemo } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import useSWR from 'swr';
import { CourseServices, Course, CourseFormData } from '../../../services/courses';
import Context from '../../../context/userContext';
import UserProfileContext from '../../../context/userProfileContext';

const API_URL = import.meta.env.VITE_API_URL;
const LIMIT = 50;

const formatCurrency = (v: number | null) =>
  v != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v) : '—';

interface PaginatedCourses {
  data: Course[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// --- Modal ---
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// --- Formulario ---
function CourseForm({ initial, onSubmit, onCancel, readOnly }: {
  initial?: Partial<Course>;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel: () => void;
  readOnly?: boolean;
}) {
  const [form, setForm] = useState<CourseFormData>({
    name: initial?.name || '',
    abbr: initial?.abbr || '',
    imo_no: initial?.imo_no || '',
    price_panamanian: initial?.price_panamanian ?? null,
    price_panamanian_renewal: initial?.price_panamanian_renewal ?? null,
    price_foreign: initial?.price_foreign ?? null,
    price_foreign_renewal: initial?.price_foreign_renewal ?? null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const { name, value } = e.target;
    const numeric = ['price_panamanian', 'price_panamanian_renewal', 'price_foreign', 'price_foreign_renewal'];
    setForm(prev => ({
      ...prev,
      [name]: numeric.includes(name) ? (value === '' ? null : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    setLoading(true);
    try { await onSubmit(form); } finally { setLoading(false); }
  };

  const priceFields = [
    { name: 'price_panamanian' as const, label: 'Precio panameño' },
    { name: 'price_panamanian_renewal' as const, label: 'Pan. renovación' },
    { name: 'price_foreign' as const, label: 'Precio extranjero' },
    { name: 'price_foreign_renewal' as const, label: 'Ext. renovación' },
  ];

  const inputClass = `w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 transition
    ${readOnly
      ? 'border-gray-200 bg-gray-50 text-gray-600 cursor-default'
      : 'border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nombre *</label>
        <input name="name" required value={form.name} onChange={handleChange} readOnly={readOnly} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Abreviatura</label>
          <input name="abbr" value={form.abbr || ''} onChange={handleChange} readOnly={readOnly} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">N° IMO</label>
          <input name="imo_no" value={form.imo_no || ''} onChange={handleChange} readOnly={readOnly} className={inputClass} />
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Precios</p>
        <div className="grid grid-cols-2 gap-3">
          {priceFields.map(f => (
            <div key={f.name}>
              <label className="block text-xs text-gray-500 mb-1.5">{f.label}</label>
              <input name={f.name} type="number" min="0" step="0.01"
                value={form[f.name] ?? ''} onChange={handleChange}
                readOnly={readOnly} placeholder="0.00" className={inputClass} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
          {readOnly ? 'Cerrar' : 'Cancelar'}
        </button>
        {!readOnly && (
          <button type="submit" disabled={loading}
            className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition font-medium">
            {loading ? 'Guardando...' : initial?.id ? 'Actualizar' : 'Crear'}
          </button>
        )}
      </div>
    </form>
  );
}

// --- Paginación ---
function Pagination({ pagination, page, setPage }: {
  pagination: PaginatedCourses['pagination'];
  page: number;
  setPage: (p: number) => void;
}) {
  const total = pagination.totalPages || 1;
  const pages = Array.from({ length: Math.min(total, 7) }, (_, i) => {
    const p = total <= 7 ? i + 1 : Math.max(1, page - 3) + i;
    return p <= total ? p : null;
  }).filter(Boolean) as number[];

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-400">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)} de {pagination.total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => setPage(p)} disabled={total <= 1}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed ${p === page ? 'bg-orange-500 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => setPage(Math.min(total, page + 1))} disabled={page === total || total <= 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CoursesAdmin() {
  const { jwt: rawJwt } = useContext(Context) as { jwt: string | null; setJWT: unknown };
  const jwt = rawJwt ? (() => { try { return JSON.parse(rawJwt)?.token || rawJwt; } catch { return rawJwt; } })() : '';

  const { profile } = useContext(UserProfileContext)!;
  const isAdmin = profile?.roles === 'admin' || profile?.roles === 'super_admin';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [viewCourse, setViewCourse] = useState<Course | null>(null);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<PaginatedCourses>(
    `${API_URL}/api/courses/getAllCourses?page=${page}&limit=${LIMIT}`,
    fetcher
  );

  const allCourses = data?.data || [];
  const pagination = data?.pagination;
  const svc = new CourseServices(jwt);

  const courses = useMemo(() => {
    if (!search.trim()) return allCourses;
    const q = search.toLowerCase();
    return allCourses.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.abbr || '').toLowerCase().includes(q) ||
      (c.imo_no || '').toLowerCase().includes(q)
    );
  }, [allCourses, search]);

  const handleCreate = async (formData: CourseFormData) => {
    try {
      await svc.createCourse(formData);
      toast.success('Curso creado correctamente');
      setShowCreate(false);
      mutate();
    } catch (e: any) { toast.error(e.message || 'Error al crear curso'); }
  };

  const handleUpdate = async (formData: CourseFormData) => {
    if (!editCourse) return;
    try {
      await svc.updateCourse(editCourse.id, formData);
      toast.success('Curso actualizado correctamente');
      setEditCourse(null);
      mutate();
    } catch (e: any) { toast.error(e.message || 'Error al actualizar curso'); }
  };

  const handleDelete = async () => {
    if (!deleteCourse) return;
    setDeleting(true);
    try {
      await svc.deleteCourse(deleteCourse.id);
      toast.success('Curso eliminado correctamente');
      setDeleteCourse(null);
      mutate();
    } catch (e: any) { toast.error(e.message || 'Error al eliminar curso'); }
    finally { setDeleting(false); }
  };

  if (error) return <p className="text-center py-8 text-red-500 text-sm">Error al cargar cursos.</p>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Cursos</h1>
          {pagination && <p className="text-sm text-gray-400 mt-0.5">{pagination.total} cursos registrados</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, abrev. o IMO..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent w-64"
            />
          </div>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition shadow-sm whitespace-nowrap">
              <Plus className="h-4 w-4" /> Nuevo curso
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Cargando cursos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Abbr</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IMO</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Panameño</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Pan. Ren.</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Extranjero</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ext. Ren.</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">
                    {search ? 'No se encontraron cursos con ese criterio.' : 'No hay cursos.'}
                  </td></tr>
                )}
                {courses.map((c, i) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{(page - 1) * LIMIT + i + 1}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800 max-w-[220px] truncate" title={c.name}>{c.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{c.abbr || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500">{c.imo_no || '—'}</td>
                    <td className="px-5 py-3.5 text-right text-gray-700 font-medium">{formatCurrency(c.price_panamanian)}</td>
                    <td className="px-5 py-3.5 text-right text-gray-500">{formatCurrency(c.price_panamanian_renewal)}</td>
                    <td className="px-5 py-3.5 text-right text-gray-700 font-medium">{formatCurrency(c.price_foreign)}</td>
                    <td className="px-5 py-3.5 text-right text-gray-500">{formatCurrency(c.price_foreign_renewal)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setEditCourse(c)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {isAdmin && (
                          <button onClick={() => setDeleteCourse(c)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Eliminar">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!search && pagination && <Pagination pagination={pagination} page={page} setPage={setPage} />}
      {search && courses.length > 0 && (
        <p className="text-xs text-gray-400">{courses.length} resultado{courses.length !== 1 ? 's' : ''} en esta página</p>
      )}

      {showCreate && isAdmin && (
        <Modal title="Nuevo curso" onClose={() => setShowCreate(false)}>
          <CourseForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}

      {editCourse && (
        <Modal title={isAdmin ? 'Editar curso' : 'Editar precios'} onClose={() => setEditCourse(null)}>
          <CourseForm initial={editCourse} onSubmit={handleUpdate} onCancel={() => setEditCourse(null)} />
        </Modal>
      )}

      {viewCourse && !isAdmin && (
        <Modal title="Detalle del curso" onClose={() => setViewCourse(null)}>
          <CourseForm initial={viewCourse} onSubmit={async () => {}} onCancel={() => setViewCourse(null)} readOnly />
        </Modal>
      )}

      {deleteCourse && isAdmin && (
        <Modal title="Eliminar curso" onClose={() => setDeleteCourse(null)}>
          <p className="text-sm text-gray-600 mb-5">
            ¿Eliminar <strong className="text-gray-800">{deleteCourse.name}</strong>? Esta acción es irreversible.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteCourse(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
