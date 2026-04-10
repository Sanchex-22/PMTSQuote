import { useState, useContext } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import { userServices, UserData, UserFormData } from '../../../services/userServices';
import Context from '../../../context/userContext';

const ROLES = ['SALES', 'ADMIN'];
const LIMIT = 50;

const roleStyle: Record<string, string> = {
  ADMIN: 'bg-purple-50 text-purple-700 border border-purple-200',
  SALES: 'bg-blue-50 text-blue-700 border border-blue-200',
};
const roleLabel: Record<string, string> = {
  ADMIN: 'Administrador',
  SALES: 'Moderador',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

const API_URL = import.meta.env.VITE_API_URL;

interface PaginatedUsers {
  data: UserData[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// --- Modal ---
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
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
function UserForm({ initial, onSubmit, onCancel, isEdit }: {
  initial?: Partial<UserFormData & { id: number }>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}) {
  const [form, setForm] = useState<UserFormData>({
    email: initial?.email || '',
    name: initial?.name || '',
    role: initial?.role || 'SALES',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      await onSubmit(payload);
    } finally { setLoading(false); }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email *</label>
        <input name="email" type="email" required value={form.email} onChange={handleChange} className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nombre</label>
        <input name="name" type="text" value={form.name} onChange={handleChange} className={inputClass} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Rol</label>
        <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
          {ROLES.map(r => <option key={r} value={r}>{roleLabel[r] || r}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
          {isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
        </label>
        <input name="password" type="password" required={!isEdit} value={form.password} onChange={handleChange} className={inputClass} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition font-medium">
          {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
}

// --- Paginación ---
function Pagination({ pagination, page, setPage }: {
  pagination: PaginatedUsers['pagination']; page: number; setPage: (p: number) => void;
}) {
  const pages = Array.from({ length: Math.min(pagination.totalPages || 1, 7) }, (_, i) => {
    const p = (pagination.totalPages || 1) <= 7 ? i + 1 : Math.max(1, page - 3) + i;
    return p <= (pagination.totalPages || 1) ? p : null;
  }).filter(Boolean) as number[];
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-400">{(page-1)*LIMIT+1}–{Math.min(page*LIMIT,pagination.total)} de {pagination.total}</p>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage(Math.max(1,page-1))} disabled={page===1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="h-4 w-4"/>
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => setPage(p)} disabled={pagination.totalPages <= 1}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${p===page?'bg-orange-500 text-white':'border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => setPage(Math.min(pagination.totalPages,page+1))} disabled={page===pagination.totalPages||pagination.totalPages<=1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="h-4 w-4"/>
        </button>
      </div>
    </div>
  );
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function UsersAdmin() {
  const { jwt: rawJwt } = useContext(Context) as { jwt: string | null; setJWT: unknown };
  const jwt = rawJwt ? (() => { try { return JSON.parse(rawJwt)?.token || rawJwt; } catch { return rawJwt; } })() : '';

  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<PaginatedUsers>(
    `${API_URL}/api/user?page=${page}&limit=${LIMIT}`, fetcher
  );

  const users = data?.data || [];
  const pagination = data?.pagination;
  const svc = new userServices(jwt);

  const handleCreate = async (fd: UserFormData) => {
    try { await svc.createUser(fd); toast.success('Usuario creado'); setShowCreate(false); mutate(); }
    catch (e: any) { toast.error(e.response?.data?.message || e.message); }
  };
  const handleUpdate = async (fd: UserFormData) => {
    if (!editUser) return;
    try { await svc.updateUser(editUser.id, fd); toast.success('Usuario actualizado'); setEditUser(null); mutate(); }
    catch (e: any) { toast.error(e.response?.data?.message || e.message); }
  };
  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try { await svc.deleteUser(deleteUser.id); toast.success('Usuario eliminado'); setDeleteUser(null); mutate(); }
    catch (e: any) { toast.error(e.response?.data?.message || e.message); }
    finally { setDeleting(false); }
  };

  if (error) return <p className="text-center py-8 text-red-500 text-sm">Error al cargar usuarios.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Usuarios del panel</h1>
          {pagination && <p className="text-sm text-gray-400 mt-0.5">{pagination.total} usuarios registrados</p>}
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition shadow-sm">
          <Plus className="h-4 w-4" /> Nuevo usuario
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Creado</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No hay usuarios.</td></tr>
                )}
                {users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{(page-1)*LIMIT+i+1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(u.name || u.email).slice(0,2).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{u.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${roleStyle[u.role] || 'bg-gray-100 text-gray-600'}`}>
                        {roleLabel[u.role] || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => setEditUser(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Editar">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteUser(u)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition" title="Eliminar">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && <Pagination pagination={pagination} page={page} setPage={setPage} />}

      {showCreate && <Modal title="Nuevo usuario" onClose={() => setShowCreate(false)}>
        <UserForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>}
      {editUser && <Modal title="Editar usuario" onClose={() => setEditUser(null)}>
        <UserForm initial={{ ...editUser, name: editUser.name ?? undefined }} onSubmit={handleUpdate} onCancel={() => setEditUser(null)} isEdit />
      </Modal>}
      {deleteUser && <Modal title="Eliminar usuario" onClose={() => setDeleteUser(null)}>
        <p className="text-sm text-gray-600 mb-5">
          ¿Eliminar a <strong className="text-gray-800">{deleteUser.name || deleteUser.email}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteUser(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium">
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </Modal>}
    </div>
  );
}
