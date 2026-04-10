import { useState, useContext } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import { userServices, UserData, UserFormData } from '../../../services/userServices';
import Context from '../../../context/userContext';

const ROLES = ['CLIENT', 'SALES', 'ADMIN'];
const LIMIT = 50;

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  SALES: 'bg-blue-100 text-blue-800',
  CLIENT: 'bg-gray-100 text-gray-700',
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4">{children}</div>
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
    role: initial?.role || 'CLIENT',
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input name="email" type="email" required value={form.email} onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input name="name" type="text" value={form.name} onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
        <select name="role" value={form.role} onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
        </label>
        <input name="password" type="password" required={!isEdit} value={form.password} onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50">
          {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
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

export default function UsersAdmin() {
  const { jwt: rawJwt } = useContext(Context) as { jwt: string | null; setJWT: unknown };
  const jwt = rawJwt ? (() => { try { return JSON.parse(rawJwt)?.token || rawJwt; } catch { return rawJwt; } })() : '';

  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<PaginatedUsers>(
    `${API_URL}/api/user?page=${page}&limit=${LIMIT}`,
    fetcher
  );

  const users = data?.data || [];
  const pagination = data?.pagination;
  const svc = new userServices(jwt);

  const handleCreate = async (formData: UserFormData) => {
    try {
      await svc.createUser(formData);
      toast.success('Usuario creado correctamente');
      setShowCreate(false);
      mutate();
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Error al crear usuario');
    }
  };

  const handleUpdate = async (formData: UserFormData) => {
    if (!editUser) return;
    try {
      await svc.updateUser(editUser.id, formData);
      toast.success('Usuario actualizado correctamente');
      setEditUser(null);
      mutate();
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Error al actualizar usuario');
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await svc.deleteUser(deleteUser.id);
      toast.success('Usuario eliminado correctamente');
      setDeleteUser(null);
      mutate();
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <p className="text-center py-8 text-red-600">Error al cargar usuarios.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Usuarios{pagination ? <span className="ml-2 text-sm font-normal text-gray-500">({pagination.total} total)</span> : null}
        </h2>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-orange-500 text-white rounded-md hover:bg-orange-600">
          <Plus className="h-4 w-4" /> Nuevo usuario
        </button>
      </div>

      {isLoading ? (
        <p className="text-center py-8 text-gray-500">Cargando usuarios...</p>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No hay usuarios.</td></tr>
              )}
              {users.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-400 text-xs">{(page - 1) * LIMIT + i + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{u.name || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditUser(u)} className="text-blue-500 hover:text-blue-700" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteUser(u)} className="text-red-500 hover:text-red-700" title="Eliminar">
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
        <Modal title="Nuevo usuario" onClose={() => setShowCreate(false)}>
          <UserForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}
      {editUser && (
        <Modal title="Editar usuario" onClose={() => setEditUser(null)}>
          <UserForm initial={editUser} onSubmit={handleUpdate} onCancel={() => setEditUser(null)} isEdit />
        </Modal>
      )}
      {deleteUser && (
        <Modal title="Eliminar usuario" onClose={() => setDeleteUser(null)}>
          <p className="text-gray-600 mb-4">
            ¿Seguro que deseas eliminar a <strong>{deleteUser.name || deleteUser.email}</strong>? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeleteUser(null)} className="px-4 py-2 text-sm border rounded-md text-gray-600 hover:bg-gray-50">Cancelar</button>
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
