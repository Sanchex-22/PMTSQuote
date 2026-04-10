import { useState, useContext } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import { CourseServices, Course, CourseFormData } from '../../../services/courses';
import Context from '../../../context/userContext';

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// --- Formulario ---
function CourseForm({ initial, onSubmit, onCancel }: {
  initial?: Partial<Course>;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onCancel: () => void;
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
    const { name, value } = e.target;
    const numeric = ['price_panamanian', 'price_panamanian_renewal', 'price_foreign', 'price_foreign_renewal'];
    setForm(prev => ({
      ...prev,
      [name]: numeric.includes(name) ? (value === '' ? null : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); } finally { setLoading(false); }
  };

  const priceFields = [
    { name: 'price_panamanian' as const, label: 'Precio panameño' },
    { name: 'price_panamanian_renewal' as const, label: 'Pan. renovación' },
    { name: 'price_foreign' as const, label: 'Precio extranjero' },
    { name: 'price_foreign_renewal' as const, label: 'Ext. renovación' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input name="name" required value={form.name} onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Abreviatura</label>
          <input name="abbr" value={form.abbr || ''} onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">N° IMO</label>
          <input name="imo_no" value={form.imo_no || ''} onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {priceFields.map(f => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input name={f.name} type="number" min="0" step="0.01" value={form[f.name] ?? ''} onChange={handleChange}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50">
          {loading ? 'Guardando...' : initial?.id ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}

// --- Paginación ---
function Pagination({ pagination, page, setPage }: {
  pagination: { total: number; page: number; limit: number; totalPages: number };
  page: number;
  setPage: (p: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => {
    const p = pagination.totalPages <= 10 ? i + 1 : Math.max(1, page - 4) + i;
    return p <= pagination.totalPages ? p : null;
  }).filter(Boolean) as number[];

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500">
        Mostrando {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)} de {pagination.total}
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
          className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => setPage(p)}
            className={`px-3 py-1 rounded border text-sm ${p === page ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page === pagination.totalPages}
          className="p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// --- Página principal ---
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CoursesAdmin() {
  const { jwt: rawJwt } = useContext(Context) as { jwt: string | null; setJWT: unknown };
  const jwt = rawJwt ? (() => { try { return JSON.parse(rawJwt)?.token || rawJwt; } catch { return rawJwt; } })() : '';

  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<PaginatedCourses>(
    `${API_URL}/api/courses/getAllCourses?page=${page}&limit=${LIMIT}`,
    fetcher
  );

  const courses = data?.data || [];
  const pagination = data?.pagination;
  const svc = new CourseServices(jwt);

  const handleCreate = async (formData: CourseFormData) => {
    try {
      await svc.createCourse(formData);
      toast.success('Curso creado correctamente');
      setShowCreate(false);
      mutate();
    } catch (e: any) {
      toast.error(e.message || 'Error al crear curso');
    }
  };

  const handleUpdate = async (formData: CourseFormData) => {
    if (!editCourse) return;
    try {
      await svc.updateCourse(editCourse.id, formData);
      toast.success('Curso actualizado correctamente');
      setEditCourse(null);
      mutate();
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar curso');
    }
  };

  const handleDelete = async () => {
    if (!deleteCourse) return;
    setDeleting(true);
    try {
      await svc.deleteCourse(deleteCourse.id);
      toast.success('Curso eliminado correctamente');
      setDeleteCourse(null);
      mutate();
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar curso');
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <p className="text-center py-8 text-red-600">Error al cargar cursos.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Cursos{pagination ? <span className="ml-2 text-sm font-normal text-gray-500">({pagination.total} total)</span> : null}
        </h2>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600">
          <Plus className="h-4 w-4" /> Nuevo curso
        </button>
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-gray-500">Cargando cursos...</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Abbr</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IMO</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Panameño</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pan. Ren.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Extranjero</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ext. Ren.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.length === 0 && (
                <tr><td colSpan={9} className="text-center py-8 text-gray-500">No hay cursos.</td></tr>
              )}
              {courses.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{(page - 1) * LIMIT + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[220px] truncate" title={c.name}>{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.abbr || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.imo_no || '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(c.price_panamanian)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(c.price_panamanian_renewal)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(c.price_foreign)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(c.price_foreign_renewal)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditCourse(c)} className="text-blue-500 hover:text-blue-700" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteCourse(c)} className="text-red-500 hover:text-red-700" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && <Pagination pagination={pagination} page={page} setPage={setPage} />}

      {showCreate && (
        <Modal title="Nuevo curso" onClose={() => setShowCreate(false)}>
          <CourseForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}
      {editCourse && (
        <Modal title="Editar curso" onClose={() => setEditCourse(null)}>
          <CourseForm initial={editCourse} onSubmit={handleUpdate} onCancel={() => setEditCourse(null)} />
        </Modal>
      )}
      {deleteCourse && (
        <Modal title="Eliminar curso" onClose={() => setDeleteCourse(null)}>
          <p className="text-gray-600 mb-4">
            ¿Seguro que deseas eliminar <strong>{deleteCourse.name}</strong>? Esta acción es irreversible.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteCourse(null)} className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
